#!/usr/bin/env python3
"""
Gera os dados do Praesto Sum a partir dos textos do Missal e da IGMR guardados no Google Drive.

Entrada (pastas "IGMR" e "Missal" do Drive, ou uma cópia local delas):
  IGMR/igmr-1.txt ... igmr-5.txt     texto da Instrução Geral do Missal Romano, em partes
  Missal/missal-1.txt ... missal-N.txt  texto do Missal Romano (2023); cada arquivo começa
                                        na página do seu nome e as páginas vêm separadas
                                        pelo caractere de quebra de página (\\f)

Saída:
  src/dados/igmr.json             os 399 números da IGMR, com capítulo, seção e página do Missal
  src/dados/indice-missal.json    os títulos de cada página do Missal (só títulos, sem as orações)
  ferramentas/relatorio-paginas.md  conferência das páginas que o app usa

Uso:
  python3 ferramentas/gerar_dados.py --pasta ferramentas/entrada      (cópia local)
  python3 ferramentas/gerar_dados.py --drive                         (baixa do Drive)

Veja ferramentas/LEIAME.md para preparar o acesso ao Drive.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "src" / "dados"

# --------------------------------------------------------------------------------------------
# Leitura dos arquivos
# --------------------------------------------------------------------------------------------


def numero_no_nome(p: Path) -> int:
    m = re.search(r"(\d+)\D*$", p.stem)
    return int(m.group(1)) if m else 0


def ler_pasta(pasta: Path) -> tuple[list[str], dict[int, str]]:
    """Lê IGMR/igmr-*.txt e Missal/missal-*.txt de uma pasta local."""
    igmr_dir = achar_subpasta(pasta, "igmr")
    missal_dir = achar_subpasta(pasta, "missal")
    partes_igmr = sorted(
        (p for p in igmr_dir.glob("*.txt") if re.fullmatch(r"igmr-\d+", p.stem, re.I)), key=numero_no_nome
    )
    if not partes_igmr:
        sys.exit(f"Nenhum arquivo igmr-N.txt em {igmr_dir}")
    missal = {numero_no_nome(p): p.read_text(encoding="utf-8") for p in missal_dir.glob("missal-*.txt")}
    return [p.read_text(encoding="utf-8") for p in partes_igmr], missal


def achar_subpasta(pasta: Path, nome: str) -> Path:
    for p in pasta.iterdir():
        if p.is_dir() and p.name.lower() == nome:
            return p
    sys.exit(f"Não encontrei a pasta {nome!r} dentro de {pasta}")


# --------------------------------------------------------------------------------------------
# IGMR
# --------------------------------------------------------------------------------------------

RE_NUMERO = re.compile(r"^(\d{1,3})\.\s*([^\d\s].*)$")
RE_CAPITULO = re.compile(r"^CAP[IÍ]TULO\s+([IVXL]+)$", re.I)
RE_ROMANO = re.compile(r"^([IVX]+)\.\s+(.+)$")
RE_LETRA = re.compile(r"^([A-H])\)\s+(.+)$")
RE_NOTA = re.compile(r"\[\d+\]")


def eh_titulo(linha: str) -> bool:
    """Títulos são linhas curtas, sem pontuação no fim, que não começam por número de parágrafo."""
    return len(linha) < 110 and not RE_NUMERO.match(linha) and not re.search(r"[.;:,!?»”)]$", linha)


def maiusculas_para_titulo(s: str) -> str:
    """'ESTRUTURA DA MISSA, SEUS ELEMENTOS' -> 'Estrutura da Missa, seus elementos'"""
    if s != s.upper():
        return s
    menores = {"a", "à", "ao", "aos", "as", "às", "da", "das", "de", "do", "dos", "e", "em", "na", "nas", "no", "nos", "o", "os", "para", "pelo", "pela", "que", "seus", "suas", "sua", "seu", "um", "uma"}
    manter = {"missa": "Missa", "eucaristia": "Eucaristia", "eucarística": "Eucarística", "igrejas": "igrejas", "bispos": "Bispos"}
    palavras = s.lower().split()
    out = []
    for i, w in enumerate(palavras):
        nu = w.strip(",")
        if i == 0:
            out.append(w[0].upper() + w[1:])
        elif nu in manter:
            out.append(w.replace(nu, manter[nu]))
        else:
            out.append(w if nu in menores else w)
    return " ".join(out)


@dataclass
class Numero:
    n: int
    capitulo: str
    secao: str
    linhas: list[str] = field(default_factory=list)


def montar_igmr(partes: list[str]) -> list[dict]:
    texto = "\n".join(partes)
    linhas = [l.strip() for l in texto.splitlines()]
    linhas = [l for l in linhas if l]

    # O sumário no começo repete os títulos com números de página; o texto começa no segundo "PROÊMIO".
    inicios = [i for i, l in enumerate(linhas) if l.upper().startswith("PROÊMIO") and not re.search(r"\d+$", l)]
    if not inicios:
        sys.exit("IGMR: não encontrei o início do texto (PROÊMIO).")
    linhas = linhas[inicios[0]:]

    capitulo = "Proêmio"
    niveis: list[str] = []  # [seção romana, subseção com letra, assunto]
    esperando_titulo_capitulo = False
    numeros: list[Numero] = []
    atual: Numero | None = None

    for l in linhas:
        m = RE_NUMERO.match(l)
        if m and (not numeros or int(m.group(1)) == numeros[-1].n + 1):
            atual = Numero(int(m.group(1)), capitulo, " › ".join(niveis))
            atual.linhas.append(m.group(2))
            numeros.append(atual)
            esperando_titulo_capitulo = False
            continue
        if eh_titulo(l):
            mc = RE_CAPITULO.match(l)
            if mc:
                capitulo = "Capítulo " + mc.group(1).upper()
                niveis = []
                esperando_titulo_capitulo = True
                atual = None
                continue
            if l.upper().startswith("PROÊMIO"):
                continue
            if esperando_titulo_capitulo:
                capitulo += " · " + maiusculas_para_titulo(l)
                esperando_titulo_capitulo = False
                continue
            if RE_ROMANO.match(l):
                niveis = [l]
            elif RE_LETRA.match(l):
                niveis = niveis[:1] + [l]
            else:
                # assunto: substitui o assunto anterior, mantendo seção e subseção
                base = [x for x in niveis if RE_ROMANO.match(x) or RE_LETRA.match(x)]
                niveis = base + [l]
            atual = None
            continue
        if atual is not None:
            atual.linhas.append(l)

    esperados = list(range(1, len(numeros) + 1))
    if [x.n for x in numeros] != esperados:
        sys.exit("IGMR: a numeração saiu fora de ordem; confira o texto de entrada.")
    if len(numeros) != 399:
        print(f"Aviso: a IGMR tem 399 números; foram encontrados {len(numeros)}.", file=sys.stderr)

    saida = []
    for x in numeros:
        corpo = "\n".join(RE_NOTA.sub("", ln).strip() for ln in x.linhas)
        item = {"n": x.n, "capitulo": x.capitulo}
        if x.secao:
            item["secao"] = x.secao
        item["texto"] = re.sub(r"[ \t]+", " ", corpo).strip()
        saida.append(item)
    return saida


# --------------------------------------------------------------------------------------------
# Missal: páginas e títulos
# --------------------------------------------------------------------------------------------

# Partes do formulário de cada Missa: aparecem em quase toda página e não ajudam a achar nada.
TITULOS_COMUNS = {
    "COLETA", "ORACAO SOBRE AS OFERENDAS", "ORACAO DEPOIS DA COMUNHAO", "ORACAO SOBRE O POVO",
    "SOBRE AS OFERENDAS", "DEPOIS DA COMUNHAO", "SOBRE O POVO",  # o PDF às vezes parte o título
    "BENCAO SOLENE", "ANTIFONA DA ENTRADA", "ANTIFONA DA COMUNHAO", "PREFACIO", "OU", "OU:",
}


def sem_acento(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def paginas_do_missal(arquivos: dict[int, str]) -> dict[int, str]:
    """Junta os arquivos numa só sequência: página -> texto."""
    paginas: dict[int, str] = {}
    for inicio in sorted(arquivos):
        for i, txt in enumerate(arquivos[inicio].split("\f")):
            if not txt.strip() and i == len(arquivos[inicio].split("\f")) - 1:
                continue  # sobra depois da última quebra
            paginas[inicio + i] = txt
    return paginas


def cabecalho(linhas: list[str], p: int) -> tuple[str | None, int]:
    """Título corrido da página (a linha com o número da página). Devolve (título, linhas usadas)."""
    num = re.compile(r"(?<!\d)" + r"\s?".join(str(p)) + r"(?!\d)")
    usadas, cab = 0, None
    for l in linhas[:3]:
        s = l.strip()
        if s == "-" or s == str(p):
            usadas += 1
            continue
        if num.search(s) or s.endswith(" -") or re.fullmatch(r"\d{1,2}\s?º?", s):
            resto = num.sub("", s).strip(" -")
            # número da página lido errado (ex.: "33º" no lugar de "330") não é título
            cab = re.sub(r"\s{2,}", " ", resto) if re.search(r"[A-Za-zÀ-ú]{3}", resto) else None
            usadas += 1
            continue
        break
    return cab, usadas


def eh_titulo_missal(s: str) -> bool:
    """Títulos em maiúsculas: "SEGUNDA-FEIRA", "TERCEIRO DOMINGO DA PÁSCOA"."""
    letras = [c for c in s if c.isalpha()]
    if len(letras) < 4 or len(s) > 90:
        return False
    maius = sum(1 for c in letras if c.isupper())
    return maius / len(letras) > 0.85


def eh_titulo_centrado(linha: str, continuacao: bool = False) -> bool:
    """Títulos centralizados em letra normal, como nos Santos: "Santo Adalberto, bispo e mártir", "1 º de agosto".
    Na continuação de um título quebrado ("bispo e doutor da Igreja") a primeira letra pode ser minúscula."""
    recuo = len(linha) - len(linha.lstrip())
    s = linha.strip()
    if recuo < 12 or len(s) > 80 or len(s) < 4 or "   " in s:
        return False
    if not (continuacao or s[0].isupper() or s[0].isdigit()):
        return False
    if re.search(r"[.!?;:]$", s):  # frases de antífonas e rubricas, não títulos
        return False
    return len(s.split()) <= 12


def limpar_titulo(s: str) -> str:
    s = re.sub(r"\s{2,}", " ", s.strip()).lstrip("®").strip()  # ® marca o que é próprio do Brasil
    return re.sub(r"(\d) º", r"\1º", s)  # "1 º de agosto" -> "1º de agosto"


def eh_ruido(s: str, p: int) -> bool:
    """Notas de partitura lidas como letras ("IIOII") e parágrafos da IGMR impressos nas p. 19 a 66."""
    if re.fullmatch(r"[\W\dIlOo•_]+", s):
        return True
    return 19 <= p <= 66 and bool(re.match(r"^\d+\.\s+[A-ZÀ-Ú][a-zà-ú]", s))


def indice_do_missal(paginas: dict[int, str]) -> list[dict]:
    indice = []
    for p in sorted(paginas):
        linhas = [l for l in paginas[p].splitlines() if l.strip()]
        cab, usadas = cabecalho(linhas, p)
        titulos: list[str] = []
        continua = False  # o título anterior terminou em vírgula e segue na linha de baixo
        for l in linhas[usadas:]:
            s = limpar_titulo(l)
            centrado = eh_titulo_centrado(l)
            if continua and titulos and eh_titulo_centrado(l, continuacao=True):
                titulos[-1] += " " + s
                continua = s.endswith(",")
                continue
            continua = False
            if not (eh_titulo_missal(s) or centrado) or eh_ruido(s, p):
                continue
            chave = re.sub(r"\s+", " ", re.sub(r"[^A-Z ]", "", sem_acento(s.upper()))).strip()
            if chave in TITULOS_COMUNS or chave.startswith("PREFACIO DA") and len(s) < 20:
                continue
            if s not in titulos:
                titulos.append(s)
                continua = s.endswith(",")
        # título terminado em vírgula sem continuação é verso de antífona, não título
        titulos = [t for t in titulos if not t.endswith(",")]
        item: dict = {"p": p}
        if cab:
            item["cab"] = cab
        item["tit"] = titulos
        indice.append(item)
    return indice


def pagina_de_cada_numero(paginas: dict[int, str], numeros: list[dict], de: int = 19, ate: int = 66) -> None:
    """Procura, nas páginas da IGMR impressas no Missal, onde começa cada número."""
    # O Missal imprime a IGMR em duas colunas: o número pode estar no começo da linha
    # ou depois do espaço que separa as colunas.
    p = de
    for item in numeros:
        padrao = re.compile(r"(?m)(^|\s{3,})" + r"\s?".join(str(item["n"])) + r"\s?\.\s")
        for q in range(p, min(p + 3, ate) + 1):  # os números andam em ordem, no máximo umas páginas por vez
            if padrao.search(paginas.get(q, "")):
                item["pagina"] = q
                p = q
                break
    # Números que a leitura do texto não achou (ex.: "z." no lugar de "2."): se o anterior e o
    # seguinte estão na mesma página, ele também está.
    for i, item in enumerate(numeros):
        if "pagina" in item:
            continue
        antes = next((x["pagina"] for x in reversed(numeros[:i]) if "pagina" in x), None)
        depois = next((x["pagina"] for x in numeros[i + 1:] if "pagina" in x), None)
        if antes is not None and antes == depois:
            item["pagina"] = antes
        elif antes is not None and depois is not None and depois - antes == 1:
            item["pagina"], item["paginaAte"] = antes, depois  # numa das duas páginas


# --------------------------------------------------------------------------------------------
# Conferência das páginas usadas pelo app
# --------------------------------------------------------------------------------------------

DIAS = ["DOMINGO", "SEGUNDA-FEIRA", "TERCA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SABADO"]
ORDINAIS = ["", "PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA", "SEXTA", "SETIMA"]
ORDINAIS_M = ["", "PRIMEIRO", "SEGUNDO", "TERCEIRO", "QUARTO", "QUINTO", "SEXTO", "SETIMO"]
TEMPOS = {"advento": "Advento", "quaresma": "Quaresma", "pascoa": "Páscoa"}
MESES = ["JANEIRO", "FEVEREIRO", "MARCO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"]


def texto_busca(item: dict) -> str:
    return sem_acento(" ".join([item.get("cab", "")] + item["tit"]).upper())


def confere_dia(idx: dict[int, dict], p: int, tempo: str, semana: int, dia: int) -> tuple[bool, int | None]:
    """A página p é a Missa desse dia? Se não for, sugere a página certa entre p-4 e p+4."""

    def bate(q: int) -> bool:
        item = idx.get(q)
        if not item:
            return False
        tit = [sem_acento(t.upper()) for t in item["tit"]]
        cab = sem_acento(item.get("cab", "").upper())
        if dia == 0:
            alvo = ORDINAIS_M[semana] + " DOMINGO"
            return any(alvo in t for t in tit)
        tem_dia = any(t.startswith(DIAS[dia]) for t in tit)
        semana_ok = ORDINAIS[semana] in cab or not cab or "SEMANA" not in cab
        return tem_dia and semana_ok

    if bate(p):
        return True, None
    for d in (1, -1, 2, -2, 3, -3, 4, -4):
        if bate(p + d):
            return False, p + d
    return False, None


def conferir(indice: list[dict]) -> tuple[str, int]:
    idx = {x["p"]: x for x in indice}
    cal = json.loads((DADOS / "calendario.json").read_text(encoding="utf-8"))
    celeb = json.loads((DADOS / "celebracoes.json").read_text(encoding="utf-8"))
    linhas = ["# Conferência das páginas do Missal", "",
              f"Gerado em {date.today():%d/%m/%Y} por `ferramentas/gerar_dados.py`, comparando as páginas usadas pelo app",
              "com os títulos encontrados no texto do Missal (pasta Missal do Drive).", ""]
    problemas = 0

    for chave, nome in TEMPOS.items():
        linhas += [f"## {nome}: dias de semana e domingos", ""]
        tabela = ["| Semana | Dia | Página no app | Situação |", "|---|---|---|---|"]
        for semana, pags in cal[chave].items():
            for dia, p in enumerate(pags):
                s = int(semana)
                if chave == "advento" and (s == 4 and dia > 0 or s == 3 and dia == 6):
                    continue  # esses dias sempre caem entre 17 e 24 de dezembro, que têm Missa própria
                if chave == "pascoa" and s == 7 and dia == 0:
                    continue  # no Brasil, a Ascensão toma o lugar do 7º domingo
                ok, sug = confere_dia(idx, p, chave, s, dia)
                if ok:
                    continue
                problemas += 1
                situ = f"provavelmente p. {sug}" if sug else "não encontrei a Missa perto dessa página"
                tabela.append(f"| {s}ª | {DIAS[dia].capitalize()} | {p} | {situ} |")
        linhas += (tabela if len(tabela) > 2 else ["Todas as páginas conferem."]) + [""]

    linhas += ["## Advento: 17 a 24 de dezembro", ""]
    antes = len(linhas)
    for d in range(17, 25):
        p = 100 + d
        alvo = f"{d} DE DEZEMBRO"
        if not any(alvo in texto_busca(idx[q]) for q in (p, p - 1) if q in idx):
            achada = next((q for q in range(p - 6, p + 7) if q in idx and alvo in texto_busca(idx[q])), None)
            problemas += 1
            linhas.append(f"- {d} de dezembro: o app usa p. {p}" + (f"; o título aparece na p. {achada}" if achada else "; título não encontrado"))
    if len(linhas) == antes:
        linhas.append("Todas as páginas conferem.")
    linhas.append("")

    linhas += ["## Próprio dos Santos", "", "Celebrações cuja página não traz nem a data nem o nome no título (pode ser só erro de leitura do PDF):", ""]
    vistos = set()
    for c in celeb:
        if not c.get("mes") or c["pagina"] < 659:
            continue
        k = (c["mes"], c["dia"], c["pagina"])
        if k in vistos:
            continue
        vistos.add(k)
        # "9 de março" não pode casar dentro de "19 de março"
        alvo = re.compile(rf"(?<!\d){c['dia']}\s?[º°]? DE {MESES[c['mes'] - 1]}")
        perto = [q for q in (c["pagina"], c["pagina"] - 1) if q in idx]
        if any(alvo.search(texto_busca(idx[q])) for q in perto):
            continue
        # quando a linha da data se perdeu na leitura do PDF, vale o nome do santo no título da página
        nome = sem_acento(re.split(r"[,:]", c["nome"])[0].upper())
        if c["pagina"] in idx and nome in texto_busca(idx[c["pagina"]]):
            continue
        achada = next((q for q in range(c["pagina"] - 3, c["pagina"] + 4) if q in idx and alvo.search(texto_busca(idx[q]))), None)
        problemas += 1
        linhas.append(f"- {c['data']}, {c['nome']}: app p. {c['pagina']}" + (f"; data encontrada na p. {achada}" if achada else ""))
    linhas.append("")
    linhas.insert(5, f"**{problemas} páginas para conferir.**\n")
    return "\n".join(linhas), problemas


# --------------------------------------------------------------------------------------------
# Principal
# --------------------------------------------------------------------------------------------


def gravar_json(nome: str, obj) -> None:
    caminho = DADOS / nome
    caminho.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"  {caminho.relative_to(RAIZ)}  ({caminho.stat().st_size // 1024} KB)")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    fonte = ap.add_mutually_exclusive_group(required=True)
    fonte.add_argument("--pasta", type=Path, help="pasta local com as subpastas IGMR e Missal")
    fonte.add_argument("--drive", action="store_true", help="baixar as pastas IGMR e Missal do Google Drive")
    ap.add_argument("--credenciais", type=Path, default=Path(__file__).parent / "credenciais.json",
                    help="arquivo de credenciais do Google (veja ferramentas/LEIAME.md)")
    args = ap.parse_args()

    if args.drive:
        from drive import baixar_do_drive  # só precisa das bibliotecas do Google quando usa o Drive

        destino = Path(__file__).parent / "entrada"
        baixar_do_drive(args.credenciais, destino)
        args.pasta = destino

    partes_igmr, arquivos_missal = ler_pasta(args.pasta)
    print("Lendo a IGMR...")
    numeros = montar_igmr(partes_igmr)
    hoje = date.today().isoformat()

    paginas = paginas_do_missal(arquivos_missal) if arquivos_missal else {}
    if paginas:
        pagina_de_cada_numero(paginas, numeros)
        com_pagina = sum(1 for x in numeros if "pagina" in x)
        print(f"  {len(numeros)} números; {com_pagina} localizados nas páginas 19 a 66 do Missal")

    print("Gravando:")
    gravar_json("igmr.json", {
        "fonte": "Instrução Geral do Missal Romano, 3ª edição típica (2002), tradução portuguesa para o Brasil. "
                 "Páginas: Missal Romano, tradução brasileira (CNBB, 2023).",
        "gerado": hoje,
        "numeros": numeros,
    })
    if paginas:
        indice = indice_do_missal(paginas)
        gravar_json("indice-missal.json", {
            "fonte": "Títulos das páginas do Missal Romano, tradução brasileira (CNBB, 2023). Só os títulos, sem o texto das orações.",
            "gerado": hoje,
            "paginas": indice,
        })
        relatorio, problemas = conferir(indice)
        rel = Path(__file__).parent / "relatorio-paginas.md"
        rel.write_text(relatorio, encoding="utf-8")
        print(f"  {rel.relative_to(RAIZ)}  ({problemas} páginas para conferir)")


if __name__ == "__main__":
    main()
