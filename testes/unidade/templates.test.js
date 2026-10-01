/*
 * Testes de unidade dos templates (js/modules/templates.js) e dos dados (js/modules/dados.js).
 * Os templates devolvem HTML em texto, então dá para conferir o resultado sem navegador.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { escapar, numero, alerta, listaBadges, cartaoCampanha } from "../../js/modules/templates.js";
import { campanhas, projetos, percentualArrecadado } from "../../js/modules/dados.js";

describe("escapar()", () => {
  it("transforma os caracteres especiais do HTML em entidades", () => {
    assert.equal(escapar('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    assert.equal(escapar("D'Ávila & Cia"), "D&#39;Ávila &amp; Cia");
  });

  it("aceita números", () => {
    assert.equal(escapar(42), "42");
  });
});

describe("numero()", () => {
  it("usa o separador de milhar brasileiro", () => {
    assert.equal(numero(1480), "1.480");
    assert.equal(numero(2000), "2.000");
  });
});

describe("alerta()", () => {
  it("monta o alerta com tipo, id, papel e escapa os textos", () => {
    const html = alerta({ tipo: "erro", titulo: "<b>Erro</b>", texto: "Corrija os campos.", id: "alerta-erro", papel: "alert", oculto: true });
    assert.match(html, /class="alerta alerta-erro"/);
    assert.match(html, /id="alerta-erro"/);
    assert.match(html, /role="alert"/);
    assert.match(html, / hidden/);
    assert.match(html, /id="alerta-erro-texto"/);
    assert.match(html, /&lt;b&gt;Erro&lt;\/b&gt;/);
  });

  it("inclui o botão de fechar e o botão de ação quando pedidos", () => {
    const html = alerta({ titulo: "Rascunho", texto: "Recuperado.", fechavel: true, acao: { texto: "Descartar", id: "botao-descartar" } });
    assert.match(html, /aria-label="Fechar aviso: Rascunho"/);
    assert.match(html, /id="botao-descartar"/);
  });
});

describe("listaBadges() e cartaoCampanha()", () => {
  it("lista de badges tem rótulo acessível e textos escapados", () => {
    const html = listaBadges([{ texto: "<script>", tipo: "erro" }], "Situação");
    assert.match(html, /aria-label="Situação"/);
    assert.match(html, /badge-erro">&lt;script&gt;/);
  });

  it("cartão de campanha mostra o arrecadado, a meta e o percentual", () => {
    assert.match(cartaoCampanha(campanhas[0]), /1\.480 de 2\.000 peças \(74%\)/);
  });
});

describe("dados.js", () => {
  it("percentualArrecadado() arredonda e limita a 100%", () => {
    assert.deepEqual(campanhas.map(percentualArrecadado), [74, 40, 88]);
    assert.equal(percentualArrecadado({ arrecadado: 1, quantidade: 3 }), 33);
    assert.equal(percentualArrecadado({ arrecadado: 450, quantidade: 400 }), 100);
  });

  it("toda imagem de projeto tem texto alternativo, dimensões e os arquivos JPG e WebP", () => {
    for (const { titulo, imagem } of projetos) {
      assert.ok(imagem.alt.length > 10, `${titulo}: texto alternativo curto`);
      assert.ok(imagem.largura > 0 && imagem.altura > 0, `${titulo}: sem dimensões`);
      for (const formato of ["jpg", "webp"]) {
        const arquivo = new URL(`../../imagens/${imagem.arquivo}.${formato}`, import.meta.url);
        assert.ok(existsSync(arquivo), `${titulo}: falta ${imagem.arquivo}.${formato}`);
      }
    }
  });
});
