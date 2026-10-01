/*
 * Persistência no localStorage: preferência de texto, rascunho e histórico.
 * Cada teste roda em um navegador novo, com o localStorage vazio.
 */
import { test, expect } from "@playwright/test";

const PAGINA = "/html/index.html";
const PREFIXO = "ong-maos-solidarias:";

const lerChave = (page, chave) => page.evaluate((nome) => localStorage.getItem(nome), PREFIXO + chave);

test("a preferência Texto maior continua depois de recarregar a página", async ({ page }) => {
  await page.goto(PAGINA);
  const botao = page.locator("#botao-texto-grande");
  await expect(botao).toHaveAttribute("aria-pressed", "false");

  await botao.click();
  await expect(page.locator("html")).toHaveClass(/texto-grande/);
  expect(await lerChave(page, "preferencias")).toBe('{"textoGrande":true}');

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/texto-grande/);
  await expect(botao).toHaveAttribute("aria-pressed", "true");
});

test("o rascunho do cadastro volta depois de recarregar, sem CPF e sem aceite", async ({ page }) => {
  await page.goto(`${PAGINA}#/cadastro`);
  await page.fill("#nome", "Ana Souza");
  await page.locator("#cpf").pressSequentially("52998224725");
  await page.check("#aceite");
  await page.check("#participacao-voluntario");

  // O rascunho é gravado 400 ms depois da última alteração
  await expect.poll(() => lerChave(page, "rascunho-cadastro")).toContain("voluntario");
  const rascunho = await lerChave(page, "rascunho-cadastro");
  expect(rascunho).toContain("Ana Souza");
  expect(rascunho).not.toContain("529.982");
  expect(rascunho).not.toContain("aceite");

  await page.reload();
  await expect(page.locator("#aviso-rascunho")).toBeVisible();
  await expect(page.locator("#nome")).toHaveValue("Ana Souza");
  await expect(page.locator("#participacao-voluntario")).toBeChecked();
  await expect(page.locator("#cpf")).toHaveValue("");
  await expect(page.locator("#aceite")).not.toBeChecked();

  await page.getByRole("button", { name: "Descartar rascunho" }).click();
  await expect(page.locator("#nome")).toHaveValue("");
  expect(await lerChave(page, "rascunho-cadastro")).toBeNull();
});

test("dados corrompidos ou com HTML no localStorage não quebram a página", async ({ page }) => {
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));

  await page.addInitScript((prefixo) => {
    localStorage.setItem(prefixo + "preferencias", "{quebrado");
    localStorage.setItem(prefixo + "rascunho-cadastro", "[]");
    localStorage.setItem(prefixo + "cadastros-enviados", JSON.stringify([
      { primeiroNome: '<img src=x onerror="window.invadido=true">', participacao: "doador", enviadoEm: "2026-09-30T12:00:00.000Z" },
      { primeiroNome: 42 },
      "texto solto"
    ]));
  }, PREFIXO);
  await page.goto(`${PAGINA}#/cadastro`);

  // Só o item no formato esperado aparece, e o HTML salvo é mostrado como texto
  const itens = page.locator("#historico-lista li");
  await expect(itens).toHaveCount(1);
  await expect(itens.first()).toContainText('<img src=x onerror="window.invadido=true">');
  expect(await page.evaluate(() => window.invadido)).toBeUndefined();

  await expect(page.locator("#aviso-rascunho")).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/texto-grande/);
  expect(erros).toEqual([]);
});
