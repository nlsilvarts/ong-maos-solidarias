/*
 * Gestão de foco, usada pelo roteador, pelos alertas, pelos toasts e pelo cadastro.
 *
 * Quem navega por teclado ou leitor de tela acompanha a página pelo foco. Quando
 * o conteúdo muda (nova rota, alerta fechado, modal fechado), o foco é levado a
 * um ponto que faça sentido, em vez de se perder no <body>.
 */

/* Leva o foco a um elemento sem rolar a tela. Títulos e seções, que não recebem
   foco naturalmente, ganham tabindex="-1": aceitam o foco pelo script, mas não
   entram na ordem do Tab */
export function focar(elemento) {
  if (!elemento) {
    return;
  }
  if (!elemento.matches("a[href], button, input, select, textarea, [tabindex]")) {
    elemento.setAttribute("tabindex", "-1");
  }
  elemento.focus({ preventScroll: true });
}
