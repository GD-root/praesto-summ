/* O que o aplicativo lembra enquanto está aberto, e o que fica guardado no aparelho.
   As chaves do localStorage são as mesmas da versão anterior, para ninguém perder as marcações. */
import { D, ehISO, hojeISO } from "./liturgia/datas";

export function ler<T>(k: string, def: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
}
export function gravar(k: string, v: unknown): void {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sem espaço ou modo privado: segue sem guardar */
  }
}

export const CHAVE_OBJETOS = "missal-objetos";
export const CHAVE_CORPO = "missal-corpo";

export type Corpo = Record<string, number>;

const CORPO_PADRAO: Corpo = { coroinhas: 4, acolitos: 2, leitores: 1, conc: 0, cerim: 0, diacono: 0, incenso: 0, cruz: 1, tochas: 1, evang: 0 };

function carregarCorpo(): Corpo {
  const c: Corpo = ler<Corpo | null>(CHAVE_CORPO, null) || { ...CORPO_PADRAO };
  if (typeof c.ministros !== "number") c.ministros = 0;
  const padrao1: Corpo = { cMestre: c.cerim ? 1 : 0, cProc: 0, cPalavra: 0, cAltar: 0, cAtras: 0, bispo: 0, sCerimProc: 0 };
  const padrao2: Corpo = { ador: 0, sIncenso: 1, sTochas: 1, sSineta: 1, sCerim: 1, sPalio: 0 };
  for (const d of [padrao1, padrao2]) for (const k in d) if (typeof c[k] !== "number") c[k] = d[k];
  return c;
}

export const estado = {
  /** data preparada (AAAA-MM-DD) */
  calSel: "",
  /** acompanha o dia de hoje sozinho, até alguém escolher outra data */
  seguirHoje: true,
  /** data mostrada na caixa do calendário */
  modalSel: "",
  /** mês aberto na aba Santos (1 a 12; 0 = mês atual) */
  mesSel: 0,
  /** parte aberta na aba Mapa */
  mapaSel: 2,
  /** número aberto na aba IGMR */
  igmrSel: 0,
  marcados: ler<Record<string, 1>>(CHAVE_OBJETOS, {}),
  corpo: carregarCorpo(),
  /** "Qual é a sequência correta?" aberto na Preparação */
  seqCalice: false,
};

/** Data escolhida, em UTC. */
export function dataSel(): Date {
  if (!ehISO(estado.calSel)) estado.calSel = hojeISO();
  const a = estado.calSel.split("-").map(Number);
  return D(a[0], a[1], a[2]);
}
