/*
 * Testes de unidade da verificação de contraste (ferramentas/contraste.js).
 * Conferem a fórmula da WCAG com valores de referência e exigem que todo par
 * de cores do site atinja o mínimo: 4,5:1 para texto, 3:1 para componentes e
 * gráficos e 7:1 para texto no modo de alto contraste.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contraste, formatar, lerVariaveis, resolverCor, verificarPares } from "../../ferramentas/contraste.js";

const css = readFileSync(new URL("../../css/style.css", import.meta.url), "utf8");

describe("contraste(): fórmula de luminância relativa da WCAG", () => {
  it("preto e branco dão 21:1; cores iguais, 1:1", () => {
    assert.equal(contraste("#000000", "#ffffff"), 21);
    assert.equal(contraste("#1f5a40", "#1f5a40"), 1);
  });

  it("a ordem das cores não muda o resultado", () => {
    assert.equal(contraste("#767676", "#ffffff"), contraste("#ffffff", "#767676"));
  });

  it("confere valores de referência: #767676 passa e #777777 fica abaixo de 4,5:1 sobre o branco", () => {
    assert.equal(formatar(contraste("#767676", "#ffffff"), 4.5), "4,54:1");
    assert.ok(contraste("#777777", "#ffffff") < 4.5);
  });

  it("não arredonda para cima um valor abaixo do mínimo", () => {
    assert.equal(formatar(4.497, 4.5), "4,49:1");
    assert.equal(formatar(4.497), "4,50:1");
  });
});

describe("leitura das variáveis do style.css", () => {
  it("segue as referências var() até a cor final", () => {
    const altoContraste = { ...lerVariaveis(css, ":root"), ...lerVariaveis(css, "html.alto-contraste") };
    assert.equal(resolverCor(lerVariaveis(css, ":root"), "--cor-foco"), "#1f5a40");
    assert.equal(resolverCor(altoContraste, "--cor-foco"), "#ffff00");
  });

  it("aceita cores de três dígitos e acusa variáveis inexistentes ou circulares", () => {
    assert.equal(resolverCor({ "--a": "#FA0" }, "--a"), "#ffaa00");
    assert.throws(() => resolverCor({}, "--cor-inexistente"), /não existe/);
    assert.throws(() => resolverCor({ "--a": "var(--b)", "--b": "var(--a)" }, "--a"), /circular/);
  });

  it("acusa um par abaixo do mínimo", () => {
    const cssAlterado = css.replace("--cor-borda-campo: #767676", "--cor-borda-campo: #bbbbbb");
    const falhas = verificarPares(cssAlterado).filter((resultado) => !resultado.ok);
    assert.deepEqual(falhas.map(({ modo, elemento }) => `${modo}: ${elemento}`), ["Modo normal: Borda dos campos"]);
  });
});

describe("pares de cores do site", () => {
  for (const r of verificarPares(css)) {
    it(`${r.modo}: ${r.elemento} – ${formatar(r.razao, r.minimo)} (mínimo ${String(r.minimo).replace(".", ",")}:1)`, () => {
      assert.ok(r.ok, `${r.corFrente} sobre ${r.corFundo}: ${formatar(r.razao, r.minimo)}, abaixo do mínimo de ${r.minimo}:1`);
    });
  }
});
