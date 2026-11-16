/* Datas. Todas as contas usam meia-noite UTC, para não sofrer com horário de verão. */
import { p2 } from "../util/html";

export const DS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const ORD = ["", "Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto", "Sexto", "Sétimo"];
export const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const MESES_L = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const DIA = 864e5;

export function D(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}
export function mais(dt: Date, n: number): Date {
  return new Date(dt.getTime() + n * DIA);
}
export function dif(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DIA);
}
export function igual(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}
/** Domingo da semana (o próprio dia, se já for domingo). */
export function domAte(dt: Date): Date {
  return mais(dt, -dt.getUTCDay());
}
/** Próximo domingo (o próprio dia, se já for domingo). */
export function domDesde(dt: Date): Date {
  return mais(dt, (7 - dt.getUTCDay()) % 7);
}

/** Domingo da Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano). */
export function pascoa(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return D(y, Math.floor(n / 31), (n % 31) + 1);
}

/** Primeiro Domingo do Advento: o quarto domingo antes do Natal. */
export function advento1(y: number): Date {
  const n = D(y, 12, 25), w = n.getUTCDay();
  return mais(n, -(w === 0 ? 7 : w) - 21);
}

export function curta(dt: Date): string {
  return dt.getUTCDate() + "/" + (dt.getUTCMonth() + 1);
}

export function hojeISO(): string {
  const d = new Date();
  return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
}
export function isoDe(dt: Date): string {
  return dt.getUTCFullYear() + "-" + p2(dt.getUTCMonth() + 1) + "-" + p2(dt.getUTCDate());
}
export function deISO(v: string): Date {
  const a = v.split("-").map(Number);
  return D(a[0], a[1], a[2]);
}
export function ehISO(v: string): boolean {
  return /^\d{4}-\d\d-\d\d$/.test(v);
}

function diaDoMes(dt: Date): string | number {
  return dt.getUTCDate() === 1 ? "1º" : dt.getUTCDate();
}
/** "segunda-feira, 16 de novembro de 2026" */
export function dataLonga(dt: Date): string {
  return DS[dt.getUTCDay()].toLowerCase() + ", " + diaDoMes(dt) + " de " + MESES_L[dt.getUTCMonth()] + " de " + dt.getUTCFullYear();
}
/** "segunda-feira, 16 de novembro" */
export function dataMedia(dt: Date): string {
  return DS[dt.getUTCDay()].toLowerCase() + ", " + diaDoMes(dt) + " de " + MESES_L[dt.getUTCMonth()];
}
