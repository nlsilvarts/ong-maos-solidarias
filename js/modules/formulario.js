/*
 * Controlador do formulário de cadastro.
 * Iniciado pela página de cadastro sempre que o roteador a exibe.
 *
 * Este módulo apenas coordena os outros:
 * - validacao.js     → regras de consistência (o que está certo ou errado);
 * - campos.js        → estado visual de cada campo (como mostrar o resultado);
 * - resumo-erros.js  → alerta com a lista de erros no topo;
 * - rascunho.js e historico.js → persistência no localStorage;
 * - feedback.js      → toasts de confirmação.
 *
 * Verificação em tempo real: o campo é verificado ao sair dele (focusout) e,
 * a partir daí, a cada digitação (input). No envio (submit), tudo é verificado.
 */
import { REGRAS } from "./validacao.js";
import { lerValor, primeiroElemento, marcarCampo } from "./campos.js";
import { mostrarResumo, atualizarResumo } from "./resumo-erros.js";
import { salvarRascunho, restaurarRascunho, descartarRascunho } from "./rascunho.js";
import { registrarEnvio, mostrarHistorico, apagarHistorico, formatarDataHora } from "./historico.js";
import { mostrarToast } from "./feedback.js";

export function iniciarFormulario(formulario) {
  const botaoEnviar = formulario.querySelector('button[type="submit"]');
  const aceite = formulario.querySelector("#aceite");
  const alertaErro = document.getElementById("alerta-erro");
  const modal = document.getElementById("modal-cadastro");
  const avisoRascunho = document.getElementById("aviso-rascunho");
  const textoRascunho = document.getElementById("aviso-rascunho-texto");
  const tocados = new Set(); // campos que o usuário já preencheu ou tentou enviar
  let temporizadorRascunho = null;

  const atualizarBotaoEnviar = () => {
    botaoEnviar.disabled = !aceite.checked;
  };

  // Grava o rascunho 400 ms depois da última digitação (evita gravar a cada tecla)
  const agendarRascunho = () => {
    clearTimeout(temporizadorRascunho);
    temporizadorRascunho = setTimeout(() => salvarRascunho(formulario), 400);
  };

  const descrever = (nome, mensagem) => `${REGRAS[nome].rotulo}: ${mensagem}`;

  /* Verifica um campo com a regra correspondente e mostra o resultado */
  function verificar(nome) {
    const mensagem = REGRAS[nome].validar(lerValor(formulario, nome));
    marcarCampo(formulario, nome, mensagem ? "invalido" : "valido", mensagem);
    atualizarResumo(alertaErro, nome, mensagem ? descrever(nome, mensagem) : "");
    return mensagem;
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

  // Durante a digitação: atualiza em tempo real os campos já verificados e agenda o rascunho
  formulario.addEventListener("input", (evento) => {
    const { name } = evento.target;
    if (REGRAS[name] && tocados.has(name)) {
      verificar(name);
    }
    agendarRascunho();
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
      mostrarResumo(alertaErro, erros.map(({ nome, mensagem }) => ({
        nome,
        destino: primeiroElemento(formulario, nome).id,
        texto: descrever(nome, mensagem)
      })));
      return;
    }

    // Sem back-end, o envio é simulado: registra no histórico, confirma no modal e limpa o formulário
    alertaErro.hidden = true;
    const primeiroNome = lerValor(formulario, "nome").split(" ")[0];
    registrarEnvio({ primeiroNome, participacao: lerValor(formulario, "participacao") });
    mostrarHistorico();
    document.getElementById("modal-cadastro-nome").textContent = primeiroNome;

    // Ao fechar, o navegador devolveria o foco ao botão "Enviar", que fica desabilitado após
    // o envio, e o foco se perderia. Ele vai para o título do histórico, que recebeu o novo envio.
    modal.addEventListener("close", () => {
      const tituloHistorico = document.getElementById("historico-titulo");
      tituloHistorico.setAttribute("tabindex", "-1");
      tituloHistorico.focus();
    }, { once: true });

    modal.showModal();
    formulario.reset();
  });

  // Limpar campos: remove classes, mensagens, o resumo e o rascunho salvo
  formulario.addEventListener("reset", () => {
    clearTimeout(temporizadorRascunho);
    descartarRascunho();
    avisoRascunho.hidden = true;
    setTimeout(() => {
      tocados.clear();
      Object.keys(REGRAS).forEach((nome) => marcarCampo(formulario, nome, "neutro"));
      alertaErro.hidden = true;
      atualizarBotaoEnviar();
    }, 0);
  });

  document.getElementById("botao-descartar-rascunho").addEventListener("click", () => {
    formulario.reset();
    mostrarToast("Rascunho descartado.", "info");
  });

  document.getElementById("botao-apagar-historico").addEventListener("click", () => {
    apagarHistorico();
    mostrarHistorico();
    mostrarToast("Histórico de cadastros apagado.", "info");
  });

  /* ---------- Restauração ao abrir a página ---------- */

  mostrarHistorico();

  const recuperado = restaurarRascunho(formulario);
  if (recuperado) {
    textoRascunho.textContent = `Preenchemos os campos com o rascunho salvo em ${formatarDataHora(recuperado.salvoEm)}. Por segurança, o CPF e o aceite não são guardados.`;
    avisoRascunho.hidden = false;
    // Os campos restaurados já aparecem verificados (verde ou vermelho)
    recuperado.restaurados.forEach((nome) => {
      if (REGRAS[nome]) {
        tocados.add(nome);
        verificar(nome);
      }
    });
  }

  atualizarBotaoEnviar();
}
