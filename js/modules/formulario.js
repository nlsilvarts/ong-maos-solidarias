/*
 * Verificação de consistência do formulário de cadastro.
 * Iniciado pela página de cadastro sempre que o roteador a exibe.
 *
 * - Em tempo real: o campo é verificado quando o usuário sai dele (focusout)
 *   e, a partir daí, a cada digitação (input), para o erro sumir assim que for corrigido.
 * - No envio (submit): todos os campos são verificados; se houver erro,
 *   o envio é bloqueado e um resumo com links para os campos aparece no topo.
 * - O resultado é mostrado com classes CSS (.campo-valido / .campo-invalido),
 *   uma mensagem injetada abaixo do campo e atributos de acessibilidade.
 */
import { REGRAS } from "./validacao.js";

export function iniciarFormulario(formulario) {
  const botaoEnviar = formulario.querySelector('button[type="submit"]');
  const aceite = formulario.querySelector("#aceite");
  const alertaErro = document.getElementById("alerta-erro");
  const textoErro = document.getElementById("alerta-erro-texto");
  const modal = document.getElementById("modal-cadastro");
  const tocados = new Set(); // campos que o usuário já preencheu ou tentou enviar

  const atualizarBotaoEnviar = () => {
    botaoEnviar.disabled = !aceite.checked;
  };

  /* Valor do campo: rádios devolvem a opção marcada; checkbox, "sim" ou vazio */
  function lerValor(nome) {
    const campo = formulario.elements[nome];
    if (campo instanceof RadioNodeList) return campo.value;
    if (campo.type === "checkbox") return campo.checked ? campo.value : "";
    return campo.value.trim();
  }

  function primeiroElemento(nome) {
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
  function marcar(nome, estado, mensagem = "") {
    const elemento = primeiroElemento(nome);
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

  /* Verifica um campo com a regra correspondente e devolve a mensagem de erro */
  function verificar(nome) {
    const mensagem = REGRAS[nome].validar(lerValor(nome));
    marcar(nome, mensagem ? "invalido" : "valido", mensagem);
    atualizarResumo(nome, mensagem);
    return mensagem;
  }

  function textoQuantidade(total) {
    return total === 1 ? "1 campo precisa de atenção:" : `${total} campos precisam de atenção:`;
  }

  /* Com o resumo aberto, cada campo corrigido sai da lista; sem erros, o resumo some */
  function atualizarResumo(nome, mensagem) {
    const link = alertaErro.hidden ? null : alertaErro.querySelector(`a[data-campo="${nome}"]`);
    if (!link) return;
    if (mensagem) {
      link.textContent = `${REGRAS[nome].rotulo}: ${mensagem}`;
      return;
    }
    link.parentElement.remove();
    const restantes = alertaErro.querySelectorAll(".lista-erros li").length;
    if (restantes === 0) {
      alertaErro.hidden = true;
    } else {
      textoErro.textContent = textoQuantidade(restantes);
    }
  }

  /* Resumo no topo: quantidade de erros e um link para cada campo */
  function mostrarResumo(erros) {
    textoErro.textContent = textoQuantidade(erros.length);

    const lista = document.createElement("ul");
    lista.className = "lista-erros";
    erros.forEach(({ nome, mensagem }) => {
      const link = document.createElement("a");
      link.href = `#${primeiroElemento(nome).id}`;
      link.dataset.campo = nome;
      link.textContent = `${REGRAS[nome].rotulo}: ${mensagem}`;
      const item = document.createElement("li");
      item.append(link);
      lista.append(item);
    });

    const listaAnterior = alertaErro.querySelector(".lista-erros");
    if (listaAnterior) listaAnterior.remove();
    textoErro.after(lista);

    alertaErro.hidden = false;
    alertaErro.setAttribute("tabindex", "-1");
    alertaErro.focus();
  }

  /* ---------- Eventos ---------- */

  // Ao sair do campo: verifica se ele foi preenchido ou já tinha sido verificado
  formulario.addEventListener("focusout", (evento) => {
    const { name, type, value } = evento.target;
    if (!REGRAS[name] || type === "radio" || type === "checkbox") return;
    if (value.trim() || tocados.has(name)) {
      tocados.add(name);
      verificar(name);
    }
  });

  // Durante a digitação: atualiza em tempo real os campos já verificados
  formulario.addEventListener("input", (evento) => {
    const { name } = evento.target;
    if (REGRAS[name] && tocados.has(name)) {
      verificar(name);
    }
  });

  // Seleções (estado, rádios, data e aceite) são verificadas na hora
  formulario.addEventListener("change", (evento) => {
    const { name } = evento.target;
    if (name === "aceite") atualizarBotaoEnviar();
    if (REGRAS[name]) {
      tocados.add(name);
      verificar(name);
    }
  });

  // Envio: verifica tudo; com erro, bloqueia e mostra o resumo
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const erros = Object.keys(REGRAS)
      .map((nome) => {
        tocados.add(nome);
        return { nome, mensagem: verificar(nome) };
      })
      .filter((resultado) => resultado.mensagem);

    if (erros.length > 0) {
      mostrarResumo(erros);
      return;
    }

    // Sem back-end, o envio é simulado: o modal confirma e o formulário é limpo
    alertaErro.hidden = true;
    const primeiroNome = lerValor("nome").split(" ")[0];
    document.getElementById("modal-cadastro-nome").textContent = primeiroNome;
    modal.showModal();
    formulario.reset();
  });

  // Limpar campos: remove classes, mensagens e o resumo
  formulario.addEventListener("reset", () => {
    setTimeout(() => {
      tocados.clear();
      Object.keys(REGRAS).forEach((nome) => marcar(nome, "neutro"));
      alertaErro.hidden = true;
      atualizarBotaoEnviar();
    }, 0);
  });

  atualizarBotaoEnviar();
}
