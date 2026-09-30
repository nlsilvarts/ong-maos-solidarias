/*
 * Regras de verificação de consistência do formulário de cadastro.
 *
 * Cada regra recebe o valor do campo e devolve a mensagem de erro,
 * ou uma string vazia quando o valor está correto. As regras não
 * mexem no DOM: isso fica com formulario.js. Assim, elas podem ser
 * testadas e reaproveitadas em outros formulários.
 */

// Letras (inclusive acentuadas), espaço, hífen e apóstrofo
const SO_LETRAS = /^[\p{L}' -]+$/u;

/* Confere os dois dígitos verificadores do CPF */
export function cpfValido(cpf) {
  const numeros = cpf.replace(/\D/g, "");

  // 11 dígitos e não pode ser uma sequência repetida, como 111.111.111-11
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  const calcularDigito = (base) => {
    const soma = [...base].reduce((total, numero, indice) => total + Number(numero) * (base.length + 1 - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(numeros.slice(0, 9)) === Number(numeros[9])
    && calcularDigito(numeros.slice(0, 10)) === Number(numeros[10]);
}

/* Idade completa em anos a partir de uma data no formato AAAA-MM-DD */
export function calcularIdade(dataISO, hoje = new Date()) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  if (mesAtual < mes || (mesAtual === mes && hoje.getDate() < dia)) {
    idade -= 1;
  }
  return idade;
}

/* Data de hoje menos N anos, no formato AAAA-MM-DD (usada em min e max do campo de data) */
export function dataLimite(anos, hoje = new Date()) {
  const data = new Date(hoje.getFullYear() - anos, hoje.getMonth(), hoje.getDate());
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export const IDADE_MINIMA = 16;
export const IDADE_MAXIMA = 120;

/* Uma regra por campo: rótulo (usado no resumo de erros) e função de verificação */
export const REGRAS = {
  nome: {
    rotulo: "Nome completo",
    validar(valor) {
      const nome = valor.replace(/\s+/g, " ");
      if (!nome) return "Informe seu nome completo.";
      if (!SO_LETRAS.test(nome)) return "Use apenas letras no nome.";
      if (nome.split(" ").filter((parte) => parte.length >= 2).length < 2) return "Informe nome e sobrenome.";
      return "";
    }
  },

  email: {
    rotulo: "E-mail",
    validar(valor) {
      if (!valor) return "Informe seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "Informe um e-mail válido, como nome@exemplo.com.";
      return "";
    }
  },

  cpf: {
    rotulo: "CPF",
    validar(valor) {
      if (!valor) return "Informe seu CPF.";
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) return "Complete o CPF no formato 000.000.000-00.";
      if (!cpfValido(valor)) return "CPF inválido. Confira os números digitados.";
      return "";
    }
  },

  nascimento: {
    rotulo: "Data de nascimento",
    validar(valor) {
      if (!valor) return "Informe a data de nascimento completa.";
      const idade = calcularIdade(valor);
      if (idade < 0) return "A data não pode estar no futuro.";
      if (idade < IDADE_MINIMA) return `É preciso ter pelo menos ${IDADE_MINIMA} anos.`;
      if (idade > IDADE_MAXIMA) return "Confira o ano de nascimento.";
      return "";
    }
  },

  telefone: {
    rotulo: "Telefone",
    validar(valor) {
      if (!valor) return "Informe um telefone para contato.";
      const partes = valor.match(/^\((\d{2})\) (\d{4,5})-(\d{4})$/);
      if (!partes) return "Complete o telefone no formato (00) 00000-0000.";
      const [, ddd, prefixo] = partes;
      if (ddd.includes("0")) return "DDD inválido. Confira os dois primeiros números.";
      if (prefixo.length === 5 && !prefixo.startsWith("9")) return "Celular com 9 dígitos deve começar com 9.";
      return "";
    }
  },

  cep: {
    rotulo: "CEP",
    validar(valor) {
      if (!valor) return "Informe o CEP.";
      if (!/^\d{5}-\d{3}$/.test(valor)) return "Complete o CEP no formato 00000-000.";
      if (/^0{5}-0{3}$/.test(valor)) return "CEP inválido.";
      return "";
    }
  },

  endereco: {
    rotulo: "Endereço",
    validar(valor) {
      if (!valor) return "Informe o nome da rua ou avenida.";
      if (valor.length < 3) return "O endereço parece incompleto.";
      return "";
    }
  },

  numero: {
    rotulo: "Número",
    validar(valor) {
      if (!valor) return "Informe o número ou S/N.";
      if (!/^(\d{1,6}[a-z]?|s\/n)$/i.test(valor)) return "Use apenas números (ex.: 120 ou 120A) ou S/N.";
      return "";
    }
  },

  bairro: {
    rotulo: "Bairro",
    validar(valor) {
      if (!valor) return "Informe o bairro.";
      if (valor.length < 2) return "O bairro parece incompleto.";
      return "";
    }
  },

  cidade: {
    rotulo: "Cidade",
    validar(valor) {
      if (!valor) return "Informe a cidade.";
      if (!SO_LETRAS.test(valor)) return "Use apenas letras no nome da cidade.";
      return "";
    }
  },

  estado: {
    rotulo: "Estado",
    validar(valor) {
      return valor ? "" : "Selecione o estado.";
    }
  },

  participacao: {
    rotulo: "Forma de participação",
    validar(valor) {
      return valor ? "" : "Escolha como deseja participar.";
    }
  },

  aceite: {
    rotulo: "Consentimento",
    validar(valor) {
      return valor ? "" : "É preciso autorizar o uso dos dados para enviar o cadastro.";
    }
  }
};
