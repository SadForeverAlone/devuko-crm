import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type DockerContainer = {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "running" | "stopped" | "other";
  ports: string;
  createdAt: string;
};

export type DockerVolume = {
  name: string;
  driver: string;
  mountpoint: string;
};

export type DockerNetwork = {
  id: string;
  name: string;
  driver: string;
  scope: string;
};

export type DockerImage = {
  id: string;
  repository: string;
  tag: string;
  size: string;
  createdSince: string;
};

export type DockerMetrics = {
  available: boolean;
  containers: DockerContainer[];
  runningCount: number;
  stoppedCount: number;
  imageCount: number;
  volumes: DockerVolume[];
  networks: DockerNetwork[];
  images: DockerImage[];
};

function parseContainerState(status: string): DockerContainer["state"] {
  const normalized = status.toLowerCase();
  if (normalized.includes("up")) return "running";
  if (normalized.includes("exited") || normalized.includes("created")) return "stopped";
  return "other";
}

function parseVolumes(raw: string): DockerVolume[] {
  return raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name = "", driver = ""] = line.split("\t");
      return { name, driver, mountpoint: "" };
    });
}

function parseNetworks(raw: string): DockerNetwork[] {
  return raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id = "", name = "", driver = "", scope = ""] = line.split("\t");
      return { id, name, driver, scope };
    });
}

function parseImages(raw: string): DockerImage[] {
  return raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id = "", repository = "", tag = "", size = "", createdSince = ""] = line.split("\t");
      return { id, repository, tag, size, createdSince };
    });
}

async function enrichVolumeMountpoints(volumes: DockerVolume[]) {
  if (volumes.length === 0) return volumes;

  try {
    const names = volumes.slice(0, 64).map((volume) => volume.name);
    const { stdout } = await execFileAsync(
      "docker",
      ["volume", "inspect", "--format", "{{.Name}}\t{{.Mountpoint}}", ...names],
      { timeout: 10000 }
    );

    const mountpoints = new Map<string, string>();
    for (const line of stdout.trim().split("\n").filter(Boolean)) {
      const [name = "", mountpoint = ""] = line.split("\t");
      if (name) mountpoints.set(name, mountpoint);
    }

    return volumes.map((volume) => ({
      ...volume,
      mountpoint: mountpoints.get(volume.name) ?? volume.mountpoint,
    }));
  } catch {
    return volumes;
  }
}

export async function readDockerMetrics(): Promise<DockerMetrics> {
  const empty: DockerMetrics = {
    available: false,
    containers: [],
    runningCount: 0,
    stoppedCount: 0,
    imageCount: 0,
    volumes: [],
    networks: [],
    images: [],
  };

  try {
    const [psResult, volumesResult, networksResult, imagesResult] = await Promise.all([
      execFileAsync(
        "docker",
        ["ps", "-a", "--format", "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"],
        { timeout: 8000 }
      ),
      execFileAsync("docker", ["volume", "ls", "--format", "{{.Name}}\t{{.Driver}}"], { timeout: 8000 }).catch(
        () => ({ stdout: "" })
      ),
      execFileAsync(
        "docker",
        ["network", "ls", "--format", "{{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"],
        { timeout: 8000 }
      ).catch(() => ({ stdout: "" })),
      execFileAsync(
        "docker",
        ["images", "--format", "{{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"],
        { timeout: 8000 }
      ).catch(() => ({ stdout: "" })),
    ]);

    const containers: DockerContainer[] = psResult.stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [id = "", name = "", image = "", status = "", ports = "", createdAt = ""] = line.split("\t");
        const state = parseContainerState(status);
        return { id, name, image, status, state, ports, createdAt };
      });

    const volumes = await enrichVolumeMountpoints(parseVolumes(volumesResult.stdout));
    const networks = parseNetworks(networksResult.stdout);
    const images = parseImages(imagesResult.stdout);

    return {
      available: true,
      containers,
      runningCount: containers.filter((container) => container.state === "running").length,
      stoppedCount: containers.filter((container) => container.state === "stopped").length,
      imageCount: images.length,
      volumes,
      networks,
      images,
    };
  } catch {
    return empty;
  }
}
