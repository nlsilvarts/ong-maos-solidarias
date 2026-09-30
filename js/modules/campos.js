/*
 * Estado visual dos campos de um formulário.
 *
 * Reutilizável em qualquer formulário: não conhece as regras nem os campos
 * do cadastro. Recebe o formulário, o nome do campo e o resultado da
 * verificação, e cuida apenas do DOM (classes CSS, mensagem de erro,
 * atributos de acessibilidade e validação nativa).
 */

/* Valor do campo: rádios devolvem a opção marcada; checkbox, o value ou vazio */
export function lerValor(formulario, nome) {
  const campo = formulario.elements[nome];
  if (campo instanceof RadioNodeList) return campo.value;
  if (campo.type === "checkbox") return campo.checked ? campo.value : "";
  return campo.value.trim();
}

/* Primeiro elemento do campo (em grupos de rádio, a primeira opção) */
export function primeiroElemento(formulario, nome) {
  const campo = formulario.elements[nome];
  return campo instanceof RadioNodeList ? campo[0] : campo;
}

/* Liga ou desliga um id em aria-describedby sem apagar os que já existem (como a dica) */
function atualizarDescricao(elemento, id, ligar) {
  const ids = new Set((elemento.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
  if (ligar) ids.add(id); else ids.delete(id);
  if (ids.size > 0) {
    elemento.setAttribute("aria-describedby", [...ids].join(" "));
  } else {
    elemento.removeAttribute("aria-describedby");
  }
}

/* Aplica o resultado no DOM. estado: "valido", "invalido" ou "neutro" (após limpar) */
export function marcarCampo(formulario, nome, estado, mensagem = "") {
  const elemento = primeiroElemento(formulario, nome);
  const ehGrupo = elemento.type === "radio";
  const contenedor = elemento.closest(".campo, fieldset");
  const alvoDescricao = ehGrupo ? contenedor : elemento;
  const idMensagem = `erro-${nome}`;
  let aviso = document.getElementById(idMensagem);

  contenedor.classList.toggle("campo-valido", estado === "valido");
  contenedor.classList.toggle("campo-invalido", estado === "invalido");

  // Mantém a validação nativa (validity) coerente com a verificação em JavaScript
  const elementos = ehGrupo ? [...formulario.elements[nome]] : [elemento];
  elementos.forEach((campo) => campo.setCustomValidity(estado === "invalido" ? mensagem : ""));

  if (!ehGrupo) {
    if (estado === "neutro") {
      elemento.removeAttribute("aria-invalid");
    } else {
      elemento.setAttribute("aria-invalid", String(estado === "invalido"));
    }
  }

  if (estado !== "invalido") {
    if (aviso) aviso.remove();
    atualizarDescricao(alvoDescricao, idMensagem, false);
    return;
  }

  // Injeta a mensagem de erro logo abaixo do campo (ou do grupo de opções)
  if (!aviso) {
    aviso = document.createElement("p");
    aviso.className = "mensagem-erro";
    aviso.id = idMensagem;
    contenedor.append(aviso);
    atualizarDescricao(alvoDescricao, idMensagem, true);
  }
  aviso.textContent = mensagem;
}
