"""Testes do gerar_dados.py com exemplos pequenos. Rode:  python3 -m unittest discover ferramentas"""
import unittest

import gerar_dados as g

IGMR_EXEMPLO = """INSTRUÇÃO GERAL DO MISSAL ROMANO
Sumário
PROÊMIO 5
CAPÍTULO I 9

PROÊMIO

Testemunho de fé inalterável

1. Quando Cristo Senhor estava para celebrar a ceia pascal[1], mandou preparar uma sala.

2. A natureza sacrifical da Missa foi proclamada.

CAPÍTULO I

IMPORTÂNCIA E DIGNIDADE DA CELEBRAÇÃO EUCARÍSTICA

3.A celebração da Missa é o centro de toda a vida cristã.
Continua no parágrafo seguinte.

I. Estrutura geral da Missa

A) Ritos iniciais

Glória in excelsis

4. Preparam-se também:
a) junto à cadeira: o Missal;
b) no ambão: o lecionário.
"""


class TestIGMR(unittest.TestCase):
    def setUp(self):
        self.nums = g.montar_igmr([IGMR_EXEMPLO])

    def test_numeros_em_ordem(self):
        self.assertEqual([x["n"] for x in self.nums], [1, 2, 3, 4])

    def test_tira_notas_de_rodape(self):
        self.assertNotIn("[1]", self.nums[0]["texto"])

    def test_numero_sem_espaco_depois_do_ponto(self):
        self.assertTrue(self.nums[2]["texto"].startswith("A celebração"))
        self.assertIn("Continua no parágrafo", self.nums[2]["texto"])

    def test_capitulo_e_secao(self):
        self.assertEqual(self.nums[0]["capitulo"], "Proêmio")
        self.assertEqual(self.nums[0]["secao"], "Testemunho de fé inalterável")
        self.assertEqual(self.nums[2]["capitulo"], "Capítulo I · Importância e dignidade da celebração Eucarística")
        self.assertEqual(self.nums[3]["secao"], "I. Estrutura geral da Missa › A) Ritos iniciais › Glória in excelsis")

    def test_alineas_ficam_em_linhas(self):
        self.assertEqual(self.nums[3]["texto"].split("\n")[1], "a) junto à cadeira: o Missal;")


class TestMissal(unittest.TestCase):
    def test_paginas_pelo_nome_do_arquivo(self):
        pags = g.paginas_do_missal({131: "a\fb\fc\f"})
        self.assertEqual(sorted(pags), [131, 132, 133])

    def test_cabecalho_e_titulos(self):
        pagina = ("                -\n          Primeira Semana do Advento    97\n\n"
                  "SEGUNDA-FEIRA\nAntífona da entrada     Ó nações, escutai\nCOLETA\nSenhor nosso Deus\n")
        item = g.indice_do_missal({97: pagina})[0]
        self.assertEqual(item["cab"], "Primeira Semana do Advento")
        self.assertEqual(item["tit"], ["SEGUNDA-FEIRA"])

    def test_titulo_centrado_dos_santos(self):
        pagina = ("700   Próprio dos Santos\n                       1 º de agosto\n"
                  "                       Santo Afonso Maria de Ligório,\n"
                  "                         bispo e doutor da Igreja\n"
                  "fez seus estudos em Magdeburgo, onde recebeu o nome.\n")
        item = g.indice_do_missal({700: pagina})[0]
        self.assertEqual(item["tit"], ["1º de agosto", "Santo Afonso Maria de Ligório, bispo e doutor da Igreja"])

    def test_numero_da_pagina_lido_errado_nao_vira_titulo(self):
        item = g.indice_do_missal({330: "33º            \nTERCEIRO DOMINGO DA PÁSCOA\n"})[0]
        self.assertNotIn("cab", item)
        self.assertEqual(item["tit"], ["TERCEIRO DOMINGO DA PÁSCOA"])

    def test_pagina_da_igmr_em_duas_colunas(self):
        nums = [{"n": 1}, {"n": 2}, {"n": 3}]
        paginas = {19: "1. Quando ia celebrar            2. A natureza", 20: "texto        3. Igualmente"}
        g.pagina_de_cada_numero(paginas, nums, 19, 20)
        self.assertEqual([x.get("pagina") for x in nums], [19, 19, 20])


if __name__ == "__main__":
    unittest.main()
