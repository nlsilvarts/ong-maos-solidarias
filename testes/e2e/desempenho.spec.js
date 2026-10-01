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

/* A imagem principal tem versões de 400 e 800 px (srcset + sizes): o navegador escolhe
   pela largura que ela ocupa na tela e pela densidade de pixels */
const casos = [
  { tela: "celular 390 px, densidade 1x", viewport: { width: 390, height: 844 }, densidade: 1, arquivo: "voluntarios-400.avif" },
  { tela: "celular 390 px, densidade 2x", viewport: { width: 390, height: 844 }, densidade: 2, arquivo: "voluntarios.avif" },
  { tela: "notebook 1280 px, densidade 1x", viewport: { width: 1280, height: 800 }, densidade: 1, arquivo: "voluntarios.avif" }
];
for (const { tela, viewport, densidade, arquivo } of casos) {
  test.describe(`Imagem principal em ${tela}`, () => {
    test.use({ viewport, deviceScaleFactor: densidade });

    test(`baixa ${arquivo}`, async ({ page }) => {
      await page.goto(PAGINA);
      const imagem = page.locator("main img[fetchpriority='high']");
      await expect.poll(() => imagem.evaluate((img) => img.complete && img.currentSrc.split("/").pop())).toBe(arquivo);
    });
  });
}

/* CLS (Cumulative Layout Shift): soma das mudanças de layout que a pessoa vê enquanto a página
   carrega. O script principal chega com atraso, para a casca da SPA (cabeçalho, "Carregando…" e
   rodapé) ser desenhada antes do conteúdo, como acontece numa rede lenta */
const mudancasDeLayout = (page) => page.evaluate(() => new Promise((resolver) => {
  let soma = 0;
  new PerformanceObserver((lista) => {
    for (const mudanca of lista.getEntries()) {
      if (!mudanca.hadRecentInput) soma += mudanca.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  setTimeout(() => resolver(soma), 300);
}));

for (const { tela, viewport } of [
  { tela: "celular", viewport: { width: 412, height: 823 } },
  { tela: "computador", viewport: { width: 1350, height: 940 } }
]) {
  test.describe(`Estabilidade do layout no ${tela}`, () => {
    test.use({ viewport });

    test("o rodapé não pula quando o conteúdo aparece (CLS abaixo de 0,1)", async ({ page }) => {
      await page.route(/\/(js\/main|assets\/main-[A-Z0-9]+)\.js$/, async (rota) => {
        await new Promise((esperar) => setTimeout(esperar, 400));
        await rota.continue();
      });
      await page.goto(PAGINA);
      await expect(page.locator("main h1")).toBeVisible();
      expect(await mudancasDeLayout(page)).toBeLessThan(0.1);
    });
  });
}

test.describe("Build de produção @producao", () => {
  test("HTML, CSS e JS minificados e servidos com gzip, com hash do conteúdo no nome dos arquivos", async ({ page, request }) => {
    const respostas = new Map();
    page.on("response", (resposta) => respostas.set(new URL(resposta.url()).pathname.split("/").pop(), resposta));
    await page.goto(PAGINA);
    await expect(page.locator("main h1")).toBeVisible();

    const js = await page.locator('script[type="module"]').getAttribute("src");
    const css = await page.locator('link[rel="stylesheet"]').getAttribute("href");
    expect(js).toMatch(/^assets\/main-[A-Z0-9]{8}\.js$/);
    expect(css).toMatch(/^assets\/estilos-[A-Z0-9]{8}\.css$/);
    for (const arquivo of [js, css].map((endereco) => endereco.split("/").pop())) {
      expect(respostas.get(arquivo).headers()["content-encoding"], `${arquivo} com gzip`).toBe("gzip");
    }

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
        .map((recurso) => ({ nome: recurso.name, bytes: recurso.decodedBodySize })));   // tamanho sem o gzip
    const soma = (padrao) => recursos.filter((r) => padrao.test(r.nome)).reduce((total, r) => total + r.bytes, 0);

    expect(recursos.some((r) => /chart\.esm/.test(r.nome))).toBe(false);   // o Chart.js fica para a página de projetos
    expect(soma(/\.js$/)).toBeLessThan(50 * KB);
    expect(soma(/\.css$/)).toBeLessThan(30 * KB);
    expect(soma(/./)).toBeLessThan(100 * KB);
  });
});
