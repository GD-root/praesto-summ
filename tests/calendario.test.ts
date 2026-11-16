/* O cálculo do dia litúrgico precisa dar exatamente o mesmo resultado da versão 14, em todos os dias de 2000 a 2100. */
import { describe, expect, it } from "vitest";
import { diaLiturgico } from "../src/liturgia/dia";
import { deISO, pascoa, isoDe } from "../src/liturgia/datas";
import { lerGabarito, normalizarAntigo, normalizarNovo } from "./gabarito";

const gabarito = lerGabarito<Record<string, Record<string, unknown>>>("calendario");

/* Correções feitas depois da versão 14, conferidas com o texto do Missal (ferramentas/relatorio-paginas.md).
   Cada uma muda o gabarito só onde precisa. */
function corrigir(r: Record<string, unknown>): Record<string, unknown> {
  const t = r.tempo as Record<string, unknown>;
  /* o 3º Domingo da Páscoa começa na p. 330, não na 329 */
  if (t.tempo === "pas" && t.domingo && t.semana === 3 && t.pagina === 329) {
    t.pagina = 330;
    if (r.modo !== "s") r.pagina = 330;
    const ben = r.bencao as string[];
    if (ben && ben[1] === "329") ben[1] = "330";
  }
  return r;
}

describe("calendário litúrgico", () => {
  it("tem gabarito para 101 anos", () => {
    expect(Object.keys(gabarito).length).toBe(36890);
  });

  for (let ano = 2000; ano <= 2100; ano++) {
    it(`${ano}: todos os dias iguais à versão 14`, () => {
      const diferentes: string[] = [];
      for (const [iso, antigo] of Object.entries(gabarito)) {
        if (!iso.startsWith(ano + "-")) continue;
        const novo = normalizarNovo(diaLiturgico(deISO(iso)));
        try { expect(novo).toEqual(corrigir(normalizarAntigo(antigo))); }
        catch { diferentes.push(iso); }
      }
      if (diferentes.length) {
        const iso = diferentes[0];
        expect(normalizarNovo(diaLiturgico(deISO(iso))), `${diferentes.length} dias diferentes; o primeiro é ${iso}`).toEqual(corrigir(normalizarAntigo(gabarito[iso])));
      }
    });
  }

  it("3º Domingo da Páscoa na p. 330", () => {
    const r = diaLiturgico(deISO("2027-04-11"));
    expect(r.titulo).toBe("Terceiro Domingo da Páscoa");
    expect(r.pagina).toBe(330);
  });

  it("Páscoa em datas conhecidas", () => {
    expect(isoDe(pascoa(2024))).toBe("2024-03-31");
    expect(isoDe(pascoa(2025))).toBe("2025-04-20");
    expect(isoDe(pascoa(2026))).toBe("2026-04-05");
    expect(isoDe(pascoa(2027))).toBe("2027-03-28");
  });
});
