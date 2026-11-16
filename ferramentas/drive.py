"""
Baixa as pastas "IGMR" e "Missal" do Google Drive para ferramentas/entrada/.

Aceita dois tipos de credencial (veja ferramentas/LEIAME.md):
  - conta de serviço (arquivo JSON com "type": "service_account"): as pastas precisam estar
    compartilhadas com o e-mail da conta de serviço. Bom para rodar no GitHub Actions.
  - cliente OAuth "App para computador": abre o navegador para você entrar com a sua conta
    Google na primeira vez e guarda o acesso em ferramentas/token.json.

O acesso pedido é só de leitura (drive.readonly).
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

ESCOPOS = ["https://www.googleapis.com/auth/drive.readonly"]
PASTAS = ("IGMR", "Missal")
PASTA_MIME = "application/vnd.google-apps.folder"
DOC_MIME = "application/vnd.google-apps.document"


def _servico(credenciais: Path):
    try:
        from google.oauth2 import service_account
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
    except ImportError:
        sys.exit("Faltam as bibliotecas do Google. Rode:  pip install -r ferramentas/requirements.txt")

    if not credenciais.exists():
        sys.exit(f"Não encontrei {credenciais}. Veja ferramentas/LEIAME.md, seção 'Acesso ao Drive'.")
    info = json.loads(credenciais.read_text(encoding="utf-8"))

    if info.get("type") == "service_account":
        cred = service_account.Credentials.from_service_account_info(info, scopes=ESCOPOS)
    else:
        token = credenciais.with_name("token.json")
        cred = Credentials.from_authorized_user_file(str(token), ESCOPOS) if token.exists() else None
        if not cred or not cred.valid:
            if cred and cred.expired and cred.refresh_token:
                cred.refresh(Request())
            else:
                cred = InstalledAppFlow.from_client_secrets_file(str(credenciais), ESCOPOS).run_local_server(port=0)
            token.write_text(cred.to_json(), encoding="utf-8")
    return build("drive", "v3", credentials=cred, cache_discovery=False)


def _listar(servico, consulta: str) -> list[dict]:
    itens, pagina = [], None
    while True:
        r = servico.files().list(
            q=consulta, fields="nextPageToken, files(id, name, mimeType, modifiedTime)", pageToken=pagina,
            pageSize=200, supportsAllDrives=True, includeItemsFromAllDrives=True,
        ).execute()
        itens += r.get("files", [])
        pagina = r.get("nextPageToken")
        if not pagina:
            return itens


def _baixar(servico, arquivo: dict) -> bytes:
    from googleapiclient.http import MediaIoBaseDownload

    if arquivo["mimeType"] == DOC_MIME:
        pedido = servico.files().export_media(fileId=arquivo["id"], mimeType="text/plain")
    else:
        pedido = servico.files().get_media(fileId=arquivo["id"], supportsAllDrives=True)
    buf = io.BytesIO()
    baixador = MediaIoBaseDownload(buf, pedido)
    pronto = False
    while not pronto:
        _, pronto = baixador.next_chunk()
    return buf.getvalue()


def baixar_do_drive(credenciais: Path, destino: Path) -> None:
    servico = _servico(credenciais)
    for nome in PASTAS:
        pastas = _listar(servico, f"name = '{nome}' and mimeType = '{PASTA_MIME}' and trashed = false")
        if not pastas:
            sys.exit(f"Não encontrei a pasta {nome!r} no Drive (ou ela não foi compartilhada com estas credenciais).")
        if len(pastas) > 1:
            print(f"Aviso: há {len(pastas)} pastas chamadas {nome!r}; usando a modificada mais recentemente.", file=sys.stderr)
        pasta = max(pastas, key=lambda p: p.get("modifiedTime", ""))
        arquivos = _listar(servico, f"'{pasta['id']}' in parents and trashed = false and (mimeType = 'text/plain' or mimeType = '{DOC_MIME}')")
        saida = destino / nome
        saida.mkdir(parents=True, exist_ok=True)
        print(f"Baixando {len(arquivos)} arquivos da pasta {nome}...")
        for a in arquivos:
            nome_arq = a["name"] if a["name"].endswith(".txt") else a["name"] + ".txt"
            (saida / Path(nome_arq).name).write_bytes(_baixar(servico, a))
