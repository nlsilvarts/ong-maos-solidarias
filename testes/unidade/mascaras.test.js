/*
 * Testes de unidade das máscaras de digitação (js/modules/mascaras.js).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aplicarMascara } from "../../js/modules/mascaras.js";

describe("aplicarMascara()", () => {
  it("CPF: formata enquanto o usuário digita", () => {
    assert.equal(aplicarMascara("529982", "cpf"), "529.982");
    assert.equal(aplicarMascara("5299822472", "cpf"), "529.982.247-2");
    assert.equal(aplicarMascara("52998224725", "cpf"), "529.982.247-25");
  });

  it("CPF: ignora letras e corta o que passar de 11 dígitos", () => {
    assert.equal(aplicarMascara("529.982.247-25", "cpf"), "529.982.247-25");
    assert.equal(aplicarMascara("529982247251234", "cpf"), "529.982.247-25");
  });

  it("telefone: celular com 11 dígitos e fixo com 10", () => {
    assert.equal(aplicarMascara("11987654321", "telefone"), "(11) 98765-4321");
    assert.equal(aplicarMascara("1134567890", "telefone"), "(11) 3456-7890");
  });

  it("telefone: formata números parciais", () => {
    assert.equal(aplicarMascara("11", "telefone"), "11");
    assert.equal(aplicarMascara("119", "telefone"), "(11) 9");
  });

  it("CEP: coloca o hífen e corta o que passar de 8 dígitos", () => {
    assert.equal(aplicarMascara("01000000", "cep"), "01000-000");
    assert.equal(aplicarMascara("0100", "cep"), "0100");
    assert.equal(aplicarMascara("010000001", "cep"), "01000-000");
  });

  it("tipo desconhecido: devolve o valor sem mudanças", () => {
    assert.equal(aplicarMascara("abc 123", "outro"), "abc 123");
  });
});
