/*
 * Histórico dos cadastros enviados neste navegador (array no localStorage).
 * Enquanto não há back-end, ele simula o registro dos envios e guarda
 * apenas o necessário: primeiro nome, forma de participação e data.
 */
import { CHAVES, ler, salvar, remover, ehObjeto } from "./armazenamento.js";
import { escapar } from "./templates.js";

const LIMITE = 5; // guarda só os 5 envios mais recentes
const NOMES_PARTICIPACAO = { voluntario: "Voluntário", doador: "Doador", ambos: "Voluntário e doador" };

const itemValido = (item) =>
  ehObjeto(item)
  && typeof item.primeiroNome === "string"
  && typeof item.enviadoEm === "string"
  && !Number.isNaN(Date.parse(item.enviadoEm));

/* string do localStorage → array; itens fora do formato esperado são descartados */
export function lerHistorico() {
  return ler(CHAVES.historico, [], Array.isArray).filter(itemValido);
}

/* Acrescenta um envio e grava o array de volta como string */
export function registrarEnvio({ primeiroNome, participacao }) {
  const historico = lerHistorico();
  historico.push({ primeiroNome, participacao, enviadoEm: new Date().toISOString() });
  salvar(CHAVES.historico, historico.slice(-LIMITE));
}

export function apagarHistorico() {
  remover(CHAVES.historico);
}

export function formatarDataHora(dataISO) {
  const data = new Date(dataISO);
  return Number.isNaN(data.getTime())
    ? "data desconhecida"
    : data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/* Template de um item. O nome foi digitado pelo usuário, por isso passa por escapar() */
function itemHistorico(item) {
  const participacao = NOMES_PARTICIPACAO[item.participacao] || "Participação não informada";
  return `<li><strong>${escapar(item.primeiroNome)}</strong> · ${participacao} · <time datetime="${escapar(item.enviadoEm)}">${formatarDataHora(item.enviadoEm)}</time></li>`;
}

/* Restaura a interface a partir do histórico salvo (mais recente primeiro) */
export function mostrarHistorico() {
  const secao = document.getElementById("historico-cadastros");
  const lista = document.getElementById("historico-lista");
  if (!secao || !lista) {
    return;
  }
  const historico = lerHistorico();
  lista.innerHTML = [...historico].reverse().map(itemHistorico).join("");
  secao.hidden = historico.length === 0;
}
