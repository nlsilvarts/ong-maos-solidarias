/*
 * Configuração dos testes de ponta a ponta (Playwright).
 *
 * Os mesmos testes rodam em dois projetos:
 *   - desenvolvimento: o código-fonte, servido por ferramentas/servidor.js
 *     (npm run test:e2e);
 *   - producao: o build de produção da pasta dist/, servido pelo mesmo
 *     servidor em um subcaminho, como no GitHub Pages
 *     (npm run test:e2e:producao, que gera o build antes).
 * O Playwright inicia os servidores, abre o Chromium e executa os arquivos de
 * testes/e2e. Se um servidor já estiver rodando na porta, ele é reaproveitado.
 */
import { defineConfig, devices } from "@playwright/test";

const PORTA = Number(process.env.PORT) || 8080;
const PORTA_PRODUCAO = PORTA + 1;
const PREFIXO = "/ong-maos-solidarias/";

export default defineConfig({
  testDir: "testes/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    locale: "pt-BR",
    trace: "retain-on-failure"
  },
  projects: [
    // Os testes marcados com @producao conferem o que só existe no build (minificação, hash, orçamento)
    { name: "desenvolvimento", grepInvert: /@producao/, use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORTA}/html/` } },
    { name: "producao", use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORTA_PRODUCAO}${PREFIXO}` } }
  ],
  webServer: [
    {
      command: "node ferramentas/servidor.js",
      url: `http://localhost:${PORTA}/html/index.html`,
      reuseExistingServer: !process.env.CI,
      env: { PORT: String(PORTA) }
    },
    {
      // Espera só a porta abrir: o servidor sobe mesmo antes de existir a pasta dist/
      command: "node ferramentas/servidor.js dist",
      port: PORTA_PRODUCAO,
      reuseExistingServer: !process.env.CI,
      env: { PORT: String(PORTA_PRODUCAO), PREFIXO }
    }
  ]
});
