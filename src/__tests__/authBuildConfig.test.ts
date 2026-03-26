import fs from "node:fs";
import path from "node:path";

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Auth build configuration", () => {
  it("does not externalize root next-auth package in Vite SSR", () => {
    const viteConfigSource = readProjectFile("vite.config.ts");
    const externalListBlock = /const authServerExternalPackages = \[([\s\S]*?)\] as const;/.exec(viteConfigSource);

    expect(externalListBlock?.[1]).toBeDefined();
    expect(externalListBlock?.[1]).not.toContain("\"next-auth\",");
  });

  it("forces server-side auth packages to stay external in Vite SSR", () => {
    const viteConfigSource = readProjectFile("vite.config.ts");

    expect(viteConfigSource).toContain("\"next-auth/core\"");
    expect(viteConfigSource).toContain("\"@panva/hkdf\"");
    expect(viteConfigSource).toContain("\"openid-client\"");
    expect(viteConfigSource).toContain("ssr:");
    expect(viteConfigSource).toContain("external:");
  });

  it("keeps auth packages in Next-compatible serverExternalPackages", () => {
    const nextConfigSource = readProjectFile("next.config.ts");

    expect(nextConfigSource).toContain("\"next-auth\"");
    expect(nextConfigSource).toContain("\"@panva/hkdf\"");
    expect(nextConfigSource).toContain("\"jose\"");
    expect(nextConfigSource).toContain("serverExternalPackages");
  });
});
