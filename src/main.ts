/* Praesto Sum: liga as telas à página, cuida da navegação e dos toques. */
import "./estilos.css";
import { TABS, SECOES } from "./telas";
import { viewBuscaCompleta } from "./telas/busca-texto";
import { ligarIGMR } from "./telas/igmr";
import { carregarDadosGrandes, dadosGrandesProntos } from "./dados-grandes";
import { caixaHTML, quadroDia, rotuloData } from "./telas/dia";
import { MIN } from "./telas/ministerios";
import { deISO, ehISO, hojeISO, isoDe, mais } from "./liturgia/datas";
import { CHAVE_CORPO, CHAVE_OBJETOS, estado, gravar, ler } from "./estado";
import { detalheGlossario, listaGlossario } from "./telas/glossario";

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}
const view = el<HTMLElement>("view"), busca = el<HTMLInputElement>("busca"), limpar = el<HTMLButtonElement>("limpar"),
  barra = el<HTMLElement>("barra"), barraMissal = el<HTMLElement>("missal-bar"),
  diabox = el<HTMLButtonElement>("diabox"), fundo = el<HTMLElement>("fundo"), cx = el<HTMLElement>("cx"),
  titulo = el<HTMLElement>("titulo"), subtitulo = el<HTMLElement>("subtitulo"), topoEsq = el<HTMLAnchorElement>("topo-esq"), calBtn = el<HTMLButtonElement>("cal-btn");

/* Barra de cima: título centralizado; à esquerda, "sobre" no início e "voltar" nas outras telas */
const ICONE_INFO = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg>';
const ICONE_VOLTAR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>';
const TITULOS: Record<string, string> = { inicio: "Praesto Sum", objetos: "Preparação", missal: "Missal", corpo: "Ministérios" };

/* ---------- Navegação ---------- */
function rota(): string {
  let h = (location.hash || "").replace("#", "");
  if (h === "missal" || h === "calendario") h = "roteiro";
  /* #igmr-106 abre a aba IGMR no número 106 */
  const m = h.match(/^igmr-(\d{1,3})$/);
  estado.igmrSel = m ? +m[1] : 0;
  if (m) h = "igmr";
  return TABS[h] || SECOES[h] ? h : "inicio";
}

function render(): void {
  if (estado.seguirHoje) estado.calSel = hojeISO();
  const t = rota(), noMissal = !!TABS[t], q = noMissal ? busca.value.trim() : "";
  const qd = quadroDia();
  diabox.className = "diabox cor-" + qd.cor;
  diabox.innerHTML = qd.html;
  /* a cor litúrgica do dia pinta o cartão do dia, o botão escolhido do menu e os destaques */
  document.documentElement.dataset.cor = qd.cor;
  const sec = noMissal ? "missal" : t;
  diabox.hidden = t !== "inicio";
  titulo.textContent = TITULOS[sec];
  subtitulo.textContent = t === "inicio" ? "Sacristia" : rotuloData();
  topoEsq.innerHTML = t === "inicio" ? ICONE_INFO : ICONE_VOLTAR;
  topoEsq.setAttribute("aria-label", t === "inicio" ? "Sobre o aplicativo" : "Voltar ao início");
  barra.hidden = !noMissal;
  glosBtn.hidden = t !== "objetos";
  glosDica.hidden = glosBtn.hidden || glosVisto;
  barraMissal.hidden = !noMissal;
  limpar.hidden = !q;
  document.querySelectorAll<HTMLAnchorElement>("nav.baixo a").forEach((a) => {
    if (a.dataset.sec === sec) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.querySelectorAll<HTMLAnchorElement>("nav.tabs a").forEach((a) => {
    if (!q && a.dataset.tab === t) {
      a.setAttribute("aria-current", "page");
      a.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    } else a.removeAttribute("aria-current");
  });
  /* a aba IGMR e a busca usam os dados grandes: carrega e desenha de novo quando chegarem */
  if ((q || t === "igmr") && !dadosGrandesProntos()) carregarDadosGrandes().then(manter).catch(() => {});
  view.innerHTML = ligarIGMR(q ? viewBuscaCompleta(q) : (TABS[t] || SECOES[t])());
}

/** Redesenha sem perder a posição da rolagem. */
function manter(): void {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

window.addEventListener("hashchange", () => {
  busca.value = "";
  render();
  /* ao abrir um número da IGMR, o cartão dele aparece logo abaixo da barra */
  const aberto = document.getElementById("igmr-aberto");
  window.scrollTo(0, aberto ? Math.max(0, aberto.getBoundingClientRect().top + window.scrollY - 170) : 0);
});
document.querySelectorAll("nav.tabs a").forEach((a) => a.addEventListener("click", () => { if (busca.value) { busca.value = ""; render(); } }));
busca.addEventListener("input", render);
limpar.addEventListener("click", () => { busca.value = ""; render(); busca.focus(); });
el<HTMLFormElement>("busca-form").addEventListener("submit", (e) => { e.preventDefault(); busca.blur(); });

/* ---------- "O que é cada objeto" (botão redondo da Preparação) ----------
   Cada passo entra no histórico: o "voltar" do celular volta da ficha para a lista e depois fecha a janela. */
const glosBtn = el<HTMLButtonElement>("glos-btn"), glosDica = el<HTMLElement>("glos-dica"), glos = el<HTMLDialogElement>("glos"),
  glosCorpo = el<HTMLElement>("glos-corpo"), glosBusca = el<HTMLInputElement>("glos-busca"), glosVoltar = el<HTMLButtonElement>("glos-voltar");
const CHAVE_GLOS = "praesto-objetos-visto";
let glosVisto = !!ler<number>(CHAVE_GLOS, 0);

function glosLista(): void {
  glosVoltar.hidden = true; glosBusca.hidden = false;
  glosCorpo.innerHTML = listaGlossario(glosBusca.value);
}
function glosFicha(id: string): void {
  glosVoltar.hidden = false; glosBusca.hidden = true;
  glosCorpo.innerHTML = detalheGlossario(id);
  glos.scrollTop = 0;
}
function abrirGlos(id?: string): void {
  if (!glosVisto) { glosVisto = true; gravar(CHAVE_GLOS, 1); glosDica.hidden = true; }
  glosBusca.value = "";
  glosLista();
  glos.showModal();
  history.pushState({ glos: 1 }, "");
  if (id) { glosFicha(id); history.pushState({ glos: 2, id }, ""); }
}
function fecharGlos(): void {
  const n = (history.state && history.state.glos) || 0;
  if (n) history.go(-n); else glos.close();
}
window.addEventListener("popstate", () => {
  if (!glos.open) return;
  const st = history.state || {};
  if (st.glos === 2 && st.id) glosFicha(st.id);
  else if (st.glos === 1) glosLista();
  else glos.close();
});
glosBtn.addEventListener("click", () => abrirGlos());
glosDica.addEventListener("click", () => abrirGlos());
el<HTMLButtonElement>("glos-x").addEventListener("click", fecharGlos);
glosVoltar.addEventListener("click", () => history.back());
glos.addEventListener("cancel", (e) => { e.preventDefault(); fecharGlos(); });
glos.addEventListener("click", (e) => {
  if (e.target === glos) { fecharGlos(); return; }
  const b = (e.target as Element).closest<HTMLElement>(".gl-item");
  if (b) { glosFicha(b.dataset.glos!); history.pushState({ glos: 2, id: b.dataset.glos }, ""); }
});
glosBusca.addEventListener("input", glosLista);

/* ---------- Caixa do calendário ---------- */
function pintarCaixa(): void {
  const c = caixaHTML();
  cx.className = "cx cor-" + c.cor;
  cx.innerHTML = c.html;
}
let abriuCaixa: HTMLElement = diabox;
function abrirCaixa(this: HTMLElement | void): void {
  abriuCaixa = this instanceof HTMLElement ? this : diabox;
  estado.modalSel = estado.calSel;
  pintarCaixa();
  fundo.hidden = false;
  document.body.classList.add("travado");
  cx.querySelector<HTMLElement>("[data-fechar]")?.focus();
}
function fecharCaixa(): void {
  fundo.hidden = true;
  document.body.classList.remove("travado");
  abriuCaixa.focus();
}
diabox.addEventListener("click", abrirCaixa);
calBtn.addEventListener("click", abrirCaixa);
topoEsq.addEventListener("click", (e) => {
  if (rota() !== "inicio") return;
  e.preventDefault();
  document.querySelector(".sobre")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});
fundo.addEventListener("click", (e) => {
  const alvo = e.target as HTMLElement;
  if (alvo === fundo) { fecharCaixa(); return; }
  const b = alvo.closest<HTMLElement>("[data-passo]");
  if (b) {
    const n = +b.dataset.passo!;
    estado.modalSel = n ? isoDe(mais(deISO(estado.modalSel), n)) : hojeISO();
    pintarCaixa();
    return;
  }
  if (alvo.closest("[data-fechar]")) { fecharCaixa(); return; }
  if (alvo.closest("[data-usar]")) {
    estado.calSel = estado.modalSel;
    estado.seguirHoje = estado.calSel === hojeISO();
    fecharCaixa();
    manter();
  }
});
fundo.addEventListener("change", (e) => {
  const alvo = e.target as HTMLInputElement;
  if (alvo && alvo.id === "dia" && ehISO(alvo.value)) { estado.modalSel = alvo.value; pintarCaixa(); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !fundo.hidden) fecharCaixa(); });

/* Vira o dia sozinho: confere a data ao voltar para o aplicativo e a cada minuto */
function conferirDia(): void {
  if (estado.seguirHoje && estado.calSel !== hojeISO() && fundo.hidden) manter();
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) conferirDia(); });
window.addEventListener("focus", conferirDia);
setInterval(conferirDia, 60000);

/* ---------- Toques dentro da tela ---------- */
function marcar(id: string, v: boolean): void {
  if (v) estado.marcados[id] = 1;
  else delete estado.marcados[id];
  gravar(CHAVE_OBJETOS, estado.marcados);
  manter();
}
view.addEventListener("change", (e) => {
  const alvo = e.target as HTMLInputElement;
  if (!alvo) return;
  if (alvo.dataset.obj) { marcar(alvo.dataset.obj, alvo.checked); return; }
  if (alvo.dataset.preside) { estado.corpo.bispo = +alvo.dataset.preside; gravar(CHAVE_CORPO, estado.corpo); manter(); return; }
  if (alvo.dataset.corpoT) { estado.corpo[alvo.dataset.corpoT] = alvo.checked ? 1 : 0; gravar(CHAVE_CORPO, estado.corpo); manter(); }
});
/* lembra se "Qual é a sequência correta?" está aberto, para não fechar ao marcar uma peça */
view.addEventListener("toggle", (e) => {
  const d = e.target as HTMLDetailsElement;
  if (d.dataset && d.dataset.seq) estado.seqCalice = d.open;
}, true);
view.addEventListener("keydown", (e) => {
  const g = (e.target as Element).closest?.<SVGGElement>("g[data-obj]");
  if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); marcar(g.dataset.obj!, !estado.marcados[g.dataset.obj!]); }
});
view.addEventListener("submit", (e) => {
  const form = (e.target as HTMLElement).closest<HTMLFormElement>("[data-igmr-ir]");
  if (!form) return;
  e.preventDefault();
  const n = +(form.querySelector<HTMLInputElement>("input")?.value || 0);
  if (n >= 1 && n <= 399) location.hash = "igmr-" + n;
});
view.addEventListener("click", (e) => {
  const alvo = e.target as Element;
  const info = alvo.closest<HTMLElement>("[data-glos]");
  if (info) { e.preventDefault(); abrirGlos(info.dataset.glos!); return; }
  const g = alvo.closest<SVGGElement>("g[data-obj]");
  if (g) { marcar(g.dataset.obj!, !estado.marcados[g.dataset.obj!]); return; }
  if (alvo.closest("[data-limpar]")) { estado.marcados = {}; gravar(CHAVE_OBJETOS, estado.marcados); manter(); return; }
  let b = alvo.closest<HTMLElement>("[data-corpo]");
  if (b) {
    const k = b.dataset.corpo!, lim = MIN.contagens.find((f) => f.id === k)?.max ?? 0;
    estado.corpo[k] = Math.max(0, Math.min(lim, estado.corpo[k] + +b.dataset.d!));
    gravar(CHAVE_CORPO, estado.corpo);
    manter();
    return;
  }
  b = alvo.closest<HTMLElement>("[data-mes]");
  if (b) { estado.mesSel = +b.dataset.mes!; manter(); return; }
  b = alvo.closest<HTMLElement>("[data-mapa]");
  if (b) { estado.mapaSel = +b.dataset.mapa!; manter(); return; }
  b = alvo.closest<HTMLElement>("[data-go]");
  if (b) {
    const alvoGo = document.getElementById(b.dataset.go!);
    if (alvoGo) {
      const top = alvoGo.getBoundingClientRect().top + window.scrollY - 170;
      window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }
});

render();

/* ---------- Funcionamento sem internet ---------- */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
    /* apaga o cache da versão antiga (praesto-v1 ... v14), que guardava o index.html inteiro */
    if ("caches" in window) caches.keys().then((ks) => ks.filter((k) => /^praesto-v\d+$/.test(k)).forEach((k) => caches.delete(k))).catch(() => {});
  });
}
