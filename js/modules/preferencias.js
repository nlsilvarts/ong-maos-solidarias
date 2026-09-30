/*
 * Preferência visual salva no localStorage: texto maior.
 *
 * Para a página não "pular" de tamanho, o script em linha do <head> de
 * html/index.html lê esta mesma preferência e aplica a classe antes da
 * primeira exibição. Este módulo sincroniza o botão e grava as mudanças.
 */
import { CHAVES, ler, salvar, ehObjeto } from "./armazenamento.js";

const PADRAO = { textoGrande: false };
const preferenciasValidas = (valor) => ehObjeto(valor) && typeof valor.textoGrande === "boolean";

export function iniciarPreferencias() {
  const botao = document.getElementById("botao-texto-grande");
  if (!botao) {
    return;
  }

  // Leitura inicial: string do localStorage → objeto (ou o padrão, se não houver)
  let preferencias = ler(CHAVES.preferencias, PADRAO, preferenciasValidas);

  const aplicar = () => {
    document.documentElement.classList.toggle("texto-grande", preferencias.textoGrande);
    botao.setAttribute("aria-pressed", String(preferencias.textoGrande));
  };

  aplicar();

  botao.addEventListener("click", () => {
    preferencias = { ...preferencias, textoGrande: !preferencias.textoGrande };
    salvar(CHAVES.preferencias, preferencias);
    aplicar();
  });
}
