/* Cada tela precisa produzir o mesmo HTML da versão 14 (gabarito gravado em 16/11/2026). */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { lerGabarito } from "./gabarito";

type Telas = Record<string, Record<string, unknown>> & { santosMaio: string; mapa0: string; busca: Record<string, string> };
const gabarito = lerGabarito<Telas>("telas");

/* o gabarito foi gravado no dia 16/11/2026: "hoje" precisa ser esse dia */
vi.useFakeTimers({ toFake: ["Date"] });
vi.setSystemTime(new Date(2026, 10, 16, 12, 0, 0));

const { estado } = await import("../src/estado");
const { TABS, SECOES } = await import("../src/telas");
const { quadroDia, caixaHTML } = await import("../src/telas/dia");
const { viewSantos, viewMapa } = await import("../src/telas/missal");
const { viewBusca } = await import("../src/telas/busca");

const datas = Object.keys(gabarito).filter((k) => /^\d{4}-/.test(k));

beforeAll(() => {
  estado.mesSel = 0;
  estado.mapaSel = 2;
});

describe("telas iguais à versão 14", () => {
  for (const iso of datas) {
    describe(iso, () => {
      const esperado = gabarito[iso];
      for (const [nome, f] of Object.entries({ ...TABS, ...SECOES })) {
        it(nome, () => {
          estado.calSel = iso;
          estado.seguirHoje = false;
          expect(f()).toBe(esperado[nome]);
        });
      }
      it("quadro do dia", () => {
        estado.calSel = iso;
        expect(quadroDia()).toEqual(esperado.quadro);
      });
      it("caixa do calendário", () => {
        estado.calSel = iso;
        estado.modalSel = iso;
        expect(caixaHTML()).toEqual(esperado.caixa);
      });
    });
  }

  it("santos de maio", () => {
    estado.mesSel = 5;
    expect(viewSantos()).toBe(gabarito.santosMaio);
  });
  it("mapa, primeira parte", () => {
    estado.mapaSel = 0;
    expect(viewMapa()).toBe(gabarito.mapa0);
  });
  it("busca", () => {
    expect(viewBusca("Advento")).toBe(gabarito.busca.advento);
    expect(viewBusca("teresa")).toBe(gabarito.busca.teresa);
    expect(viewBusca("xyzxyz")).toBe(gabarito.busca.nada);
  });
});
