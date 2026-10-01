/*
 * Formulário de cadastro: verificação em tempo real, resumo de erros e envio.
 */
import { test, expect } from "@playwright/test";

import { PAGINA } from "./apoio/site.js";

const CADASTRO = `${PAGINA}#/cadastro`;

/* Preenche todos os campos obrigatórios com dados válidos */
async function preencherComDadosValidos(page) {
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

const botaoEnviar = (page) => page.getByRole("button", { name: "Enviar cadastro" });

test.beforeEach(async ({ page }) => {
  await page.goto(CADASTRO);
});

test("aplica as máscaras durante a digitação", async ({ page }) => {
  await page.locator("#cpf").pressSequentially("52998224725");
  await page.locator("#telefone").pressSequentially("11987654321");
  await page.locator("#cep").pressSequentially("01000000");
  await expect(page.locator("#cpf")).toHaveValue("529.982.247-25");
  await expect(page.locator("#telefone")).toHaveValue("(11) 98765-4321");
  await expect(page.locator("#cep")).toHaveValue("01000-000");
});

test("verifica o nome ao sair do campo e atualiza enquanto o usuário digita", async ({ page }) => {
  const nome = page.locator("#nome");
  await nome.fill("Ana");
  await nome.press("Tab");
  await expect(nome).toHaveAttribute("aria-invalid", "true");
  await expect(nome).toHaveAttribute("aria-describedby", /erro-nome/);
  await expect(page.locator("#erro-nome")).toHaveText("Informe nome e sobrenome.");

  await nome.press("End"); // volta ao campo, com o cursor no fim do texto
  await nome.pressSequentially(" Souza");
  await expect(nome).toHaveValue("Ana Souza");
  await expect(nome).toHaveAttribute("aria-invalid", "false");
  await expect(page.locator("#erro-nome")).toHaveCount(0);
});

test("recusa CPF com dígito verificador errado e aceita depois de corrigido", async ({ page }) => {
  const cpf = page.locator("#cpf");
  await cpf.pressSequentially("52998224724");
  await cpf.press("Tab");
  await expect(page.locator("#erro-cpf")).toHaveText("CPF inválido. Confira os números digitados.");

  await cpf.press("End");
  await cpf.press("Backspace");
  await cpf.pressSequentially("5");
  await expect(cpf).toHaveValue("529.982.247-25");
  await expect(cpf).toHaveAttribute("aria-invalid", "false");
});

test("o botão Enviar só fica habilitado com o aceite da LGPD", async ({ page }) => {
  await expect(botaoEnviar(page)).toBeDisabled();
  await page.check("#aceite");
  await expect(botaoEnviar(page)).toBeEnabled();
  await page.uncheck("#aceite");
  await expect(botaoEnviar(page)).toBeDisabled();
});

test("envio com erros mostra o resumo com links que levam aos campos", async ({ page }) => {
  await page.check("#aceite");
  await botaoEnviar(page).click();

  const resumo = page.locator("#alerta-erro");
  await expect(resumo).toBeVisible();
  await expect(resumo).toBeFocused();
  await expect(resumo.locator(".lista-erros a")).toHaveCount(12);

  await resumo.getByRole("link", { name: /^E-mail:/ }).click();
  await expect(page.locator("#email")).toBeFocused();
  await expect(page).toHaveURL(/#\/cadastro$/);
});

for (const forma of ["Entendi", "Escape"]) {
  test(`envio válido abre o modal e, ao fechar com ${forma}, o foco vai para o histórico`, async ({ page }) => {
    await preencherComDadosValidos(page);
    await botaoEnviar(page).click();

    const modal = page.locator("#modal-cadastro");
    await expect(modal).toBeVisible();
    await expect(page.locator("#modal-cadastro-texto")).toContainText("Obrigado, Ana!");

    if (forma === "Entendi") {
      await modal.getByRole("button", { name: "Entendi" }).click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(modal).toBeHidden();

    // Regressão da issue #17: na versão 1.0.0 o foco ficava no <body>
    await expect(page.locator("#historico-titulo")).toBeFocused();
    await expect(page.locator("#historico-lista li")).toHaveCount(1);
    await expect(page.locator("#nome")).toHaveValue("");
    await expect(botaoEnviar(page)).toBeDisabled();
  });
}

test("Limpar campos remove as marcações e as mensagens", async ({ page }) => {
  await page.fill("#nome", "Ana");
  await page.press("#nome", "Tab");
  await expect(page.locator(".campo-invalido")).toHaveCount(1);

  await page.getByRole("button", { name: "Limpar campos" }).click();
  await expect(page.locator(".campo-valido, .campo-invalido, .mensagem-erro")).toHaveCount(0);
  await expect(page.locator("#nome")).toHaveValue("");
});
