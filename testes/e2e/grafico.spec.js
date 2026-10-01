/*
 * Gráfico de arrecadação (Chart.js): carregamento sob demanda, ciclo de vida e alternativa em tabela.
 */
import { test, expect } from "@playwright/test";

import { PAGINA, ARQUIVO_DO_CHART, prepararConsultasAoChart } from "./apoio/site.js";

test.beforeEach(({ page }) => prepararConsultasAoChart(page));

/* As consultas importam o mesmo módulo que a página usa (mesmo endereço, mesma instância do Chart.js) */
const instancias = (page) => page.evaluate(async () => {
  const modulo = await window.moduloDoChart();
  return modulo ? Object.keys(modulo.Chart.instances).length : null;
});

const graficoDasCampanhas = (page) => page.evaluate(async () => {
  const { Chart } = await window.moduloDoChart();
  const grafico = Chart.getChart("grafico-campanhas");
  return { valores: grafico.data.datasets[0].data, rotulos: grafico.scales.y.ticks.map((tick) => tick.label) };
});

test("carrega o Chart.js só na página de projetos e desenha as três campanhas", async ({ page }) => {
  const pedidos = [];
  page.on("request", (pedido) => {
    if (ARQUIVO_DO_CHART.test(pedido.url())) pedidos.push(pedido.url());
  });

  await page.goto(PAGINA);
  await expect(page.locator("main h1")).toBeVisible();
  expect(pedidos).toHaveLength(0);

  await page.locator("#menu-principal").getByRole("link", { name: "Projetos", exact: true }).click();
  await expect.poll(() => instancias(page)).toBe(1);
  expect(pedidos).toHaveLength(1);
  expect(await page.evaluate(() => typeof window.Chart)).toBe("undefined");
  expect((await graficoDasCampanhas(page)).valores).toEqual([74, 40, 88]);
  await expect(page.locator("#grafico-campanhas")).toHaveAttribute("aria-label", /Campanha do Agasalho, 74%/);
});

test("destrói o gráfico ao sair da página e cria de novo ao voltar", async ({ page }) => {
  await page.goto(`${PAGINA}#/projetos`);
  await expect.poll(() => instancias(page)).toBe(1);

  await page.locator("#menu-principal").getByRole("link", { name: "Início", exact: true }).click();
  await expect(page.locator("main h1")).toHaveText("Bem-vindo à ONG Mãos Solidárias");
  expect(await instancias(page)).toBe(0);

  await page.goBack();
  await expect.poll(() => instancias(page)).toBe(1);
});

test("mostra a tabela de dados quando a biblioteca não carrega", async ({ page }) => {
  await page.route(ARQUIVO_DO_CHART, (rota) => rota.abort());
  await page.goto(`${PAGINA}#/projetos`);

  await expect(page.locator("#grafico-aviso")).toBeVisible();
  await expect(page.locator(".grafico-area")).toBeHidden();
  await expect(page.locator("#grafico-tabela")).toHaveAttribute("open", "");
  await expect(page.locator("#grafico-tabela tbody tr")).toHaveCount(3);
});

test.describe("No celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("os nomes das campanhas quebram em linhas no eixo do gráfico", async ({ page }) => {
    await page.goto(`${PAGINA}#/projetos/campanhas`);
    await expect.poll(() => instancias(page)).toBe(1);
    const { rotulos } = await graficoDasCampanhas(page);
    expect(rotulos[0]).toEqual(["Campanha do", "Agasalho"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
