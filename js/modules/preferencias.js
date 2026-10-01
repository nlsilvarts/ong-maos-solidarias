/*
 * Preferências visuais salvas no localStorage: alto contraste e texto maior.
 *
 * Para a página não piscar nem "pular" de tamanho, o script em linha do <head>
 * de html/index.html lê estas mesmas preferências e aplica as classes antes da
 * primeira exibição. Este módulo sincroniza os botões e grava as mudanças.
 *
 * Alto contraste: enquanto a pessoa não escolher, a página segue a configuração
 * do sistema operacional (prefers-contrast: more). Depois da escolha, vale a escolha.
 */
import { CHAVES, ler, salvar, ehObjeto } from "./armazenamento.js";

const OPCOES = [
  { chave: "altoContraste", classe: "alto-contraste", botao: "botao-alto-contraste" },
  { chave: "textoGrande", classe: "texto-grande", botao: "botao-texto-grande" }
];

const contrasteDoSistema = window.matchMedia("(prefers-contrast: more)");

// { textoGrande: boolean, altoContraste?: boolean }: altoContraste só existe depois de uma escolha
const preferenciasValidas = (valor) =>
  ehObjeto(valor)
  && typeof valor.textoGrande === "boolean"
  && (valor.altoContraste === undefined || typeof valor.altoContraste === "boolean");

export function iniciarPreferencias() {
  // Leitura inicial: string do localStorage → objeto (ou o padrão, se não houver)
  let salvas = ler(CHAVES.preferencias, { textoGrande: false }, preferenciasValidas);

  const estaLigada = (chave) =>
    chave === "altoContraste" && salvas.altoContraste === undefined
      ? contrasteDoSistema.matches
      : salvas[chave] === true;

  // Aplica as classes no <html> e o estado dos botões (aria-pressed é lido pelos leitores de tela)
  const aplicar = () => {
    OPCOES.forEach(({ chave, classe, botao }) => {
      const ligada = estaLigada(chave);
      document.documentElement.classList.toggle(classe, ligada);
      document.getElementById(botao)?.setAttribute("aria-pressed", String(ligada));
    });
    // Avisa quem desenha com cores próprias, como o gráfico em canvas, para se atualizar
    document.dispatchEvent(new CustomEvent("preferencias-alteradas"));
  };

  OPCOES.forEach(({ chave, botao }) => {
    document.getElementById(botao)?.addEventListener("click", () => {
      salvas = { ...salvas, textoGrande: estaLigada("textoGrande"), [chave]: !estaLigada(chave) };
      salvar(CHAVES.preferencias, salvas);
      aplicar();
    });
  });

  // Sem escolha salva, acompanha a mudança na configuração do sistema
  contrasteDoSistema.addEventListener("change", () => {
    if (salvas.altoContraste === undefined) {
      aplicar();
    }
  });

  aplicar();
}
