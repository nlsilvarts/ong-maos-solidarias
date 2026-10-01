/*
 * Apoio aos testes de ponta a ponta, que rodam no projeto e no build de produção.
 *
 * Os endereços são relativos ao baseURL de cada projeto do Playwright
 * (playwright.config.js): no desenvolvimento, a página fica em /html/index.html;
 * no build (pasta dist/), em /index.html.
 */
export const PAGINA = "index.html";

/* Arquivo do Chart.js: js/vendor/chart.esm.js no projeto e assets/chart.esm-[hash].js no build */
export const ARQUIVO_DO_CHART = /\/chart\.esm[^/]*\.js$/;

/* Cria na página a função moduloDoChart(), que importa o mesmo arquivo do Chart.js já
   carregado pelo site (mesmo endereço, mesma instância do módulo e os mesmos gráficos).
   Enquanto o site não carregou o Chart.js, ela devolve null */
export async function prepararConsultasAoChart(page) {
  await page.addInitScript((padrao) => {
    window.moduloDoChart = () => {
      const endereco = performance.getEntriesByType("resource")
        .map((recurso) => recurso.name)
        .find((nome) => new RegExp(padrao).test(nome));
      return endereco ? import(endereco) : null;
    };
  }, ARQUIVO_DO_CHART.source);
}
