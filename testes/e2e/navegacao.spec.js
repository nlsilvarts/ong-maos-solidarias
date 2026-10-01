/*
 * Navegação da SPA: rotas por hash, título da aba, foco, menu e página não encontrada.
 */
import { test, expect } from "@playwright/test";

import { PAGINA } from "./apoio/site.js";
const TITULOS = {
  inicio: "Bem-vindo à ONG Mãos Solidárias",
  projetos: "Projetos sociais",
  cadastro: "Cadastro de voluntários e doadores",
  componentes: "Guia de componentes"
};

const linkDoMenu = (page, nome) => page.locator("#menu-principal").getByRole("link", { name: nome, exact: true });

test.describe("Navegação", () => {
  test("troca de página pelo menu sem recarregar o documento", async ({ page }) => {
    await page.goto(PAGINA);
    await expect(page.locator("main h1")).toHaveText(TITULOS.inicio);
    await expect(page).toHaveTitle("Início | ONG Mãos Solidárias");

    // Se o documento recarregar, esta marca some
    await page.evaluate(() => { window.semRecarregar = true; });

    await linkDoMenu(page, "Projetos").click();
    await expect(page).toHaveURL(/#\/projetos$/);
    await expect(page).toHaveTitle("Projetos | ONG Mãos Solidárias");
    await expect(page.locator("main h1")).toHaveText(TITULOS.projetos);
    await expect(page.locator("main h1")).toBeFocused();
    await expect(page.locator('#menu-principal a[aria-current="page"]')).toHaveText("Projetos");
    expect(await page.evaluate(() => window.semRecarregar)).toBe(true);
  });

  test("leva até a seção indicada no endereço e funciona com Voltar e Avançar", async ({ page }) => {
    await page.goto(`${PAGINA}#/projetos`);
    await page.getByRole("link", { name: "Quero doar" }).click();
    await expect(page).toHaveURL(/#\/projetos\/campanhas$/);
    await expect(page.locator("#campanhas h2")).toBeFocused();

    await page.goBack();
    await expect(page).toHaveURL(/#\/projetos$/);
    await page.goForward();
    await expect(page).toHaveURL(/#\/projetos\/campanhas$/);
  });

  test("endereço desconhecido mostra a página não encontrada", async ({ page }) => {
    await page.goto(`${PAGINA}#/nao-existe`);
    await expect(page.locator("main h1")).toHaveText("Página não encontrada");
    await expect(page).toHaveTitle("Página não encontrada | ONG Mãos Solidárias");
  });

  test("o link Pular para o conteúdo leva o foco ao conteúdo principal", async ({ page }) => {
    await page.goto(PAGINA);
    await page.keyboard.press("Tab");
    const pular = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(pular).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#conteudo")).toBeFocused();
  });

  test("nenhuma rota gera erro de JavaScript", async ({ page }) => {
    const erros = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    page.on("console", (mensagem) => {
      if (mensagem.type() === "error") erros.push(mensagem.text());
    });

    for (const [rota, titulo] of Object.entries(TITULOS)) {
      await page.goto(`${PAGINA}#/${rota}`);
      await expect(page.locator("main h1")).toHaveText(titulo);
    }
    expect(erros).toEqual([]);
  });
});

test.describe("Menu no celular", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("o botão abre e fecha o menu, e a página não rola na horizontal", async ({ page }) => {
    await page.goto(PAGINA);
    const botao = page.locator(".menu-toggle");
    await expect(botao).toHaveAttribute("aria-expanded", "false");

    await botao.click();
    await expect(botao).toHaveAttribute("aria-expanded", "true");

    await linkDoMenu(page, "Cadastro").click();
    await expect(page).toHaveURL(/#\/cadastro$/);
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
