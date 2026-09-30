/*
 * Componentes de feedback: toasts, alertas que podem ser fechados,
 * abertura de modais e botões de copiar.
 *
 * Uso direto pelo HTML, sem escrever JavaScript:
 *   <button type="button" data-toast="Mensagem" data-toast-tipo="sucesso">...</button>
 *   <button type="button" data-abrir-modal="id-do-dialog">...</button>
 *   <button type="button" data-copiar="#id-do-elemento">...</button>
 *   <button type="button" class="botao-fechar" aria-label="Fechar aviso">×</button> (dentro de .alerta)
 *
 * Tipos disponíveis: info, sucesso, aviso, erro.
 */
import { ICONES } from "./templates.js";

let areaToasts = null;

function removerToast(toast) {
  if (!toast.isConnected || toast.classList.contains("saindo")) {
    return;
  }
  toast.classList.add("saindo");
  toast.addEventListener("animationend", () => toast.remove());
}

export function mostrarToast(mensagem, tipo = "info") {
  const tipoValido = ICONES[tipo] ? tipo : "info";

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipoValido}`;

  const icone = document.createElement("span");
  icone.className = "icone-feedback";
  icone.setAttribute("aria-hidden", "true");
  icone.textContent = ICONES[tipoValido];

  const texto = document.createElement("p");
  texto.textContent = mensagem;

  const fechar = document.createElement("button");
  fechar.type = "button";
  fechar.className = "botao-fechar";
  fechar.setAttribute("aria-label", "Fechar notificação");
  fechar.textContent = "×";
  fechar.addEventListener("click", () => removerToast(toast));

  toast.append(icone, texto, fechar);
  areaToasts.appendChild(toast);

  // Some sozinho depois de 5 segundos
  setTimeout(() => removerToast(toast), 5000);
}

function copiarTexto(texto, mensagemSucesso) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(
      () => mostrarToast(mensagemSucesso, "sucesso"),
      () => mostrarToast(`Não foi possível copiar. Anote: ${texto}`, "erro")
    );
  } else {
    mostrarToast(`Copie manualmente: ${texto}`, "aviso");
  }
}

/* Um único ouvinte trata os botões de todas as páginas, inclusive as
   que o roteador insere depois (delegação de eventos) */
function tratarCliques(evento) {
  const botao = evento.target.closest("button");
  if (!botao) {
    return;
  }

  if (botao.matches(".alerta .botao-fechar")) {
    botao.closest(".alerta").hidden = true;
  } else if (botao.dataset.toast) {
    mostrarToast(botao.dataset.toast, botao.dataset.toastTipo);
  } else if (botao.dataset.abrirModal) {
    document.getElementById(botao.dataset.abrirModal).showModal();
  } else if (botao.dataset.copiar) {
    const alvo = document.querySelector(botao.dataset.copiar);
    copiarTexto(alvo.textContent.trim(), botao.dataset.copiarMensagem || "Texto copiado!");
  }
}

export function iniciarFeedback() {
  // Área dos toasts: criada uma única vez e anunciada por leitores de tela
  areaToasts = document.createElement("div");
  areaToasts.className = "toast-area";
  areaToasts.setAttribute("role", "status");
  areaToasts.setAttribute("aria-live", "polite");
  document.body.appendChild(areaToasts);

  document.addEventListener("click", tratarCliques);
}
