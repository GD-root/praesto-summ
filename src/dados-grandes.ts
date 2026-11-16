/* Dados grandes (IGMR e índice das páginas do Missal), carregados só quando alguém precisa deles.
   O service worker guarda esses arquivos também, então funcionam sem internet. */
import type { DadosIGMR, IndiceMissal } from "./tipos";

export let IGMR: DadosIGMR | null = null;
export let INDICE: IndiceMissal | null = null;

let carregando: Promise<void> | null = null;

export function dadosGrandesProntos(): boolean {
  return IGMR !== null && INDICE !== null;
}

/** Carrega os dois arquivos (uma vez só) e avisa quando terminar. */
export function carregarDadosGrandes(): Promise<void> {
  if (!carregando) {
    carregando = Promise.all([import("./dados/igmr.json"), import("./dados/indice-missal.json")]).then(([a, b]) => {
      IGMR = a.default as DadosIGMR;
      INDICE = b.default as IndiceMissal;
    });
  }
  return carregando;
}
