# Ferramentas: dados do Drive para o app

O script `gerar_dados.py` lê as pastas **IGMR** e **Missal** do seu Google Drive e gera:

| Arquivo | O que tem |
|---|---|
| `src/dados/igmr.json` | Os 399 números da Instrução Geral do Missal Romano, cada um com capítulo, seção e a página do Missal em que começa |
| `src/dados/indice-missal.json` | Os títulos de cada uma das ~1270 páginas do Missal (só os títulos: "SEGUNDA-FEIRA", "Santo Afonso Maria de Ligório…"). Alimenta a busca do app |
| `ferramentas/relatorio-paginas.md` | Conferência das páginas que o app usa (Advento, Quaresma, Páscoa, 17 a 24 de dezembro, Próprio dos Santos) contra o texto do Missal |

O texto das orações do Missal **não** vai para o app: ele é usado só para achar páginas e conferir.

## O que precisa estar no Drive

```
IGMR/
  igmr-1.txt ... igmr-5.txt       a IGMR em partes, em ordem (a "sinopse" é ignorada)
Missal/
  missal-1.txt, missal-131.txt…   o Missal em partes; o número do nome é a página em que o arquivo começa,
                                  e as páginas vêm separadas por quebra de página (como sai do PDF)
```

## Rodar com uma cópia local (mais simples)

Baixe as duas pastas do Drive para `ferramentas/entrada/` (essa pasta não vai para o GitHub) e rode:

```
python3 ferramentas/gerar_dados.py --pasta ferramentas/entrada
npm test
```

Só usa a biblioteca padrão do Python 3.10 ou mais novo.

## Rodar direto do Drive

```
pip install -r ferramentas/requirements.txt
python3 ferramentas/gerar_dados.py --drive
```

### Acesso ao Drive

O script só pede permissão de **leitura**. Há duas formas:

**A. Sua própria conta (no seu computador)**
1. Em [console.cloud.google.com](https://console.cloud.google.com), crie um projeto e ative a **Google Drive API**.
2. Em *APIs e serviços › Credenciais*, crie um **ID do cliente OAuth** do tipo **App para computador**.
3. Baixe o JSON e salve como `ferramentas/credenciais.json`.
4. Na primeira vez o navegador abre para você entrar com a sua conta; o acesso fica guardado em
   `ferramentas/token.json`. Os dois arquivos ficam fora do GitHub (estão no `.gitignore`).

**B. Conta de serviço (para o GitHub atualizar sozinho)**
1. No mesmo projeto, crie uma **conta de serviço** e uma chave JSON para ela.
2. No Drive, compartilhe as pastas **IGMR** e **Missal** com o e-mail da conta de serviço (como leitor).
3. No GitHub, em *Settings › Secrets and variables › Actions*, crie o segredo `GOOGLE_CREDENCIAIS` com o
   conteúdo inteiro do JSON.
4. Em *Actions › Atualizar dados do Drive › Run workflow*. Se algo mudou, os dados novos vão para a branch
   `dados-do-drive`, já testados; abra um pull request para a `main` e confira antes de juntar.

## Testes

```
python3 -m unittest discover -s ferramentas
```
