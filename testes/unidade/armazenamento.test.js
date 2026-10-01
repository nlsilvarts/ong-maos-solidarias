/*
 * Testes de unidade da persistência (js/modules/armazenamento.js e js/modules/historico.js).
 * Usam um localStorage em memória (apoio/armazenamento-falso.js).
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { instalarArmazenamentoFalso } from "./apoio/armazenamento-falso.js";
import { CHAVES, ler, salvar, remover, ehObjeto } from "../../js/modules/armazenamento.js";
import { lerHistorico, registrarEnvio, apagarHistorico, formatarDataHora } from "../../js/modules/historico.js";

const PREFIXO = "ong-maos-solidarias:";

describe("armazenamento.js", () => {
  let dados;
  beforeEach(() => {
    dados = instalarArmazenamentoFalso();
  });

  it("salva objetos como texto JSON, com o prefixo do projeto na chave", () => {
    assert.equal(salvar(CHAVES.preferencias, { textoGrande: true }), true);
    assert.equal(dados.get(PREFIXO + "preferencias"), '{"textoGrande":true}');
  });

  it("lê de volta o mesmo objeto", () => {
    salvar(CHAVES.preferencias, { textoGrande: true });
    assert.deepEqual(ler(CHAVES.preferencias, { textoGrande: false }), { textoGrande: true });
  });

  it("devolve o valor padrão quando a chave não existe", () => {
    assert.deepEqual(ler(CHAVES.preferencias, { textoGrande: false }), { textoGrande: false });
  });

  it("devolve o valor padrão quando o JSON está corrompido", () => {
    dados.set(PREFIXO + "preferencias", "{quebrado");
    assert.deepEqual(ler(CHAVES.preferencias, { textoGrande: false }), { textoGrande: false });
  });

  it("devolve o valor padrão quando a estrutura não é a esperada", () => {
    salvar(CHAVES.rascunho, [1, 2, 3]);
    assert.equal(ler(CHAVES.rascunho, null, ehObjeto), null);
  });

  it("remove a chave", () => {
    salvar(CHAVES.rascunho, { campos: {} });
    remover(CHAVES.rascunho);
    assert.equal(dados.has(PREFIXO + "rascunho-cadastro"), false);
  });

  it("continua funcionando quando o navegador bloqueia o armazenamento", () => {
    instalarArmazenamentoFalso({ falhar: true });
    assert.equal(salvar(CHAVES.preferencias, { textoGrande: true }), false);
    assert.equal(ler(CHAVES.preferencias, "padrão"), "padrão");
    assert.doesNotThrow(() => remover(CHAVES.preferencias));
  });

  it("ehObjeto() aceita só objetos comuns", () => {
    assert.equal(ehObjeto({}), true);
    assert.equal(ehObjeto(null), false);
    assert.equal(ehObjeto([]), false);
    assert.equal(ehObjeto("texto"), false);
  });
});

describe("historico.js", () => {
  let dados;
  beforeEach(() => {
    dados = instalarArmazenamentoFalso();
  });

  it("registra o envio com data ISO e guarda só os 5 mais recentes", () => {
    for (let i = 1; i <= 7; i += 1) {
      registrarEnvio({ primeiroNome: `Pessoa${i}`, participacao: "doador" });
    }
    const historico = lerHistorico();
    assert.equal(historico.length, 5);
    assert.equal(historico[0].primeiroNome, "Pessoa3");
    assert.equal(historico[4].primeiroNome, "Pessoa7");
    assert.ok(!Number.isNaN(Date.parse(historico[4].enviadoEm)));
  });

  it("descarta itens fora do formato e ignora valores que não são array", () => {
    const valido = { primeiroNome: "Ana", participacao: "doador", enviadoEm: "2026-09-30T12:00:00.000Z" };
    dados.set(PREFIXO + "cadastros-enviados", JSON.stringify([valido, null, { primeiroNome: 1 }, { primeiroNome: "X", enviadoEm: "ontem" }]));
    assert.deepEqual(lerHistorico(), [valido]);

    dados.set(PREFIXO + "cadastros-enviados", '{"primeiroNome":"Ana"}');
    assert.deepEqual(lerHistorico(), []);
  });

  it("apaga o histórico", () => {
    registrarEnvio({ primeiroNome: "Ana", participacao: "doador" });
    apagarHistorico();
    assert.deepEqual(lerHistorico(), []);
  });

  it("formata a data no padrão brasileiro e trata datas inválidas", () => {
    assert.match(formatarDataHora("2026-09-30T15:00:00.000Z"), /^\d{2}\/\d{2}\/\d{4},? \d{2}:\d{2}$/);
    assert.equal(formatarDataHora("ontem"), "data desconhecida");
  });
});
