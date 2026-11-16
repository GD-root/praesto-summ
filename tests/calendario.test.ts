/* O cálculo do dia litúrgico precisa dar exatamente o mesmo resultado da versão 14, em todos os dias de 2000 a 2100. */
import { describe, expect, it } from "vitest";
import { diaLiturgico } from "../src/liturgia/dia";
import { deISO, pascoa, isoDe } from "../src/liturgia/datas";
import { lerGabarito, normalizarAntigo, normalizarNovo } from "./gabarito";

const gabarito = lerGabarito<Record<string, Record<string, unknown>>>("calendario");

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
        try { expect(novo).toEqual(normalizarAntigo(antigo)); }
        catch { diferentes.push(iso); }
      }
      if (diferentes.length) {
        const iso = diferentes[0];
        expect(normalizarNovo(diaLiturgico(deISO(iso))), `${diferentes.length} dias diferentes; o primeiro é ${iso}`).toEqual(normalizarAntigo(gabarito[iso]));
      }
    });
  }

  it("Páscoa em datas conhecidas", () => {
    expect(isoDe(pascoa(2024))).toBe("2024-03-31");
    expect(isoDe(pascoa(2025))).toBe("2025-04-20");
    expect(isoDe(pascoa(2026))).toBe("2026-04-05");
    expect(isoDe(pascoa(2027))).toBe("2027-03-28");
  });
});
