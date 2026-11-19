/* "O que é cada objeto": todos com desenho e texto, e ligados à lista da Preparação. */
import { describe, expect, it } from "vitest";
import { GLOS, detalheGlossario, itemGlossario, listaGlossario } from "../src/telas/glossario";
import { FIG } from "../src/telas/figuras";
import { OBJ, viewObjetos } from "../src/telas/preparacao";

const itens = GLOS.flatMap((g) => g.itens);

describe("O que é cada objeto", () => {
  it("ids sem repetição, todos com desenho e explicação", () => {
    expect(new Set(itens.map((i) => i.id)).size).toBe(itens.length);
    itens.forEach((i) => {
      expect(FIG[i.id], i.id).toBeTruthy();
      expect(i.texto.length, i.id).toBeGreaterThan(60);
    });
    expect(Object.keys(FIG).sort()).toEqual(itens.map((i) => i.id).sort());
  });
  it("tem os objetos pedidos", () => {
    for (const id of ["calice", "ambula", "calice-ambula", "turibulo", "naveta", "sineta", "mitra", "baculo", "solideu", "alva", "casula", "estola"]) expect(itemGlossario(id), id).toBeTruthy();
  });
  it("a âmbula mostra as duas formas e como não confundir com o cálice", () => {
    const h = detalheGlossario("ambula");
    expect(h).toContain("cibório");
    expect(h).toContain("Como não confundir");
    expect(h).toMatch(/bacia/);
  });
  it("o solidéu diz quando o bispo o tira", () => {
    expect(detalheGlossario("solideu")).toMatch(/oração sobre as oferendas/);
  });
  it("a busca filtra e ignora acentos", () => {
    const h = listaGlossario("ambula");
    expect(h).toContain('data-glos="ambula"');
    expect(h).not.toContain('data-glos="mitra"');
    expect(listaGlossario("zzz")).toContain("Nenhum objeto");
  });
  it("quase todo item da lista da Preparação tem o botão “?”", () => {
    const html = viewObjetos();
    const ids = OBJ.flatMap((g) => g.itens.map((i) => i.id));
    const sem = ids.filter((id) => !html.includes(`class="info" data-glos="${id}"`));
    expect(sem.sort()).toEqual(["chave", "paramentos"]);
  });
});
