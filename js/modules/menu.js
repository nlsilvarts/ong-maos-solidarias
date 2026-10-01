/*
 * Menu responsivo (hambúrguer) e submenus.
 * O módulo apenas alterna o atributo aria-expanded dos botões;
 * o CSS lê esse atributo para mostrar ou esconder o menu e os submenus.
 */

/* Submenu no padrão de divulgação (disclosure) do WAI-ARIA: o botão informa o estado
   com aria-expanded e aponta para o submenu com aria-controls. Abre com clique, Enter
   ou Espaço e fecha com Esc, com um clique fora ou quando o foco sai do item. */
function iniciarSubmenu(botao) {
  const item = botao.closest(".tem-submenu");
  const submenu = document.getElementById(botao.getAttribute("aria-controls"));
  const estaAberto = () => botao.getAttribute("aria-expanded") === "true";
  const definir = (aberto) => botao.setAttribute("aria-expanded", String(aberto));

  botao.addEventListener("click", () => definir(!estaAberto()));

  // Esc fecha só o submenu (o menu do celular continua aberto) e devolve o foco ao botão
  item.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && estaAberto()) {
      evento.stopPropagation();
      definir(false);
      botao.focus();
    }
  });

  // Tab depois do último link: o foco sai do item e o submenu fecha
  item.addEventListener("focusout", (evento) => {
    if (!item.contains(evento.relatedTarget)) {
      definir(false);
    }
  });

  // Fecha depois que uma seção é escolhida ou quando o clique acontece fora do item
  submenu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) {
      definir(false);
    }
  });
  document.addEventListener("click", (evento) => {
    if (estaAberto() && !item.contains(evento.target)) {
      definir(false);
    }
  });
}

export function iniciarMenu() {
  const botao = document.querySelector(".menu-toggle");
  const lista = document.getElementById("menu-principal");
  if (!botao || !lista) {
    return;
  }

  const definirMenu = (aberto) => botao.setAttribute("aria-expanded", String(aberto));
  const estaAberto = () => botao.getAttribute("aria-expanded") === "true";

  // Abre e fecha ao clicar no botão
  botao.addEventListener("click", () => definirMenu(!estaAberto()));

  // Fecha com a tecla Esc e devolve o foco ao botão
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && estaAberto()) {
      definirMenu(false);
      botao.focus();
    }
  });

  // Fecha depois que um link do menu é escolhido (a SPA troca a página sem recarregar)
  lista.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) {
      definirMenu(false);
    }
  });

  lista.querySelectorAll(".submenu-toggle").forEach(iniciarSubmenu);
}
