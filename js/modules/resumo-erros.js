/*
 * Resumo de erros: alerta no topo do formulário com a quantidade de
 * problemas e um link para cada campo.
 *
 * Reutilizável: recebe o elemento do alerta (criado pelo template alerta(),
 * com o parágrafo "<id>-texto") e os erros já descritos. Não conhece as
 * regras de verificação.
 */

function textoQuantidade(total) {
  return total === 1 ? "1 campo precisa de atenção:" : `${total} campos precisam de atenção:`;
}

function paragrafoTexto(alerta) {
  return document.getElementById(`${alerta.id}-texto`);
}

/* erros: [{ nome, destino (id do campo), texto }] */
export function mostrarResumo(alerta, erros) {
  const texto = paragrafoTexto(alerta);
  texto.textContent = textoQuantidade(erros.length);

  const lista = document.createElement("ul");
  lista.className = "lista-erros";
  erros.forEach(({ nome, destino, texto: descricao }) => {
    const link = document.createElement("a");
    link.href = `#${destino}`;
    link.dataset.campo = nome;
    link.textContent = descricao;
    const item = document.createElement("li");
    item.append(link);
    lista.append(item);
  });

  const listaAnterior = alerta.querySelector(".lista-erros");
  if (listaAnterior) listaAnterior.remove();
  texto.after(lista);

  alerta.hidden = false;
  alerta.setAttribute("tabindex", "-1");
  alerta.focus();
}

/* Com o resumo aberto, atualiza o item do campo; texto vazio = campo corrigido.
   Quando não resta nenhum erro, o resumo some. */
export function atualizarResumo(alerta, nome, descricao) {
  const link = alerta.hidden ? null : alerta.querySelector(`a[data-campo="${nome}"]`);
  if (!link) return;

  if (descricao) {
    link.textContent = descricao;
    return;
  }

  link.parentElement.remove();
  const restantes = alerta.querySelectorAll(".lista-erros li").length;
  if (restantes === 0) {
    alerta.hidden = true;
  } else {
    paragrafoTexto(alerta).textContent = textoQuantidade(restantes);
  }
}
