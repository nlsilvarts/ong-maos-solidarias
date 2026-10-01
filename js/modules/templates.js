/*
 * Templates reutilizáveis: funções que recebem dados e devolvem HTML.
 * Um mesmo template é usado em várias páginas (por exemplo, o cartão
 * de projeto aparece na página inicial e na página de projetos).
 *
 * Todo texto passa por escapar() antes de entrar na página, para que
 * um conteúdo vindo de fora nunca seja interpretado como código.
 */
import { percentualArrecadado } from "./dados.js";

export const ICONES = { info: "i", sucesso: "✓", aviso: "!", erro: "!" };

const PASTA_IMAGENS = "../imagens/";

export function escapar(valor) {
  const entidades = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(valor).replace(/[&<>"']/g, (caractere) => entidades[caractere]);
}

/* Número no padrão brasileiro: 1480 → "1.480" */
export function numero(valor) {
  return valor.toLocaleString("pt-BR");
}

/* Imagem em dois formatos: WebP quando o navegador aceita, JPG como alternativa */
export function imagem({ arquivo, alt, largura, altura }, { carregamento = "lazy" } = {}) {
  return `
    <picture>
      <source srcset="${PASTA_IMAGENS}${arquivo}.webp" type="image/webp">
      <img src="${PASTA_IMAGENS}${arquivo}.jpg" alt="${escapar(alt)}" width="${largura}" height="${altura}" loading="${carregamento}">
    </picture>`;
}

/* Lista de badges: recebe [{ texto, tipo }] */
export function listaBadges(itens, rotulo) {
  const badges = itens
    .map((item) => `<li class="badge badge-${item.tipo}">${escapar(item.texto)}</li>`)
    .join("");
  return `<ul class="badges" aria-label="${escapar(rotulo)}">${badges}</ul>`;
}

/* Alerta: tipos info, sucesso, aviso e erro. "acao" adiciona um botão: { texto, id } */
export function alerta({ tipo = "info", titulo, texto, fechavel = false, id = "", papel = "", oculto = false, acao = null }) {
  const atributos = [
    id ? `id="${id}"` : "",
    papel ? `role="${papel}"` : "",
    oculto ? "hidden" : ""
  ].filter(Boolean).join(" ");

  return `
    <div class="alerta alerta-${tipo}" ${atributos}>
      <span class="icone-feedback" aria-hidden="true">${ICONES[tipo]}</span>
      <div class="alerta-conteudo">
        <p class="alerta-titulo">${escapar(titulo)}</p>
        <p${id ? ` id="${id}-texto"` : ""}>${escapar(texto)}</p>
        ${acao ? `<p class="alerta-acao"><button type="button" class="botao botao-pequeno botao-secundario" id="${acao.id}">${escapar(acao.texto)}</button></p>` : ""}
      </div>
      ${fechavel ? `<button type="button" class="botao-fechar" aria-label="Fechar aviso: ${escapar(titulo)}">×</button>` : ""}
    </div>`;
}

/* Cartão de projeto: versão resumida (página inicial) ou completa (página de projetos) */
export function cartaoProjeto(projeto, { completo = false, colunas = "col-12 col-sm-6" } = {}) {
  const midia = completo
    ? `<figure>${imagem(projeto.imagem)}<figcaption>${escapar(projeto.legenda)}</figcaption></figure>`
    : imagem(projeto.imagem);

  const descricao = completo
    ? `<p><strong>Objetivo:</strong> ${escapar(projeto.objetivo)}</p>
       <p><strong>Público:</strong> ${escapar(projeto.publico)}</p>`
    : `<p>${escapar(projeto.resumo)}</p>`;

  return `
    <article class="cartao ${colunas}">
      <h3>${escapar(projeto.titulo)}</h3>
      ${listaBadges([projeto.categoria, projeto.status], "Etiquetas do projeto")}
      ${midia}
      ${descricao}
    </article>`;
}

/* Cartão de campanha de doação */
export function cartaoCampanha(campanha) {
  const itens = campanha.itens.map((item) => `<li>${escapar(item)}</li>`).join("");
  return `
    <article class="cartao col-12 col-md-6 col-xl-4">
      <h3>${escapar(campanha.titulo)}</h3>
      ${listaBadges([campanha.status], "Situação da campanha")}
      <p>Meta: ${escapar(campanha.meta)}</p>
      <p><strong>Arrecadado:</strong> ${numero(campanha.arrecadado)} de ${numero(campanha.quantidade)} ${escapar(campanha.unidade)} (${percentualArrecadado(campanha)}%)</p>
      <ul>${itens}</ul>
    </article>`;
}

/* Cartão de texto simples: parágrafo ou lista (missão, visão e valores) */
export function cartaoTexto({ titulo, texto, itens }, colunas = "col-12 col-md-4") {
  const corpo = itens
    ? `<ul>${itens.map((item) => `<li>${escapar(item)}</li>`).join("")}</ul>`
    : `<p>${escapar(texto)}</p>`;
  return `
    <article class="cartao ${colunas}">
      <h3>${escapar(titulo)}</h3>
      ${corpo}
    </article>`;
}

/* Bloco de código para o guia de componentes */
export function blocoCodigo(codigo) {
  return `<pre><code>${escapar(codigo.trim())}</code></pre>`;
}
