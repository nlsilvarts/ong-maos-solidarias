/*
 * Configuração dos testes de ponta a ponta (Playwright).
 *
 * Uso: npm run test:e2e
 * O Playwright inicia o servidor local (ferramentas/servidor.js), abre o
 * Chromium e executa os arquivos de testes/e2e. Se o servidor já estiver
 * rodando (npm start), ele é reaproveitado.
 */
import { defineConfig, devices } from "@playwright/test";

const PORTA = Number(process.env.PORT) || 8080;

export default defineConfig({
  testDir: "testes/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-BR",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "node ferramentas/servidor.js",
    url: `http://localhost:${PORTA}/html/index.html`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORTA) }
  }
});
