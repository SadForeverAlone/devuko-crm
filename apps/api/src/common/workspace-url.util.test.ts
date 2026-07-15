import { describe, expect, it } from "vitest";
import { advisoryLockKeys } from "./advisory-lock.util";
import { assertWorkspaceApiUrl, isPrivateNetworkHost } from "./workspace-url.util";

describe("isPrivateNetworkHost", () => {
  it("blocks loopback and RFC1918", () => {
    expect(isPrivateNetworkHost("127.0.0.1")).toBe(true);
    expect(isPrivateNetworkHost("10.0.0.1")).toBe(true);
    expect(isPrivateNetworkHost("192.168.1.1")).toBe(true);
    expect(isPrivateNetworkHost("172.16.5.1")).toBe(true);
    expect(isPrivateNetworkHost("169.254.169.254")).toBe(true);
  });

  it("blocks IPv4-mapped IPv6 loopback", () => {
    expect(isPrivateNetworkHost("::ffff:127.0.0.1")).toBe(true);
  });

  it("allows public addresses", () => {
    expect(isPrivateNetworkHost("8.8.8.8")).toBe(false);
    expect(isPrivateNetworkHost("1.1.1.1")).toBe(false);
  });
});

describe("assertWorkspaceApiUrl", () => {
  const site = { domain: "selfpact.ru", extraDomains: ["www.selfpact.ru"] };

  it("allows https site domain", () => {
    expect(assertWorkspaceApiUrl("https://selfpact.ru/api", site, { isProduction: true })).toBe(
      "https://selfpact.ru/api"
    );
  });

  it("rejects credentials in URL", () => {
    expect(() =>
      assertWorkspaceApiUrl("https://user:pass@selfpact.ru", site, { isProduction: true })
    ).toThrow();
  });

  it("rejects metadata host", () => {
    expect(() =>
      assertWorkspaceApiUrl("http://169.254.169.254/", site, { isProduction: true })
    ).toThrow();
  });

  it("rejects unrelated host in production", () => {
    expect(() =>
      assertWorkspaceApiUrl("https://evil.example.com", site, { isProduction: true })
    ).toThrow();
  });
});

describe("advisoryLockKeys", () => {
  it("is stable for the same name", () => {
    expect(advisoryLockKeys("devuko-crm-deploy")).toEqual(advisoryLockKeys("devuko-crm-deploy"));
  });

  it("differs across namespaces", () => {
    expect(advisoryLockKeys("a")).not.toEqual(advisoryLockKeys("b"));
  });
});
