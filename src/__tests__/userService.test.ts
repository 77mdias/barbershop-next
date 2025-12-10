/** @jest-environment node */

import { buildUserWhere } from "@/server/services/userService";

describe("buildUserWhere", () => {
  it("excludes usuários removidos por padrão", () => {
    const where = buildUserWhere();
    expect(where.deletedAt).toBeNull();
  });

  it("permite incluir removidos quando solicitado", () => {
    const where = buildUserWhere({ status: "ALL" }, true);
    expect(where.deletedAt).toBeUndefined();
  });

  it("filtra status removido corretamente", () => {
    const where = buildUserWhere({ status: "DELETED" });
    expect(where.deletedAt).toEqual({ not: null });
  });

  it("aplica filtro de busca em nome e email", () => {
    const where = buildUserWhere({ search: "carlos" });
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { name: { contains: "carlos", mode: "insensitive" } },
        { email: { contains: "carlos", mode: "insensitive" } },
      ]),
    );
  });
});
