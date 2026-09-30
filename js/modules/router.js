/*
 * Roteador da SPA (Single Page Application).
 *
 * Cada página corresponde a um trecho do endereço depois de "#/":
 *   #/inicio    #/projetos    #/cadastro    #/componentes
 * Uma rota também pode apontar para uma seção da página:
 *   #/projetos/voluntariado
 *
 * O roteador troca apenas o conteúdo do <main>. Cabeçalho, menu e rodapé
 * continuam na tela, e o navegador não recarrega a página.
 * Os botões Voltar e Avançar do navegador funcionam pelo evento hashchange.
 */
import inicio from "./paginas/inicio.js";
import projetos from "./paginas/projetos.js";
import cadastro from "./paginas/cadastro.js";
import componentes from "./paginas/componentes.js";
import naoEncontrada from "./paginas/nao-encontrada.js";

const ROTAS = { inicio, projetos, cadastro, componentes };
const NOME_SITE = "ONG Mãos Solidárias";

let raiz = null;
let paginaAtual = null;

/* "#/projetos/voluntariado" → { pagina: "projetos", secao: "voluntariado" } */
function lerEndereco() {
  const [pagina = "", secao = ""] = location.hash.replace(/^#\/?/, "").split("/");
  return { pagina: pagina || "inicio", secao };
}

/* Marca no menu o link da página atual (aria-current também muda o estilo) */
function atualizarMenu(pagina) {
  document.querySelectorAll("[data-rota]").forEach((link) => {
    if (link.dataset.rota === pagina) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

/* Leva o foco a um elemento sem rolar a tela (leitores de tela anunciam o novo título) */
function focar(elemento) {
  if (!elemento) {
    return;
  }
  // Só elementos que não recebem foco naturalmente (títulos, seções) ganham tabindex
  if (!elemento.matches("a[href], button, input, select, textarea, [tabindex]")) {
    elemento.setAttribute("tabindex", "-1");
  }
  elemento.focus({ preventScroll: true });
}

function renderizar() {
  const { pagina, secao } = lerEndereco();
  const primeiraCarga = paginaAtual === null;

  // Só redesenha o <main> quando a página muda
  if (pagina !== paginaAtual) {
    const modulo = ROTAS[pagina] || naoEncontrada;
    raiz.innerHTML = modulo.render();
    document.title = `${modulo.titulo} | ${NOME_SITE}`;
    atualizarMenu(pagina);
    if (modulo.iniciar) {
      modulo.iniciar(raiz);
    }
    paginaAtual = pagina;
  }

  // Rola até a seção pedida ou volta ao topo; o foco acompanha a navegação
  const alvo = secao ? document.getElementById(secao) : null;
  if (alvo) {
    alvo.scrollIntoView();
    if (!primeiraCarga) {
      focar(alvo.querySelector("h2") || alvo);
    }
  } else {
    window.scrollTo(0, 0);
    if (!primeiraCarga) {
      focar(raiz.querySelector("h1"));
    }
  }
}

/* Trata os links internos que não trocam de rota */
function tratarCliques(evento) {
  const link = evento.target.closest('a[href^="#"]');
  if (!link) {
    return;
  }
  const destino = link.getAttribute("href");

  // Clique na rota atual: não dispara hashchange, então rola de novo até o destino
  if (destino.startsWith("#/")) {
    if (destino === location.hash) {
      evento.preventDefault();
      renderizar();
    }
    return;
  }

  // Âncoras comuns, como "Pular para o conteúdo" ou os links do resumo
  // de erros do formulário, não podem alterar a rota
  const alvo = document.getElementById(destino.slice(1));
  if (alvo) {
    evento.preventDefault();
    alvo.scrollIntoView({ block: alvo.matches("input, select, textarea") ? "center" : "start" });
    focar(alvo);
  }
}

export function iniciarRoteador(elementoRaiz) {
  raiz = elementoRaiz;
  window.addEventListener("hashchange", renderizar);
  document.addEventListener("click", tratarCliques);
  renderizar();
}
