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

test.describe("Semântica, teclado e WAI-ARIA", () => {
  test("a página tem os marcos banner, navegação, região de acessibilidade, principal e rodapé", async ({ page }) => {
    await page.goto(PAGINA);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Menu principal" })).toHaveCount(1);
    await expect(page.getByRole("region", { name: "Recursos de acessibilidade" })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  });

  test("submenu: abre com Enter, é percorrido com Tab e fecha com Esc, devolvendo o foco ao botão", async ({ page }) => {
    await page.goto(PAGINA);
    const botao = page.getByRole("button", { name: "Seções de Projetos" });
    const submenu = page.locator("#submenu-projetos");
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await expect(submenu).toBeHidden();

    await botao.focus();
    await page.keyboard.press("Enter");
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    await expect(submenu).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(submenu.getByRole("link", { name: "Projetos em andamento" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await expect(botao).toBeFocused();
    await expect(submenu).toBeHidden();
  });

  test("submenu: fecha quando o foco sai dele e quando uma seção é escolhida", async ({ page }) => {
    await page.goto(PAGINA);
    const botao = page.getByRole("button", { name: "Seções de Projetos" });

    await botao.click();
    for (let i = 0; i < 5; i += 1) await page.keyboard.press("Tab"); // 4 links do submenu e depois "Cadastro"
    await expect(page.locator('#menu-principal a[data-rota="cadastro"]')).toBeFocused();
    await expect(botao).toHaveAttribute("aria-expanded", "false");

    await botao.click();
    await page.getByRole("link", { name: "Campanhas de doação" }).click();
    await expect(page).toHaveURL(/#\/projetos\/campanhas$/);
    await expect(botao).toHaveAttribute("aria-expanded", "false");
  });

  test("fechar um alerta pelo teclado leva o foco ao título da seção", async ({ page }) => {
    await page.goto(`${PAGINA}#/projetos`);
    const alerta = page.locator("#campanhas .alerta");
    await alerta.getByRole("button", { name: "Fechar aviso" }).focus();
    await page.keyboard.press("Enter");
    await expect(alerta).toBeHidden();
    await expect(page.locator("#campanhas h2")).toBeFocused();
  });

  test("a notificação (toast) não some enquanto o mouse está sobre ela", async ({ page }) => {
    await page.clock.install();
    await page.goto(`${PAGINA}#/componentes`);
    await page.getByRole("button", { name: "Toast de aviso" }).click();
    const toast = page.locator(".toast");
    await toast.hover();
    await page.clock.runFor(8000);
    await expect(toast).toBeVisible();

    await page.mouse.move(0, 0);
    await page.clock.runFor(6000);
    await expect(toast).toHaveCount(0);
  });

  test("formulário: nomes acessíveis sem o asterisco e grupo de rádios obrigatório", async ({ page }) => {
    await page.goto(`${PAGINA}#/cadastro`);
    await expect(page.getByRole("textbox", { name: "Nome completo", exact: true })).toBeVisible();

    const grupo = page.getByRole("radiogroup", { name: "Como deseja participar?", exact: true });
    await expect(grupo).toHaveAttribute("aria-required", "true");

    await page.check("#aceite");
    await page.getByRole("button", { name: "Enviar cadastro" }).click();
    await expect(grupo).toHaveAttribute("aria-invalid", "true");
    await expect(grupo).toHaveAttribute("aria-describedby", /erro-participacao/);

    await page.check("#participacao-doador");
    await expect(grupo).toHaveAttribute("aria-invalid", "false");
  });

  test("a tabela de dados do gráfico tem legenda (caption) para leitores de tela", async ({ page }) => {
    await page.goto(`${PAGINA}#/projetos`);
    await page.getByText("Ver os dados em tabela").click();
    await expect(page.getByRole("table", { name: "Arrecadação de cada campanha em relação à meta" })).toBeVisible();
  });
});

test.describe("Alto contraste", () => {
  const botaoContraste = (page) => page.getByRole("button", { name: "Alto contraste" });
  const corDasBarras = (page) => page.evaluate(async () => {
    const { Chart } = await import("/js/vendor/chart.esm.js");
    return Chart.getChart("grafico-campanhas").data.datasets[0].backgroundColor;
  });

  for (const rota of ["inicio", "projetos", "componentes"]) {
    test(`#/${rota} em alto contraste sem violações (inclui o contraste de cores)`, async ({ page }) => {
      await page.goto(`${PAGINA}#/${rota}`);
      await botaoContraste(page).click();
      await expect(page.locator("html")).toHaveClass(/alto-contraste/);
      await semViolacoes(page);
    });
  }

  test("cadastro com erros e modal em alto contraste sem violações", async ({ page }) => {
    await page.goto(`${PAGINA}#/cadastro`);
    await botaoContraste(page).click();
    await page.check("#aceite");
    await page.getByRole("button", { name: "Enviar cadastro" }).click();
    await semViolacoes(page);

    await preencherCadastro(page);
    await page.getByRole("button", { name: "Enviar cadastro" }).click();
    await expect(page.locator("#modal-cadastro")).toBeVisible();
    await semViolacoes(page);
  });

  test("o botão informa o estado com aria-pressed e a escolha continua depois de recarregar", async ({ page }) => {
    await page.goto(PAGINA);
    await expect(botaoContraste(page)).toHaveAttribute("aria-pressed", "false");
    await botaoContraste(page).click();
    await expect(botaoContraste(page)).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => localStorage.getItem("ong-maos-solidarias:preferencias"))).toContain('"altoContraste":true');

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/alto-contraste/);
    await expect(botaoContraste(page)).toHaveAttribute("aria-pressed", "true");
  });

  test("sem escolha salva, segue a configuração do sistema (prefers-contrast: more)", async ({ page }) => {
    await page.emulateMedia({ contrast: "more" });
    await page.goto(PAGINA);
    await expect(page.locator("html")).toHaveClass(/alto-contraste/);
    await expect(botaoContraste(page)).toHaveAttribute("aria-pressed", "true");

    // Depois que a pessoa desliga, a escolha dela vale mais que a do sistema
    await botaoContraste(page).click();
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/alto-contraste/);
  });

  test("o gráfico troca as cores das barras junto com o tema", async ({ page }) => {
    await page.goto(`${PAGINA}#/projetos`);
    await expect.poll(() => corDasBarras(page)).toBe("#1f8a5a");
    await botaoContraste(page).click();
    await expect.poll(() => corDasBarras(page)).toBe("#ffff00");
    await botaoContraste(page).click();
    await expect.poll(() => corDasBarras(page)).toBe("#1f8a5a");
  });

  test("com cores forçadas do sistema, o botão ligado continua diferente do desligado", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(PAGINA);
    await page.getByRole("button", { name: "Texto maior" }).click();
    const fundo = (nome) => page.getByRole("button", { name: nome }).evaluate((botao) => getComputedStyle(botao).backgroundColor);
    expect(await fundo("Texto maior")).not.toBe(await fundo("Alto contraste"));
  });
});

test.describe("Teclado e leitores de tela", () => {
  /* Avalia o elemento com foco: contorno e contraste do contorno com o fundo onde ele é desenhado,
     logo fora das quatro bordas do elemento (vale o pior lado) */
  const avaliarFoco = () => {
    const elemento = document.activeElement;
    if (!elemento || elemento === document.body) return null;
    const rgb = (cor) => (cor.match(/[\d.]+/g) || []).map(Number);
    const luminancia = ([r, g, b]) => {
      const canal = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    };
    const estilo = getComputedStyle(elemento);
    const caixa = elemento.getBoundingClientRect();
    const d = parseFloat(estilo.outlineOffset) + parseFloat(estilo.outlineWidth) / 2;
    const limitar = (valor, maximo) => Math.min(Math.max(valor, 0), maximo - 1);
    const pontos = [
      [caixa.left - d, caixa.top + caixa.height / 2], [caixa.right + d, caixa.top + caixa.height / 2],
      [caixa.left + caixa.width / 2, caixa.top - d], [caixa.left + caixa.width / 2, caixa.bottom + d]
    ];
    const contorno = luminancia(rgb(estilo.outlineColor));
    const contrastes = pontos.map(([x, y]) => {
      const fora = document.elementsFromPoint(limitar(x, innerWidth), limitar(y, innerHeight))
        .find((no) => no !== elemento && !elemento.contains(no));
      let fundo = [255, 255, 255];
      for (let no = fora; no; no = no.parentElement) {
        const cor = rgb(getComputedStyle(no).backgroundColor);
        if (cor.length === 3 || cor[3] > 0.5) { fundo = cor.slice(0, 3); break; }
      }
      const atras = luminancia(fundo);
      return (Math.max(contorno, atras) + 0.05) / (Math.min(contorno, atras) + 0.05);
    });
    return {
      nome: (elemento.getAttribute("aria-label") || elemento.textContent || elemento.id).trim().slice(0, 40),
      estilo: estilo.outlineStyle,
      largura: parseFloat(estilo.outlineWidth),
      contraste: Math.min(...contrastes)
    };
  };

  const casos = [["inicio", false], ["projetos", false], ["cadastro", false], ["componentes", false], ["inicio", true], ["cadastro", true]];
  for (const [rota, altoContraste] of casos) {
    test(`#/${rota}${altoContraste ? " em alto contraste" : ""}: todo item do Tab tem contorno de foco visível (3:1 ou mais)`, async ({ page }) => {
      if (altoContraste) {
        await page.addInitScript(() => localStorage.setItem("ong-maos-solidarias:preferencias", '{"textoGrande":false,"altoContraste":true}'));
      }
      await page.goto(`${PAGINA}#/${rota}`);
      await expect(page.locator("main h1")).toBeVisible();
      const problemas = [];
      let paradas = 0;
      for (let i = 0; i < 60; i += 1) {
        await page.keyboard.press("Tab");
        const foco = await page.evaluate(avaliarFoco);
        if (!foco) break;
        paradas += 1;
        if (foco.estilo === "none" || foco.largura < 2 || foco.contraste < 3) {
          problemas.push(`${foco.nome}: ${foco.estilo} ${foco.largura}px, ${foco.contraste.toFixed(1)}:1`);
        }
        if (await page.evaluate(() => document.activeElement.closest("footer") && !document.activeElement.parentElement.nextElementSibling)) break;
      }
      expect(paradas).toBeGreaterThan(5);
      expect(problemas).toEqual([]);
    });
  }

  test("o botão Enviar continua no Tab, é anunciado como indisponível e leva ao aceite", async ({ page }) => {
    await page.goto(`${PAGINA}#/cadastro`);
    await page.locator("#mensagem").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#aceite")).toBeFocused();
    await page.keyboard.press("Tab");

    const enviar = page.getByRole("button", { name: "Enviar cadastro" });
    await expect(enviar).toBeFocused();
    await expect(enviar).toHaveAttribute("aria-disabled", "true");
    await expect(enviar).toHaveAccessibleDescription("Para enviar, é preciso aceitar o uso dos dados conforme a LGPD.");

    await page.keyboard.press("Enter");
    await expect(page.locator("#aceite")).toBeFocused();
    await expect(page.locator("#alerta-erro")).toBeHidden();
  });
});
