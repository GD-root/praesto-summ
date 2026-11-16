/* Rotas: cada endereço (#roteiro, #objetos...) aponta para a função que desenha a tela. */
import { viewRoteiro } from "./dia";
import { viewBencaos, viewMapa, viewOracoes, viewPrefacios, viewSantos } from "./missal";
import { viewObjetos } from "./preparacao";
import { viewCorpo } from "./ministerios";
import { viewInicio } from "./inicio";
import { viewIGMR } from "./igmr";

/** Abas dentro do Missal (aparecem com a busca e a barra de abas). */
export const TABS: Record<string, () => string> = {
  roteiro: viewRoteiro,
  prefacios: viewPrefacios,
  oracoes: viewOracoes,
  bencaos: viewBencaos,
  santos: viewSantos,
  mapa: viewMapa,
  igmr: viewIGMR,
};

/** As três partes do guia e a tela inicial. */
export const SECOES: Record<string, () => string> = {
  inicio: viewInicio,
  objetos: viewObjetos,
  corpo: viewCorpo,
};
