/* Quem celebra: padre ou bispo (escolha única) e diácono. */
import { describe, expect, it } from "vitest";
import { estado } from "../src/estado";
import { viewCorpo } from "../src/telas/ministerios";

describe("quem celebra", () => {
  it("mostra Padre, Bispo e Diácono, sem “Bispo preside”", () => {
    estado.corpo.bispo = 0;
    const h = viewCorpo();
    expect(h).not.toContain("Bispo preside");
    expect(h).toMatch(/<label class="chip tg on"><input type="radio" name="preside" data-preside="0" checked>Padre<\/label>/);
    expect(h).toMatch(/data-preside="1">Bispo<\/label>/);
    expect(h).toContain(">Diácono</label>");
  });
  it("com o bispo, a escolha passa para Bispo e a procissão termina com ele", () => {
    estado.corpo.bispo = 1;
    const h = viewCorpo();
    expect(h).toMatch(/data-preside="1" checked>Bispo/);
    expect(h).toContain("Bispo, presidente da celebração");
    estado.corpo.bispo = 0;
  });
});
