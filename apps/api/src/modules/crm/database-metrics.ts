import type { DatabaseService } from "../database/database.service";
import type { DockerContainer } from "./docker-metrics";

export type PlatformDatabaseStats = {
  available: boolean;
  engine: string;
  version: string;
  database: string;
  sizeMb: number;
  connections: number;
};

export type DatabaseInstance = {
  id: string;
  name: string;
  engine: string;
  image: string;
  state: DockerContainer["state"];
  ports: string;
};

const DB_IMAGE_HINTS = ["postgres", "mysql", "mariadb", "mongo", "redis"];

function detectEngine(image: string, name: string) {
  const haystack = `${image} ${name}`.toLowerCase();
  if (haystack.includes("postgres")) return "PostgreSQL";
  if (haystack.includes("mariadb")) return "MariaDB";
  if (haystack.includes("mysql")) return "MySQL";
  if (haystack.includes("mongo")) return "MongoDB";
  if (haystack.includes("redis")) return "Redis";
  return "Database";
}

export function discoverDatabaseInstances(containers: DockerContainer[]): DatabaseInstance[] {
  return containers
    .filter((container) => {
      const haystack = `${container.image} ${container.name}`.toLowerCase();
      return DB_IMAGE_HINTS.some((hint) => haystack.includes(hint));
    })
    .map((container) => ({
      id: container.id,
      name: container.name,
      engine: detectEngine(container.image, container.name),
      image: container.image,
      state: container.state,
      ports: container.ports,
    }));
}

export async function readPlatformDatabaseStats(db: DatabaseService): Promise<PlatformDatabaseStats> {
  const unavailable: PlatformDatabaseStats = {
    available: false,
    engine: "PostgreSQL",
    version: "—",
    database: "—",
    sizeMb: 0,
    connections: 0,
  };

  try {
    const [versionResult, sizeResult, connectionsResult, databaseResult] = await Promise.all([
      db.query<{ version: string }>("SELECT version() AS version"),
      db.query<{ size_mb: string }>(
        "SELECT ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 1)::text AS size_mb"
      ),
      db.query<{ connections: string }>("SELECT COUNT(*)::text AS connections FROM pg_stat_activity"),
      db.query<{ database: string }>("SELECT current_database() AS database"),
    ]);

    const version = versionResult.rows[0]?.version ?? "—";
    const shortVersion = version.includes("PostgreSQL") ? version.split(" on ")[0] ?? version : version;

    return {
      available: true,
      engine: "PostgreSQL",
      version: shortVersion,
      database: databaseResult.rows[0]?.database ?? "—",
      sizeMb: Number.parseFloat(sizeResult.rows[0]?.size_mb ?? "0") || 0,
      connections: Number.parseInt(connectionsResult.rows[0]?.connections ?? "0", 10) || 0,
    };
  } catch {
    return unavailable;
  }
}
