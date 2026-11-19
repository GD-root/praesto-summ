/* Menu de baixo que se move: segure o dedo sobre ele por um instante para soltá-lo da trava, arraste para onde
   quiser e solte; ele fica ali (guardado neste aparelho). Levado de volta para perto da base, encaixa e trava. */
import { gravar, ler } from "./estado";

const CHAVE = "praesto-menu-posicao";
const SEGURAR_MS = 380, TOLERANCIA = 10, ZONA_TRAVA = 90, MARGEM = 8;

interface Posicao { x: number; y: number }

export function menuMovel(nav: HTMLElement): void {
  const doca = document.createElement("div");
  doca.className = "doca";
  doca.setAttribute("aria-hidden", "true");
  doca.innerHTML = "<span>Solte aqui para travar</span>";
  document.body.appendChild(doca);

  let pos = ler<Posicao | null>(CHAVE, null);
  let timer = 0, arrastando = false, ignorarClique = false;
  let inicio = { x: 0, y: 0 }, desloc = { x: 0, y: 0 };

  function limitar(p: Posicao): Posicao {
    const w = nav.offsetWidth, h = nav.offsetHeight;
    return {
      x: Math.min(Math.max(MARGEM, p.x), window.innerWidth - w - MARGEM),
      y: Math.min(Math.max(MARGEM, p.y), window.innerHeight - h - MARGEM),
    };
  }
  function aplicar(): void {
    if (pos) {
      pos = limitar(pos);
      nav.classList.add("solto");
      nav.style.left = pos.x + "px";
      nav.style.top = pos.y + "px";
    } else {
      nav.classList.remove("solto");
      nav.style.left = nav.style.top = "";
    }
  }
  /** O menu está perto da base (onde ele trava)? */
  function pertoDaBase(y: number): boolean {
    return window.innerHeight - (y + nav.offsetHeight) < ZONA_TRAVA;
  }
  function cancelar(): void { clearTimeout(timer); timer = 0; }

  nav.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    inicio = { x: e.clientX, y: e.clientY };
    cancelar();
    timer = window.setTimeout(() => {
      timer = 0;
      arrastando = true;
      const r = nav.getBoundingClientRect();
      desloc = { x: inicio.x - r.left, y: inicio.y - r.top };
      pos = { x: r.left, y: r.top };
      aplicar();
      nav.classList.add("arrastando");
      document.body.classList.add("movendo-menu");
      doca.classList.toggle("perto", pertoDaBase(pos.y));
      try { nav.setPointerCapture(e.pointerId); } catch { /* sem captura: segue assim mesmo */ }
      if (navigator.vibrate) navigator.vibrate(15);
    }, SEGURAR_MS);
  });
  nav.addEventListener("pointermove", (e) => {
    if (!arrastando) {
      if (timer && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > TOLERANCIA) cancelar();
      return;
    }
    e.preventDefault();
    pos = limitar({ x: e.clientX - desloc.x, y: e.clientY - desloc.y });
    nav.style.left = pos.x + "px";
    nav.style.top = pos.y + "px";
    doca.classList.toggle("perto", pertoDaBase(pos.y));
  });
  function soltar(): void {
    cancelar();
    if (!arrastando) return;
    arrastando = false;
    ignorarClique = true;
    setTimeout(() => (ignorarClique = false), 400);
    nav.classList.remove("arrastando");
    document.body.classList.remove("movendo-menu");
    doca.classList.remove("perto");
    if (pos && pertoDaBase(pos.y)) pos = null; /* voltou para a base: trava de novo */
    gravar(CHAVE, pos);
    aplicar();
  }
  nav.addEventListener("pointerup", soltar);
  nav.addEventListener("pointercancel", soltar);
  /* depois de arrastar, o dedo solto em cima de um botão não troca de tela */
  nav.addEventListener("click", (e) => { if (ignorarClique) { e.preventDefault(); e.stopPropagation(); } }, true);
  /* segurar o dedo num link abriria o menu do navegador */
  nav.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("resize", aplicar);
  aplicar();
}
