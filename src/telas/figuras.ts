/* Desenhos dos objetos litúrgicos (SVG, 120 × 120). Classes de preenchimento:
   m metal dourado · p pano branco · c cor do dia · v roxo · k madeira · r vinho · a água · f chama · e escuro · h hóstia */

const calice = (x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path class="m" d="M36 16 H84 Q82 44 66 58 H54 Q38 44 36 16 Z"/>
  <rect class="m" x="56.5" y="58" width="7" height="32"/><ellipse class="m" cx="60" cy="72" rx="8" ry="4.5"/>
  <path class="m" d="M34 104 Q60 84 86 104 Z"/></g>`;

const ambulaCalice = (x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path class="m" d="M28 50 Q28 78 60 78 Q92 78 92 50 Z"/>
  <path class="m" d="M26 50 Q60 22 94 50 Z"/><path d="M60 12 V30 M53 19 H67"/>
  <rect class="m" x="56.5" y="78" width="7" height="14"/><ellipse class="m" cx="60" cy="86" rx="8" ry="4"/>
  <path class="m" d="M36 106 Q60 90 84 106 Z"/></g>`;

const ambulaPote = (x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path class="m" d="M34 54 H86 V92 Q86 102 76 102 H44 Q34 102 34 92 Z"/>
  <path class="m" d="M30 54 Q60 30 90 54 Z"/><path d="M60 22 V38 M54 28 H66"/>
  <path class="m" d="M40 102 H80 L84 110 H36 Z"/></g>`;

const vela = (x: number, y: number, h = 40) => `<rect class="p" x="${x - 4}" y="${y}" width="8" height="${h}"/><path class="f" d="M${x} ${y - 13} Q${x + 6} ${y - 5} ${x} ${y - 1} Q${x - 6} ${y - 5} ${x} ${y - 13} Z"/>`;

const cruz = (x: number, y: number, h: number, w: number) => `<path d="M${x} ${y} V${y + h} M${x - w / 2} ${y + h * 0.3} H${x + w / 2}"/>`;

export const FIG: Record<string, string> = {
  /* ---------- vasos sagrados ---------- */
  calice: calice(),
  patena: `<ellipse class="m" cx="60" cy="66" rx="46" ry="12"/><ellipse class="m" cx="60" cy="64" rx="32" ry="7"/><ellipse class="h" cx="60" cy="60" rx="24" ry="5"/>${cruz(60, 56, 6, 6)}`,
  ambula: `${ambulaCalice(-17, 6, 0.8)}${ambulaPote(41, 6, 0.8)}<text x="31" y="116" text-anchor="middle">cálice</text><text x="89" y="116" text-anchor="middle">pote</text>`,
  "calice-ambula": `${calice(-17, 8, 0.8)}${ambulaCalice(41, 6, 0.8)}<text x="31" y="116" text-anchor="middle">afunila</text><text x="89" y="116" text-anchor="middle">bacia</text>`,
  pixide: `<path class="m" d="M30 56 H90 V82 Q90 90 82 90 H38 Q30 90 30 82 Z"/><ellipse class="m" cx="60" cy="56" rx="30" ry="8"/><path class="m" d="M30 56 Q60 34 90 56"/>${cruz(60, 34, 14, 10)}`,
  custodia: `${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((g) => `<path class="m" d="M60 42 L${60 + 36 * Math.cos((g * Math.PI) / 180)} ${42 + 36 * Math.sin((g * Math.PI) / 180)}"/>`).join("")}<circle class="m" cx="60" cy="42" r="20"/><circle class="h" cx="60" cy="42" r="13"/>${cruz(60, 2, 10, 8)}<rect class="m" x="56.5" y="62" width="7" height="34"/><ellipse class="m" cx="60" cy="78" rx="8" ry="4"/><path class="m" d="M32 112 Q60 92 88 112 Z"/>`,
  luneta: `<circle class="m" cx="60" cy="52" r="30"/><circle class="h" cx="60" cy="52" r="22"/><path class="m" d="M52 82 H68 L64 100 H56 Z"/><path class="m" d="M44 104 H76 V110 H44 Z"/>`,
  bandeja: `<ellipse class="m" cx="52" cy="62" rx="36" ry="10"/><ellipse class="m" cx="52" cy="60" rx="24" ry="5"/><path class="m" d="M86 60 H112 Q116 62 112 66 H86"/>`,
  /* ---------- panos ---------- */
  corporal: `<path class="p" d="M18 30 H102 V96 H18 Z"/><path class="guia" d="M46 30 V96 M74 30 V96 M18 52 H102 M18 74 H102"/>${cruz(60, 80, 12, 9)}`,
  sanguinho: `<path class="p" d="M14 46 H106 V76 H14 Z"/><path class="guia" d="M44 46 V76 M76 46 V76"/>${cruz(60, 53, 16, 10)}`,
  pala: `<path class="p" d="M26 26 H94 V94 H26 Z"/><path class="guia" d="M30 30 H90 V90 H30 Z"/>${cruz(60, 42, 36, 24)}`,
  manusterio: `<path class="p" d="M24 22 H96 V92 H24 Z"/><path class="guia" d="M24 32 H96 M24 82 H96"/><path d="M28 92 V102 M36 92 V102 M44 92 V102 M52 92 V102 M60 92 V102 M68 92 V102 M76 92 V102 M84 92 V102 M92 92 V102"/>`,
  veu: `<path class="c" d="M28 26 Q60 16 92 26 L104 108 H16 Z"/><path class="guia" d="M60 40 V64 M50 50 H70"/><path d="M40 108 Q60 98 80 108"/>`,
  toalha: `<path class="k" d="M18 58 H102 V108 H92 V66 H28 V108 H18 Z"/><path class="p" d="M10 48 H110 V60 H102 V84 H18 V60 H10 Z"/>`,
  umeral: `<path class="p" d="M8 44 Q60 24 112 44 L106 84 Q60 66 14 84 Z"/>${cruz(60, 40, 16, 10)}<path class="guia" d="M14 84 L10 92 M106 84 L110 92"/>`,
  /* ---------- credência e altar ---------- */
  galhetas: `<path class="m" d="M10 98 H110 V104 H10 Z"/><path class="r" d="M30 50 Q22 62 24 84 Q26 96 36 96 Q46 96 48 84 Q50 62 42 50 Z"/><rect class="m" x="32" y="40" width="8" height="10"/><path class="a" d="M74 50 Q66 62 68 84 Q70 96 80 96 Q90 96 92 84 Q94 62 86 50 Z"/><rect class="m" x="76" y="40" width="8" height="10"/><text x="36" y="34" text-anchor="middle">V</text><text x="80" y="34" text-anchor="middle">A</text>`,
  lavabo: `<path class="m" d="M10 86 Q60 112 110 86 Z"/><path class="m" d="M44 30 H70 Q80 50 74 76 H40 Q34 50 44 30 Z"/><path d="M70 34 Q86 34 82 52"/><path d="M44 34 L30 28"/>`,
  sineta: `<path class="m" d="M38 82 Q38 46 60 42 Q82 46 82 82 L88 90 H32 Z"/><circle class="m" cx="60" cy="96" r="5"/><rect class="k" x="55" y="12" width="10" height="30" rx="4"/>`,
  matraca: `<rect class="k" x="20" y="40" width="72" height="44" rx="4"/><rect class="k" x="92" y="56" width="22" height="12" rx="4"/><path class="k" d="M30 30 H58 V40 H30 Z"/><path class="guia" d="M44 30 V20"/>`,
  missal: `<path class="k" d="M30 104 L54 70 H66 L90 104"/><path class="c" d="M16 40 L60 52 L104 40 L100 76 L60 88 L20 76 Z"/><path class="p" d="M22 44 L58 54 V82 L24 72 Z M98 44 L62 54 V82 L96 72 Z"/><path d="M60 88 V100" class="guia"/><path class="r" d="M66 84 V104 M72 82 V100"/>`,
  lecionario: `<path class="p" d="M10 42 Q35 32 60 44 Q85 32 110 42 V92 Q85 82 60 94 Q35 82 10 92 Z"/><path d="M60 44 V94"/><path class="guia" d="M20 54 H50 M20 62 H50 M20 70 H46 M70 54 H100 M70 62 H100 M70 70 H96"/>`,
  evang: `<rect class="c" x="28" y="14" width="64" height="92" rx="4"/><rect class="m" x="36" y="22" width="48" height="76" rx="2"/>${cruz(60, 34, 52, 30)}<circle class="m" cx="60" cy="49" r="6"/>`,
  velas: `${vela(60, 30, 50)}<path class="m" d="M48 80 H72 V86 H48 Z M56 86 H64 V100 H56 Z M40 108 Q60 96 80 108 Z"/>`,
  cruz: `<path class="k" d="M54 10 H66 V96 H54 Z M30 30 H90 V42 H30 Z"/><path class="p" d="M60 32 V64 M48 36 L60 40 L72 36 M60 64 L56 80 M60 64 L64 80"/><circle class="p" cx="60" cy="28" r="4"/><path class="m" d="M40 106 Q60 92 80 106 Z"/>`,
  sacrario: `<path class="m" d="M26 46 Q60 14 94 46 V104 H26 Z"/><rect class="m" x="40" y="54" width="40" height="42" rx="2"/>${cruz(60, 62, 24, 14)}<circle class="e" cx="74" cy="76" r="2.5"/>${cruz(60, 12, 14, 10)}`,
  lampada: `<path d="M60 4 V36 M48 36 L60 24 L72 36"/><path class="r" d="M42 40 H78 Q80 72 60 82 Q40 72 42 40 Z"/><path class="f" d="M60 44 Q66 52 60 58 Q54 52 60 44 Z"/><path class="m" d="M38 36 H82 V42 H38 Z"/>`,
  cirio: `<rect class="p" x="48" y="20" width="24" height="76"/><path class="f" d="M60 4 Q68 12 60 18 Q52 12 60 4 Z"/>${cruz(60, 30, 40, 22)}<text x="52" y="40" text-anchor="middle" class="mini">Α</text><text x="68" y="40" text-anchor="middle" class="mini">Ω</text><circle class="c" cx="60" cy="42" r="2.2"/><circle class="c" cx="60" cy="34" r="2.2"/><circle class="c" cx="60" cy="50" r="2.2"/><circle class="c" cx="51" cy="42" r="2.2"/><circle class="c" cx="69" cy="42" r="2.2"/><path class="m" d="M40 96 H80 V104 H40 Z M50 104 H70 L76 114 H44 Z"/>`,
  credencia: `<path class="k" d="M16 64 H104 V70 H16 Z M22 70 V110 M98 70 V110"/><path class="p" d="M12 58 H108 V66 H12 Z"/>${calice(16, 22, 0.36)}<path class="r" d="M66 42 Q62 50 63 58 H71 Q72 50 68 42 Z"/><path class="a" d="M80 42 Q76 50 77 58 H85 Q86 50 82 42 Z"/><path class="m" d="M90 48 Q90 30 98 28 Q106 30 106 48 L108 52 H88 Z"/>`,
  /* ---------- procissão e incenso ---------- */
  turibulo: `<path d="M60 4 V14 M50 14 L36 56 M70 14 L84 56 M60 14 V44"/><circle class="m" cx="60" cy="10" r="5"/><path class="m" d="M36 56 Q60 30 84 56 Z"/><path class="guia" d="M50 48 V52 M60 44 V50 M70 48 V52"/><path class="m" d="M34 58 H86 Q86 84 60 88 Q34 84 34 58 Z"/><path class="m" d="M50 88 H70 L74 98 H46 Z"/><path class="guia" d="M52 28 Q48 20 54 14 M68 30 Q74 22 68 16"/>`,
  naveta: `<path class="m" d="M10 54 Q60 50 110 54 Q100 80 60 82 Q20 80 10 54 Z"/><path class="m" d="M16 54 Q60 34 104 54"/><path class="m" d="M50 82 H70 L74 96 H46 Z M40 96 H80 V102 H40 Z"/><path d="M84 46 L112 22"/><ellipse class="m" cx="114" cy="20" rx="5" ry="3"/>`,
  incenso: `<circle class="e" cx="40" cy="70" r="20"/><circle class="m" cx="40" cy="70" r="12"/><path class="m" d="M76 64 L84 60 L88 68 L80 72 Z M90 78 L98 74 L100 82 L92 84 Z M74 82 L80 80 L82 88 L76 88 Z M94 60 L100 58 L102 64 L96 66 Z"/><path class="guia" d="M36 46 Q30 34 38 24 M46 46 Q52 34 44 22"/>`,
  cruzproc: `<path class="k" d="M57 30 H63 V116 H57 Z"/><path class="m" d="M54 4 H66 V44 H54 Z M42 14 H78 V24 H42 Z"/>`,
  tochas: `<path class="k" d="M37 46 H43 V116 H37 Z M77 46 H83 V116 H77 Z"/><path class="m" d="M30 40 H50 L46 48 H34 Z M70 40 H90 L86 48 H74 Z"/>${vela(40, 18, 22)}${vela(80, 18, 22)}`,
  caldeirinha: `<path class="m" d="M22 54 H70 L64 104 H28 Z"/><path d="M24 56 Q46 14 68 56"/><ellipse class="a" cx="46" cy="56" rx="22" ry="5"/><path class="k" d="M74 98 L98 40"/><circle class="m" cx="102" cy="32" r="11"/><circle class="e" cx="99" cy="29" r="1.5"/><circle class="e" cx="105" cy="34" r="1.5"/>`,
  palio: `<path class="c" d="M14 26 H106 V40 H14 Z"/><path class="m" d="M14 40 L20 48 L26 40 L32 48 L38 40 L44 48 L50 40 L56 48 L62 40 L68 48 L74 40 L80 48 L86 40 L92 48 L98 40 L104 48 L106 40"/><path class="k" d="M16 40 V114 M104 40 V114 M38 40 V110 M82 40 V110"/>`,
  /* ---------- vestes ---------- */
  amito: `<path class="p" d="M24 34 H96 V84 H24 Z"/>${cruz(60, 40, 14, 10)}<path d="M24 36 Q10 60 4 92 M96 36 Q110 60 116 92"/>`,
  alva: `<path class="p" d="M48 12 Q60 20 72 12 L86 18 L112 52 L102 60 L86 42 L92 112 H28 L34 42 L18 60 L8 52 L34 18 Z"/><path class="guia" d="M60 26 V112"/>`,
  cingulo: `<path d="M18 40 Q60 20 102 40 Q60 60 18 40"/><path d="M60 48 Q56 72 48 92 M60 48 Q66 72 72 92"/><path class="p" d="M42 92 H54 L56 108 H40 Z M66 92 H78 L80 108 H64 Z"/>`,
  estola: `<path class="c" d="M44 10 Q60 22 76 10 L82 14 L72 112 H60 L66 24 Q60 28 54 24 L60 112 H48 L38 14 Z"/>${cruz(54, 90, 12, 8)}${cruz(66, 90, 12, 8)}${cruz(60, 14, 8, 6)}`,
  casula: `<path class="c" d="M60 12 Q72 12 78 18 Q108 30 112 84 Q90 108 60 110 Q30 108 8 84 Q12 30 42 18 Q48 12 60 12 Z"/><path class="m" d="M54 24 H66 V102 H54 Z M40 44 H80 V54 H40 Z"/><path class="p" d="M50 14 Q60 22 70 14"/>`,
  dalmatica: `<path class="c" d="M44 12 Q60 20 76 12 L92 16 L112 40 L100 52 L90 42 V110 H30 V42 L20 52 L8 40 L28 16 Z"/><path class="m" d="M42 24 H50 V110 H42 Z M70 24 H78 V110 H70 Z M30 86 H90 V92 H30 Z"/>`,
  pluvial: `<path class="c" d="M60 10 Q100 14 112 108 H74 L60 30 L46 108 H8 Q20 14 60 10 Z"/><path class="m" d="M44 18 Q60 12 76 18 L72 50 Q60 60 48 50 Z"/><rect class="m" x="54" y="22" width="12" height="8" rx="2"/><path class="m" d="M56 30 L46 108 H52 L60 34 L68 108 H74 L64 30 Z"/>`,
  sobrepeliz: `<path class="e" d="M40 64 H80 L86 114 H34 Z"/><path class="p" d="M48 12 Q60 18 72 12 L90 22 L114 76 L94 80 L84 56 L88 74 H32 L36 56 L26 80 L6 76 L30 22 Z"/><path class="guia" d="M40 74 L44 64 M56 74 V62 M72 74 V62 M80 74 L76 64"/>`,
  /* ---------- insígnias do bispo ---------- */
  mitra: `<path class="p" d="M30 90 V44 L58 10 L60 30 L62 10 L90 44 V90 Z"/><path class="m" d="M30 82 H90 V90 H30 Z M56 30 H64 V82 H56 Z"/>${cruz(60, 46, 18, 12)}<path class="p" d="M40 90 L36 114 H46 L48 90 M72 90 L74 114 H84 L80 90"/>`,
  baculo: `<path class="m" d="M57 44 H63 V116 H57 Z"/><path class="m" d="M57 46 V30 Q57 6 78 8 Q96 10 94 30 Q92 46 76 44 Q66 42 68 32 Q70 24 78 26"/><ellipse class="m" cx="60" cy="50" rx="7" ry="4"/>`,
  solideu: `<path class="v" d="M20 74 Q20 30 60 28 Q100 30 100 74 Q60 84 20 74 Z"/><path class="guia" d="M60 28 V80 M36 36 Q42 60 40 78 M84 36 Q78 60 80 78"/><path class="v" d="M56 22 H64 V30 H56 Z"/>`,
  anel: `<ellipse class="m" cx="60" cy="74" rx="30" ry="26"/><ellipse class="n" cx="60" cy="76" rx="20" ry="17"/><path class="v" d="M48 52 L60 36 L72 52 L60 60 Z"/><path class="m" d="M44 54 Q60 44 76 54 L72 58 Q60 52 48 58 Z"/>`,
  peitoral: `<path d="M24 8 Q60 52 96 8"/><path class="m" d="M54 38 H66 V56 H84 V68 H66 V108 H54 V68 H36 V56 H54 Z"/><circle class="v" cx="60" cy="62" r="4"/>`,
  palioarc: `<ellipse class="p" cx="60" cy="34" rx="40" ry="20"/><ellipse class="n" cx="60" cy="34" rx="28" ry="11"/><path class="p" d="M54 52 H66 V112 H54 Z"/><path class="e" d="M57 64 H63 V76 H57 Z M54 68 H66 V72 H54 Z M57 92 H63 V104 H57 Z M54 96 H66 V100 H54 Z M28 26 L32 32 M88 26 L92 32"/>`,
};
