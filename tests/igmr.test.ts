/* A IGMR e o índice do Missal gerados pelo script em Python, e os links para a IGMR. */
import { describe, expect, it } from "vitest";
import igmr from "../src/dados/igmr.json";
import indice from "../src/dados/indice-missal.json";
import type { DadosIGMR, IndiceMissal } from "../src/tipos";
import { ligarIGMR } from "../src/telas/igmr";

const I = igmr as DadosIGMR;
const M = indice as IndiceMissal;

describe("IGMR gerada do Drive", () => {
  it("tem os 399 números, em ordem e com texto", () => {
    expect(I.numeros.map((x) => x.n)).toEqual(Array.from({ length: 399 }, (_, i) => i + 1));
    I.numeros.forEach((x) => expect(x.texto.length).toBeGreaterThan(20));
  });
  it("cada número tem capítulo e página no Missal (p. 19 a 66)", () => {
    I.numeros.forEach((x) => {
      expect(x.capitulo).toBeTruthy();
      expect(x.pagina).toBeGreaterThanOrEqual(19);
      expect(x.pagina).toBeLessThanOrEqual(66);
    });
  });
  it("as páginas andam para a frente", () => {
    let p = 0;
    I.numeros.forEach((x) => { expect(x.pagina!).toBeGreaterThanOrEqual(p); p = x.pagina!; });
  });
  it("números conhecidos", () => {
    expect(I.numeros[105].texto).toMatch(/mestre de cerimônias/);
    expect(I.numeros[116].secao).toMatch(/Coisas a preparar/);
    expect(I.numeros[52].secao).toMatch(/Glória/);
  });
});

describe("índice das páginas do Missal", () => {
  const pag = new Map(M.paginas.map((p) => [p.p, p]));
  it("cobre o Missal inteiro", () => {
    expect(M.paginas.length).toBeGreaterThan(1200);
  });
  it("acha as Missas pelos títulos", () => {
    expect(pag.get(96)!.tit).toContain("PRIMEIRO DOMINGO DO ADVENTO");
    expect(pag.get(97)!.tit).toContain("SEGUNDA-FEIRA");
    expect(pag.get(330)!.tit).toContain("TERCEIRO DOMINGO DA PÁSCOA");
  });
  it("guarda só títulos, não o texto das orações", () => {
    M.paginas.forEach((p) => p.tit.forEach((t) => expect(t.length).toBeLessThanOrEqual(170)));
  });
});

describe("links para a IGMR", () => {
  it("liga números soltos e listas", () => {
    expect(ligarIGMR("<p>(IGMR 106)</p>")).toBe('<p>(IGMR <a class="ref-igmr" href="#igmr-106">106</a>)</p>');
    expect(ligarIGMR("IGMR 100 e 187 a 193")).toBe(
      'IGMR <a class="ref-igmr" href="#igmr-100">100</a> e <a class="ref-igmr" href="#igmr-187">187</a> a <a class="ref-igmr" href="#igmr-193">193</a>',
    );
    expect(ligarIGMR("Instrução Geral do Missal Romano, n. 117 a 119, 150 e 276 (no Missal")).toContain('href="#igmr-276"');
    expect(ligarIGMR("a Instrução Geral (n. 339) só pede")).toContain('href="#igmr-339"');
    expect(ligarIGMR("fala só do mestre de cerimônias (n. 106).")).toBe('fala só do mestre de cerimônias (n. <a class="ref-igmr" href="#igmr-106">106</a>).');
  });
  it("não põe link dentro de outro link", () => {
    const h = '<a class="item" href="#igmr-75"><div class="kind">IGMR 75</div></a> e IGMR 76';
    expect(ligarIGMR(h)).toBe('<a class="item" href="#igmr-75"><div class="kind">IGMR 75</div></a> e IGMR <a class="ref-igmr" href="#igmr-76">76</a>');
  });
  it("não mexe dentro das etiquetas HTML", () => {
    const h = '<a title="IGMR 12" href="#x">sem referência</a>';
    expect(ligarIGMR(h)).toBe(h);
  });
});
