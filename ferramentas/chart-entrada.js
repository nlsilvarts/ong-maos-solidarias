/*
 * Ponto de entrada do pacote do Chart.js usado pelo site.
 * Exporta apenas os componentes do gráfico de barras: o esbuild descarta
 * o restante da biblioteca (tree shaking), e o arquivo gerado fica menor.
 *
 * Para gerar de novo js/vendor/chart.esm.js:
 *   npm install
 *   npm run build:vendor
 */
export { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
