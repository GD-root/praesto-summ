/* Regrava no gabarito as telas mudadas de propósito (tema Solene, 19/11/2026).
   Só roda com REGRAVAR=1:  REGRAVAR=1 npx vitest run tests/regravar-gabarito.test.ts */
import { it, vi } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

it.skipIf(!process.env.REGRAVAR)("regrava inicio, objetos, roteiro e corpo", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 16, 12, 0, 0));
  const arq = fileURLToPath(new URL("./gabarito/telas.json.gz", import.meta.url));
  const g = JSON.parse(gunzipSync(readFileSync(arq)).toString("utf8"));
  const { estado } = await import("../src/estado");
  const { SECOES, TABS } = await import("../src/telas");
  estado.mesSel = 0; estado.mapaSel = 2;
  const telas: Record<string, () => string> = { inicio: SECOES.inicio, objetos: SECOES.objetos, roteiro: TABS.roteiro, corpo: SECOES.corpo };
  for (const iso of Object.keys(g).filter((k) => /^\d{4}-/.test(k))) {
    estado.calSel = iso; estado.seguirHoje = false;
    for (const [nome, f] of Object.entries(telas)) if (nome in g[iso]) g[iso][nome] = f();
  }
  writeFileSync(arq, gzipSync(JSON.stringify(g)));
});
