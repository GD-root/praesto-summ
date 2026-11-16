# Praesto Sum

Guia de sacristia para acólitos, coroinhas e quem prepara a Santa Missa: o dia litúrgico, a preparação do altar,
as páginas do Missal Romano (CNBB, 2023), a Instrução Geral do Missal Romano e a equipe da celebração.
Funciona no celular como aplicativo e abre sem internet depois da primeira visita.

## Como está organizado

```
index.html                 a página (só a estrutura; o conteúdo é montado pelo código)
public/                    ícones e manifest do aplicativo
src/
  main.ts                  navegação e toques
  estado.ts                o que o app lembra (marcações e equipe ficam no aparelho)
  tipos.ts                 o formato de cada arquivo de dados
  dados/                   TODO o conteúdo, em JSON
    prefacios.json           prefácios, por grupo, com página e quando usar
    oracoes-eucaristicas.json
    bencaos.json
    celebracoes.json         Próprio dos Santos
    mapa.json                partes do Missal
    calendario.json          páginas do Advento, Quaresma e Páscoa; graus das celebrações
    objetos.json             preparação do altar
    ministerios.json         equipe e procissões
    igmr.json                ← gerado do Drive: os 399 números da IGMR
    indice-missal.json       ← gerado do Drive: os títulos de cada página do Missal
  liturgia/                o cálculo do calendário litúrgico (Páscoa, tempos, santos, precedência)
  telas/                   uma tela por arquivo
tests/                     testes automáticos
ferramentas/               o script em Python que lê o Drive (veja ferramentas/LEIAME.md)
```

Para **corrigir ou acrescentar conteúdo** (uma página, um texto de "quando usar", um santo), basta editar o JSON
correspondente em `src/dados/`. O TypeScript confere se o formato continua certo.

## Comandos

Precisa do [Node.js](https://nodejs.org) 22 ou mais novo.

```
npm install        uma vez, para baixar as ferramentas
npm run dev        abre o app no navegador para testar (atualiza sozinho a cada mudança)
npm test           roda os testes
npm run build      monta a versão final na pasta dist/
```

## Testes

- `tests/calendario.test.ts` confere o dia litúrgico de **todos os dias de 2000 a 2100** contra o gabarito
  gravado da versão 14 (o `index.html` antigo, de arquivo único). Uma correção de página só entra junto com a
  anotação dela no teste.
- `tests/telas.test.ts` confere que cada tela produz o mesmo HTML da versão 14.
- `tests/igmr.test.ts` confere a IGMR e o índice gerados do Drive.
- `ferramentas/test_gerar_dados.py` testa o script em Python.

## Publicação

O GitHub publica sozinho: a cada envio para a branch `main`, o fluxo `.github/workflows/publicar.yml` roda os
testes, monta o app e publica no GitHub Pages. Se algum teste falhar, nada é publicado.

**Uma vez só:** em *Settings › Pages › Build and deployment › Source*, escolha **GitHub Actions**.

Os celulares pegam a versão nova sozinhos na próxima vez que abrirem o app com internet. Não é mais preciso
trocar número de versão no `sw.js`: o service worker é gerado a cada publicação.

## Instalar no celular

- **iPhone:** abrir o endereço no Safari › Compartilhar › "Adicionar à Tela de Início".
- **Android:** abrir o endereço no Chrome › menu (três pontos) › "Instalar app".

Abra uma vez com internet; depois disso o app abre sem sinal.

## Observações

- O guia traz números de página, resumos de uso e títulos; os textos das orações continuam no Missal.
- A IGMR é a da 3ª edição típica (2002), na tradução portuguesa para o Brasil.
- As letras vêm do Google Fonts e ficam guardadas depois da primeira abertura com internet. Sem elas o app usa
  as letras do próprio celular e funciona do mesmo jeito.
