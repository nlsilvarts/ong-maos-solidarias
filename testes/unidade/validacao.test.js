/*
 * Testes de unidade das regras do formulário de cadastro (js/modules/validacao.js).
 * As regras não usam o DOM, então rodam direto no Node.js.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REGRAS, cpfValido, calcularIdade, dataLimite } from "../../js/modules/validacao.js";

const validar = (campo, valor) => REGRAS[campo].validar(valor);
const HOJE = new Date(2026, 8, 30); // 30/09/2026, para os cálculos de data não dependerem do dia

describe("cpfValido()", () => {
  it("aceita CPF com os dois dígitos verificadores corretos, com ou sem pontuação", () => {
    assert.equal(cpfValido("529.982.247-25"), true);
    assert.equal(cpfValido("52998224725"), true);
  });

  it("recusa CPF com o primeiro ou o segundo dígito verificador errado", () => {
    assert.equal(cpfValido("529.982.247-15"), false);
    assert.equal(cpfValido("529.982.247-24"), false);
  });

  it("recusa sequências repetidas e CPF incompleto", () => {
    assert.equal(cpfValido("111.111.111-11"), false);
    assert.equal(cpfValido("529.982.247"), false);
  });
});

describe("calcularIdade() e dataLimite()", () => {
  it("só conta o ano novo de vida a partir do dia do aniversário", () => {
    assert.equal(calcularIdade("2010-09-30", HOJE), 16);
    assert.equal(calcularIdade("2010-10-01", HOJE), 15);
  });

  it("devolve idade negativa para datas no futuro", () => {
    assert.equal(calcularIdade("2026-10-01", HOJE), -1);
  });

  it("gera a data limite no formato AAAA-MM-DD usado em min e max", () => {
    assert.equal(dataLimite(16, HOJE), "2010-09-30");
    assert.equal(dataLimite(120, HOJE), "1906-09-30");
  });
});

describe("REGRAS do formulário", () => {
  it("todo campo obrigatório tem rótulo e recusa valor vazio", () => {
    for (const [campo, regra] of Object.entries(REGRAS)) {
      assert.ok(regra.rotulo, `${campo} sem rótulo`);
      assert.notEqual(regra.validar(""), "", `${campo} aceitou valor vazio`);
    }
  });

  it("nome: exige nome e sobrenome, só com letras", () => {
    assert.equal(validar("nome", "Ana"), "Informe nome e sobrenome.");
    assert.equal(validar("nome", "Ana 2"), "Use apenas letras no nome.");
    assert.equal(validar("nome", "Ana Souza"), "");
    assert.equal(validar("nome", "Maria D'Ávila"), "");
    assert.equal(validar("nome", "João  da   Silva"), "");
  });

  it("e-mail: exige usuário, @ e domínio", () => {
    assert.match(validar("email", "ana@exemplo"), /e-mail válido/);
    assert.match(validar("email", "ana exemplo@site.com"), /e-mail válido/);
    assert.equal(validar("email", "ana@exemplo.com"), "");
  });

  it("CPF: confere o formato e depois os dígitos verificadores", () => {
    assert.match(validar("cpf", "529.982.247"), /formato 000\.000\.000-00/);
    assert.equal(validar("cpf", "529.982.247-24"), "CPF inválido. Confira os números digitados.");
    assert.equal(validar("cpf", "529.982.247-25"), "");
  });

  it("data de nascimento: recusa futuro, menores de 16 e mais de 120 anos", () => {
    const anoQueVem = new Date().getFullYear() + 1;
    assert.equal(validar("nascimento", `${anoQueVem}-01-01`), "A data não pode estar no futuro.");
    assert.equal(validar("nascimento", dataLimite(15)), "É preciso ter pelo menos 16 anos.");
    assert.equal(validar("nascimento", dataLimite(121)), "Confira o ano de nascimento.");
    assert.equal(validar("nascimento", dataLimite(16)), "");
    assert.equal(validar("nascimento", dataLimite(30)), "");
  });

  it("telefone: aceita fixo e celular, confere DDD e o 9 do celular", () => {
    assert.equal(validar("telefone", "(11) 98765-4321"), "");
    assert.equal(validar("telefone", "(11) 3456-7890"), "");
    assert.equal(validar("telefone", "(11) 88765-4321"), "Celular com 9 dígitos deve começar com 9.");
    assert.equal(validar("telefone", "(10) 98765-4321"), "DDD inválido. Confira os dois primeiros números.");
    assert.match(validar("telefone", "11987654321"), /formato \(00\) 00000-0000/);
  });

  it("CEP: exige o formato 00000-000 e recusa só zeros", () => {
    assert.equal(validar("cep", "01000-000"), "");
    assert.equal(validar("cep", "00000-000"), "CEP inválido.");
    assert.match(validar("cep", "01000"), /formato 00000-000/);
  });

  it("número: aceita números, letra no fim ou S/N", () => {
    for (const valor of ["120", "120A", "s/n", "S/N"]) {
      assert.equal(validar("numero", valor), "", valor);
    }
    assert.notEqual(validar("numero", "abc"), "");
    assert.notEqual(validar("numero", "1234567"), "");
  });

  it("endereço, bairro e cidade: recusam valores incompletos ou com números na cidade", () => {
    assert.equal(validar("endereco", "Ru"), "O endereço parece incompleto.");
    assert.equal(validar("bairro", "C"), "O bairro parece incompleto.");
    assert.equal(validar("cidade", "Campinas 2"), "Use apenas letras no nome da cidade.");
    assert.equal(validar("cidade", "São Paulo"), "");
  });

  it("estado, participação e aceite: basta haver uma escolha", () => {
    assert.equal(validar("estado", "SP"), "");
    assert.equal(validar("participacao", "doador"), "");
    assert.equal(validar("aceite", "sim"), "");
  });
});
