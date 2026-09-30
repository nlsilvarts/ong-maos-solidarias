/*
 * Rascunho do formulário de cadastro, salvo no localStorage enquanto o
 * usuário digita e restaurado quando ele volta à página, mesmo depois
 * de fechar a aba.
 *
 * Por privacidade, o CPF e o aceite da LGPD não são guardados: o CPF é
 * um dado sensível, e o consentimento deve ser dado a cada envio.
 */
import { CHAVES, ler, salvar, remover, ehObjeto } from "./armazenamento.js";

export const CAMPOS_RASCUNHO = [
  "nome", "email", "nascimento", "telefone", "cep", "endereco", "numero",
  "complemento", "bairro", "cidade", "estado", "participacao", "mensagem"
];

const rascunhoValido = (valor) =>
  ehObjeto(valor) && ehObjeto(valor.campos) && Array.isArray(valor.areas) && typeof valor.salvoEm === "string";

/* Grava: formulário → objeto → string (JSON.stringify, dentro de salvar) */
export function salvarRascunho(formulario) {
  const campos = {};
  CAMPOS_RASCUNHO.forEach((nome) => {
    campos[nome] = formulario.elements[nome].value; // nos rádios, o valor da opção marcada
  });
  const areas = [...formulario.querySelectorAll('input[name="areas"]:checked')].map((caixa) => caixa.value);

  const temConteudo = Object.values(campos).some((valor) => valor.trim() !== "") || areas.length > 0;
  if (!temConteudo) {
    remover(CHAVES.rascunho);
    return;
  }
  salvar(CHAVES.rascunho, { campos, areas, salvoEm: new Date().toISOString() });
}

/* Restaura: string → objeto (JSON.parse, dentro de ler) → campos preenchidos.
   Devolve os nomes dos campos restaurados e a data, ou null se não houver rascunho. */
export function restaurarRascunho(formulario) {
  const rascunho = ler(CHAVES.rascunho, null, rascunhoValido);
  if (!rascunho) {
    return null;
  }

  const restaurados = [];
  CAMPOS_RASCUNHO.forEach((nome) => {
    const valor = rascunho.campos[nome];
    if (typeof valor !== "string" || valor === "") {
      return;
    }
    // Atribuir .value (e não innerHTML) garante que o texto nunca vire código
    formulario.elements[nome].value = valor;
    restaurados.push(nome);
  });

  formulario.querySelectorAll('input[name="areas"]').forEach((caixa) => {
    caixa.checked = rascunho.areas.includes(caixa.value);
  });

  return { restaurados, salvoEm: rascunho.salvoEm };
}

export function descartarRascunho() {
  remover(CHAVES.rascunho);
}
