/* Tela inicial do tema Solene: os três cartões com as mesmas informações de antes. */
import { describe, expect, it, vi } from "vitest";

vi.useFakeTimers({ toFake: ["Date"] });
vi.setSystemTime(new Date(2026, 10, 19, 12, 0, 0));
const { estado } = await import("../src/estado");
const { viewInicio } = await import("../src/telas/inicio");
const { rotuloData } = await import("../src/telas/dia");

describe("tela inicial", () => {
  it("tem os três cartões com os números do dia", () => {
    estado.marcados = {};
    const h = viewInicio();
    expect(h).toContain('href="#objetos"');
    expect(h).toContain('href="#roteiro"');
    expect(h).toContain('href="#corpo"');
    expect(h).toMatch(/0\/14/);
    expect(h).toContain("lembretes do dia");
    expect(h).toMatch(/Prefácio p\. /);
    expect(h).toContain("na procissão");
  });
  it("mantém o versículo e a nota de sempre", () => {
    const h = viewInicio();
    expect(h).toContain("Servi ao Senhor com alegria");
    expect(h).toContain("Confirme sempre com o presidente da celebração");
  });
  it("subtítulo das telas com a data curta", () => {
    estado.calSel = "2026-11-19";
    expect(rotuloData()).toBe("Hoje · qui, 19 nov");
  });
});
