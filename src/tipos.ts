/* Tipos dos dados do Praesto Sum.
   Os arquivos em src/dados/*.json seguem estes formatos; o TypeScript avisa se algum campo faltar ou vier trocado. */

export type Cor = "roxo" | "branco" | "verde" | "vermelho" | "varia";

/* ---------- Prefácios ---------- */
export interface Prefacio {
  numeral: string;
  titulo: string;
  paginas: string;
  /** Marcado com ® no Missal: próprio da edição brasileira */
  brasil: boolean;
  uso?: string;
  cor?: Cor;
}
export interface GrupoPrefacios { nome: string; cor: Cor; uso?: string; itens: Prefacio[] }
export interface SecaoPrefacios { secao: string; grupos: GrupoPrefacios[] }

/* ---------- Orações Eucarísticas ---------- */
export interface OracaoEucaristica {
  nome: string;
  subtitulo: string;
  /** primeira e última página no Missal */
  de: number;
  ate: number;
  resumo: string;
  quando: string;
  prefacio: string;
  brasil?: boolean;
}
export interface FamiliaOracoes { familia: string; oracoes: OracaoEucaristica[] }

/* ---------- Mapa do Missal ---------- */
export interface ParteMissal { nome: string; de: number; ate: number; subitens: { nome: string; pagina: number }[] }

/* ---------- Celebrações do Próprio dos Santos ---------- */
export interface Celebracao {
  nome: string;
  /** mês e dia; ausentes nas celebrações de data móvel */
  mes?: number;
  dia?: number;
  pagina: number;
  /** a data por extenso, como aparece na lista */
  data: string;
}

/* ---------- Bênçãos ---------- */
export interface Bencao { titulo: string; paginas: string; quando?: string }
export interface GrupoBencaos { nome: string; cor: Cor; uso?: string; itens: Bencao[] }
export interface SecaoBencaos { secao: string; grupos: GrupoBencaos[] }

/* ---------- Tabelas do calendário ---------- */
export interface TabelasCalendario {
  /** semana -> páginas de domingo a sábado */
  advento: Record<string, number[]>;
  quaresma: Record<string, number[]>;
  pascoa: Record<string, number[]>;
  /** datas "mês-dia" de cada grau */
  graus: { solenidades: string[]; festas: string[]; memorias: string[] };
  festasDoSenhor: number[];
  prefacioProprio: Record<string, string>;
  semprebranco: number[];
}

/* ---------- Preparação do altar ---------- */
export interface ObjetoLiturgico {
  id: string;
  nome: string;
  uso: string;
  /** conta para o "altar preparado" */
  essencial: boolean;
  lembretes?: string[];
}
export interface GrupoObjetos { id: string; nome: string; uso?: string; figura?: boolean; itens: ObjetoLiturgico[] }

/* ---------- Ministérios ---------- */
export interface Opcao { id: string; nome: string }
export interface DadosMinisterios {
  contagens: { id: string; nome: string; max: number }[];
  grupos: { nome: string; opcoes: Opcao[] }[];
  santissimo: Opcao[];
}

/* ---------- IGMR (gerada a partir do Drive por ferramentas/gerar_dados.py) ---------- */
export interface NumeroIGMR {
  n: number;
  /** capítulo e seção em que o número está */
  capitulo: string;
  secao?: string;
  texto: string;
  /** página do Missal Romano (2023) em que o número começa, quando foi encontrada */
  pagina?: number;
  /** quando não se sabe a página exata: o número está entre "pagina" e "paginaAte" */
  paginaAte?: number;
}
export interface DadosIGMR {
  fonte: string;
  gerado: string;
  numeros: NumeroIGMR[];
}

/* ---------- Índice das páginas do Missal (gerado por ferramentas/gerar_dados.py) ---------- */
export interface PaginaMissal {
  p: number;
  /** título corrido da página (ex.: "Primeira Semana do Advento") */
  cab?: string;
  /** títulos que começam nesta página (ex.: "SEGUNDA-FEIRA") */
  tit: string[];
}
export interface IndiceMissal { fonte: string; gerado: string; paginas: PaginaMissal[] }
