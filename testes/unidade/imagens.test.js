/*
 * Testes de unidade das imagens otimizadas (ferramentas/imagens.js).
 * Conferem se cada original de imagens/originais/ tem as versões usadas pelo
 * site, com as mesmas dimensões (as páginas informam width e height) e menores
 * que o original. Se um original mudar, rode "npm run imagens".
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { VERSOES, PASTA_IMAGENS, listarOriginais } from "../../ferramentas/imagens.js";

const originais = await listarOriginais();

describe("imagens otimizadas", () => {
  it("encontra os originais (4 ilustrações em JPG e o logotipo em PNG)", () => {
    assert.deepEqual(originais.map(({ nome, extensao }) => nome + extensao), [
      "logo.png", "projeto-alimentos.jpg", "projeto-educacao.jpg", "projeto-meio-ambiente.jpg", "voluntarios.jpg"
    ]);
  });

  for (const original of originais) {
    it(`${original.nome}: versões ${VERSOES[original.extensao].map((v) => v.formato).join(", ")} com as mesmas dimensões e menores que o original`, async () => {
      const referencia = await sharp(original.caminho).metadata();
      const tamanhoOriginal = (await stat(original.caminho)).size;
      for (const { formato } of VERSOES[original.extensao]) {
        const caminho = join(PASTA_IMAGENS, `${original.nome}.${formato}`);
        const versao = await sharp(caminho).metadata();
        assert.equal(versao.format === "heif" ? "avif" : versao.format.replace("jpeg", "jpg"), formato, `${caminho}: formato`);
        assert.deepEqual([versao.width, versao.height], [referencia.width, referencia.height], `${caminho}: dimensões`);
        assert.ok((await stat(caminho)).size < tamanhoOriginal, `${caminho}: não ficou menor que o original`);
      }
    });
  }
});
