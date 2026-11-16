/* Próprio dos Santos: que celebrações de data fixa (ou ligadas a uma data) caem num dia. */
import celebracoes from "../dados/celebracoes.json";
import tabelas from "../dados/calendario.json";
import type { Celebracao, TabelasCalendario } from "../tipos";
import { D, curta, dif, domDesde, igual, mais, pascoa } from "./datas";

const CAL = tabelas as TabelasCalendario;
export const CELEB = celebracoes as Celebracao[];

/** S solenidade, F festa, M memória obrigatória, O memória facultativa */
export type Grau = "S" | "F" | "M" | "O";

export interface SantoDoDia {
  nome: string;
  pagina: number;
  grau: Grau;
  maria?: boolean;
  obs?: string;
  /** precedência, na mesma escala de DiaDoTempo.precedencia */
  precedencia: number;
}

const GRAU_DA_DATA: Record<string, Grau> = {};
CAL.graus.solenidades.forEach((x) => (GRAU_DA_DATA[x] = "S"));
CAL.graus.festas.forEach((x) => (GRAU_DA_DATA[x] = "F"));
CAL.graus.memorias.forEach((x) => (GRAU_DA_DATA[x] = "M"));

export const FESTAS_DO_SENHOR = new Set(CAL.festasDoSenhor);

/** Solenidades de data fixa que mudam de dia quando caem em domingo forte, Semana Santa ou oitava da Páscoa. */
export function transferida(y: number, m: number, d: number): Date {
  const x = D(y, m, d), pa = pascoa(y), ram = mais(pa, -7), o2 = mais(pa, 7);
  if (x >= ram && x <= o2) return m === 3 && d === 19 ? mais(ram, -1) : mais(o2, 1);
  if (x.getUTCDay() === 0) return mais(x, 1);
  return x;
}

/** No Brasil, Todos os Santos vai para o domingo entre 2 e 8 de novembro, salvo quando 1º de novembro é domingo. */
export function todosSantos(y: number): Date {
  const a = D(y, 11, 1);
  if (a.getUTCDay() === 0) return a;
  const s = domDesde(a);
  return s.getUTCDate() === 2 ? a : s;
}

/** Nome do índice ("Teresa de Jesus: virgem...") na forma de leitura ("Santa..."). */
export function bonito(n: string): string {
  const m = n.match(/^([^:]+): (.+)$/);
  if (!m) return n;
  const a = m[1].replace(", apóstolo", ""), b = m[2];
  if (a === "Jesus Cristo") return b;
  if (a === "Dedicação da Basílica") return "Dedicação da Basílica " + b;
  if (a === "Nossa Senhora") return /^d[aeo]s? /.test(b) || b === "Rainha" ? "Nossa Senhora " + b : /^Santa Maria/.test(b) ? b : b + " de Nossa Senhora";
  if (b === "Operário") return a + " Operário";
  if (b === "Solenidade") return a;
  return b + " de " + a;
}

export function ehMaria(s: SantoDoDia): boolean {
  return !!s.maria || s.pagina === 720 || s.pagina === 722 || s.pagina === 778 || s.pagina === 871;
}

const FIXAS_TRANSFERIVEIS: [number, number, number, string][] = [
  [3, 19, 688, "São José, esposo da Bem-aventurada Virgem Maria"],
  [3, 25, 692, "Anunciação do Senhor"],
  [12, 8, 871, "Imaculada Conceição de Nossa Senhora"],
];
/** Páginas tratadas à parte (datas transferidas para o domingo ou transferíveis). */
const TRATADAS_A_PARTE = new Set([738, 841, 688, 692, 871]);

function precedencia(s: { grau: Grau; pagina: number }): number {
  if (s.grau === "S") return 3;
  if (s.grau === "F") return FESTAS_DO_SENHOR.has(s.pagina) ? 5 : 7;
  if (s.grau === "M") return 10;
  return 12;
}

export function santosDoDia(dt: Date): { lista: SantoDoDia[]; avisos: string[] } {
  const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
  const L: Omit<SantoDoDia, "precedencia">[] = [];
  const avisos: string[] = [];

  FIXAS_TRANSFERIVEIS.forEach(([fm, fd, p, nome]) => {
    const td = transferida(y, fm, fd);
    if (igual(dt, td)) L.push({ nome, pagina: p, grau: "S" });
    else if (m === fm && d === fd) avisos.push("Neste ano a solenidade de " + nome + " (p. " + p + ") é transferida para " + curta(td) + ", porque hoje a celebração do tempo tem precedência.");
  });

  CELEB.forEach((c) => {
    if (c.mes !== m || c.dia !== d) return;
    if (c.pagina < 659 || TRATADAS_A_PARTE.has(c.pagina)) return;
    if (/^(Jesus Cristo|Nossa Senhora|São Pedro, apóstolo|São Paulo, apóstolo): Dedicação/.test(c.nome)) return;
    const s: Omit<SantoDoDia, "precedencia"> = { nome: bonito(c.nome), pagina: c.pagina, grau: GRAU_DA_DATA[m + "-" + d] || "O" };
    if (/^Nossa Senhora/.test(c.nome)) s.maria = true;
    L.push(s);
  });

  if (igual(dt, domDesde(D(y, 6, 28)))) L.push({ nome: "São Pedro e São Paulo, apóstolos", pagina: 738, grau: "S", obs: "No Brasil a solenidade é celebrada no domingo entre 28 de junho e 4 de julho." });
  if (igual(dt, domDesde(D(y, 8, 15)))) L.push({ nome: "Assunção de Nossa Senhora", pagina: 778, grau: "S", obs: "No Brasil a solenidade é celebrada no domingo depois de 15 de agosto, quando o dia 15 não é domingo." });
  if (igual(dt, todosSantos(y))) L.push({ nome: "Todos os Santos", pagina: 841, grau: "S", obs: "No Brasil a solenidade passa para o domingo seguinte quando 1º de novembro não é domingo." });
  const pen = mais(pascoa(y), 49);
  if (dif(dt, pen) === 1) L.push({ nome: "Bem-aventurada Virgem Maria, Mãe da Igreja", pagina: 720, grau: "M" });
  if (dif(dt, pen) === 20) L.push({ nome: "Imaculado Coração de Maria", pagina: 722, grau: "M" });

  const lista = L.map((s) => ({ ...s, precedencia: precedencia(s) }));
  lista.sort((a, b) => a.precedencia - b.precedencia);
  return { lista, avisos };
}
