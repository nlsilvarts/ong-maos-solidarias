/*
 * Otimização para produção: imagens em formato moderno e, no build (testes
 * marcados com @producao, que só rodam no projeto "producao"), arquivos
 * minificados com hash no nome e um orçamento de tamanho para a primeira visita.
 */
import { test, expect } from "@playwright/test";
import { PAGINA } from "./apoio/site.js";

const KB = 1024;

test("as imagens carregam em AVIF, com largura e altura declaradas", async ({ page }) => {
  await page.goto(`${PAGINA}#/projetos`);
  const imagens = await page.locator("main picture img").all();
  expect(imagens.length).toBeGreaterThan(0);
  for (const imagem of imagens) {
    await imagem.scrollIntoViewIfNeeded();
    await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
    expect(await imagem.evaluate((img) => img.currentSrc)).toMatch(/\.avif$/);
    await expect(imagem).toHaveAttribute("width", /^\d+$/);
    await expect(imagem).toHaveAttribute("height", /^\d+$/);
  }
});

test("só a imagem do topo da página inicial é baixada de imediato, com prioridade alta", async ({ page }) => {
  await page.goto(PAGINA);
  await expect(page.locator("main img[fetchpriority='high']")).toHaveCount(1);
  await expect(page.locator("main img[loading='eager']")).toHaveCount(1);
  await expect(page.locator("main img[loading='lazy']")).not.toHaveCount(0);
});

test.describe("Build de produção @producao", () => {
  test("HTML, CSS e JS minificados, com hash do conteúdo no nome dos arquivos", async ({ page, request }) => {
    await page.goto(PAGINA);
    await expect(page.locator("main h1")).toBeVisible();

    const js = await page.locator('script[type="module"]').getAttribute("src");
    const css = await page.locator('link[rel="stylesheet"]').getAttribute("href");
    expect(js).toMatch(/^assets\/main-[A-Z0-9]{8}\.js$/);
    expect(css).toMatch(/^assets\/estilos-[A-Z0-9]{8}\.css$/);

    const html = await (await request.get(PAGINA)).text();
    expect(html).not.toContain("\n");
    expect(html).not.toContain("<!--");
    const estilos = await (await request.get(css)).text();
    expect(estilos.trim().split("\n")).toHaveLength(2);   // o código em uma linha e o link do .map
  });

  test("orçamento: JS abaixo de 50 KB, CSS abaixo de 30 KB e primeira visita abaixo de 100 KB", async ({ page }) => {
    await page.goto(PAGINA);
    await expect(page.locator("main h1")).toBeVisible();
    await page.waitForLoadState("networkidle");

    const recursos = await page.evaluate(() =>
      [...performance.getEntriesByType("navigation"), ...performance.getEntriesByType("resource")]
        .map((recurso) => ({ nome: recurso.name, bytes: recurso.encodedBodySize })));
    const soma = (padrao) => recursos.filter((r) => padrao.test(r.nome)).reduce((total, r) => total + r.bytes, 0);

    expect(recursos.some((r) => /chart\.esm/.test(r.nome))).toBe(false);   // o Chart.js fica para a página de projetos
    expect(soma(/\.js$/)).toBeLessThan(50 * KB);
    expect(soma(/\.css$/)).toBeLessThan(30 * KB);
    expect(soma(/./)).toBeLessThan(100 * KB);
  });
});
