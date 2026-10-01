/*
 * Auditoria automática de acessibilidade com o axe-core: critérios da WCAG 2.1, níveis A e AA.
 * Ela complementa, mas não substitui, a verificação manual com teclado e leitor de tela.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGINA = "/html/index.html";
const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/* Roda o axe na página como está e lista as violações de forma legível */
async function semViolacoes(page) {
  const resultado = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
  const violacoes = resultado.violations.map((violacao) =>
    `${violacao.id} (${violacao.impact}): ${violacao.nodes.map((no) => no.target.join(" ")).join(", ")}`);
  expect(violacoes).toEqual([]);
}

async function preencherCadastro(page) {
  await page.fill("#nome", "Ana Souza");
  await page.fill("#email", "ana@exemplo.com");
  await page.locator("#cpf").pressSequentially("52998224725");
  await page.fill("#nascimento", "1998-03-15");
  await page.locator("#telefone").pressSequentially("11987654321");
  await page.locator("#cep").pressSequentially("01000000");
  await page.fill("#endereco", "Rua da Esperança");
  await page.fill("#numero", "123");
  await page.fill("#bairro", "Centro");
  await page.fill("#cidade", "São Paulo");
  await page.selectOption("#estado", "SP");
  await page.check("#participacao-doador");
  await page.check("#aceite");
}

test.describe("WCAG 2.1 AA (axe-core)", () => {
  for (const rota of ["inicio", "projetos", "cadastro", "componentes", "nao-existe"]) {
    test(`#/${rota} sem violações`, async ({ page }) => {
      await page.goto(`${PAGINA}#/${rota}`);
      await expect(page.locator("main h1")).toBeVisible();
      await semViolacoes(page);
    });
  }

  test("cadastro com erros e resumo de erros visível", async ({ page }) => {
    await page.goto(`${PAGINA}#/cadastro`);
    await page.check("#aceite");
    await page.getByRole("button", { name: "Enviar cadastro" }).click();
    await expect(page.locator("#alerta-erro")).toBeVisible();
    await semViolacoes(page);
  });

  test("modal de confirmação aberto", async ({ page }) => {
    await page.goto(`${PAGINA}#/cadastro`);
    await preencherCadastro(page);
    await page.getByRole("button", { name: "Enviar cadastro" }).click();
    await expect(page.locator("#modal-cadastro")).toBeVisible();
    await semViolacoes(page);
  });

  test("preferência Texto maior ligada", async ({ page }) => {
    await page.goto(`${PAGINA}#/cadastro`);
    await page.locator("#botao-texto-grande").click();
    await semViolacoes(page);
  });

  test.describe("No celular", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("menu aberto", async ({ page }) => {
      await page.goto(PAGINA);
      await page.locator(".menu-toggle").click();
      await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "true");
      await semViolacoes(page);
    });
  });
});
