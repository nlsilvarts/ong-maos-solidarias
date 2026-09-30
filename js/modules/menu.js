/*
 * Menu responsivo (hambúrguer).
 * O módulo apenas alterna o atributo aria-expanded do botão;
 * o CSS lê esse atributo para mostrar ou esconder o menu no celular.
 */
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
}
