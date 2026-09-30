/*
 * Máscaras de entrada para CPF, telefone e CEP.
 * Apenas formatam a digitação; a validação continua sendo feita
 * pelos atributos nativos do HTML5 (pattern, required, maxlength).
 */
export function aplicarMascara(valor, tipo) {
  let numeros = valor.replace(/\D/g, "");

  if (tipo === "cpf") {
    numeros = numeros.slice(0, 11);
    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  if (tipo === "telefone") {
    numeros = numeros.slice(0, 11);
    if (numeros.length > 10) {
      return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
    if (numeros.length > 6) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    if (numeros.length > 2) {
      return numeros.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    }
    return numeros;
  }

  if (tipo === "cep") {
    numeros = numeros.slice(0, 8);
    return numeros.replace(/(\d{5})(\d)/, "$1-$2");
  }

  return valor;
}

/* Delegação: funciona também nos formulários inseridos depois pelo roteador.
   A escuta é na fase de captura, para a máscara ser aplicada antes da
   verificação em tempo real do formulário (formulario.js). */
export function iniciarMascaras() {
  document.addEventListener("input", (evento) => {
    const campo = evento.target;
    if (campo.matches("[data-mascara]")) {
      campo.value = aplicarMascara(campo.value, campo.dataset.mascara);
    }
  }, true);
}
