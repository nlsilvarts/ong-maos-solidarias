/*
 * Gráfico de progresso das campanhas de doação, feito com a biblioteca Chart.js.
 *
 * A biblioteca foi instalada pelo npm (chart.js 4.5.1) e empacotada com o
 * esbuild em um único ES Module local: js/vendor/chart.esm.js. Ela é
 * carregada sob demanda com import(), apenas quando a página de projetos é
 * aberta, e não cria variáveis globais (nada de window.Chart).
 */
import { percentualArrecadado } from "./dados.js";
import { numero } from "./templates.js";

let grafico = null;

/* As cores vêm das variáveis do Design System (css/style.css) */
function corDoTema(variavel) {
  return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim();
}

/* Em gráficos estreitos, divide rótulos longos em linhas ("Campanha do" / "Agasalho") */
function quebrarRotulo(texto, limite = 12) {
  return texto.split(" ").reduce((linhas, palavra) => {
    const ultima = linhas[linhas.length - 1];
    if (ultima && `${ultima} ${palavra}`.length <= limite) {
      linhas[linhas.length - 1] = `${ultima} ${palavra}`;
    } else {
      linhas.push(palavra);
    }
    return linhas;
  }, []);
}

/* Plugin próprio do Chart.js: escreve o percentual na ponta de cada barra */
const rotuloNaPonta = {
  id: "rotuloNaPonta",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const valores = chart.data.datasets[0].data;
    ctx.save();
    ctx.font = `600 14px ${corDoTema("--fonte-base")}`;
    ctx.fillStyle = corDoTema("--cor-texto");
    ctx.textBaseline = "middle";
    chart.getDatasetMeta(0).data.forEach((barra, indice) => {
      ctx.fillText(`${valores[indice]}%`, barra.x + 8, barra.y);
    });
    ctx.restore();
  }
};

export async function criarGraficoCampanhas(canvas, campanhas) {
  destruirGraficoCampanhas();

  // Importação dinâmica: o arquivo só é baixado quando o gráfico é necessário
  const { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } =
    await import("../vendor/chart.esm.js");

  // O usuário pode ter trocado de página enquanto a biblioteca carregava
  if (!canvas.isConnected) {
    return;
  }

  // Registra apenas os componentes usados por um gráfico de barras
  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

  const fonte = { family: corDoTema("--fonte-base"), size: 14 };
  const corGrade = corDoTema("--cor-grade");
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  grafico = new Chart(canvas, {
    type: "bar",
    data: {
      labels: campanhas.map((campanha) => campanha.titulo),
      datasets: [{
        label: "Meta alcançada",
        data: campanhas.map(percentualArrecadado),
        backgroundColor: corDoTema("--cor-grafico"),
        borderRadius: 4, // arredonda só a ponta; a base da barra fica reta
        maxBarThickness: 24
      }]
    },
    options: {
      indexAxis: "y", // barras horizontais
      responsive: true,
      maintainAspectRatio: false,
      animation: reduzirMovimento ? false : { duration: 600 },
      layout: { padding: { right: 48 } }, // espaço para o rótulo na ponta da barra
      scales: {
        x: {
          min: 0,
          max: 100,
          // Sem rótulos inclinados: em telas estreitas, alguns são pulados
          ticks: { stepSize: 25, maxRotation: 0, autoSkip: true, callback: (valor) => `${valor}%`, color: corDoTema("--cor-texto-suave"), font: fonte },
          grid: { color: corGrade },
          border: { color: corGrade }
        },
        y: {
          ticks: {
            color: corDoTema("--cor-texto"),
            font: fonte,
            // Recalculado a cada redimensionamento: quebra os nomes quando o gráfico fica estreito
            callback(valor) {
              const rotulo = this.getLabelForValue(valor);
              return this.chart.width < 520 ? quebrarRotulo(rotulo) : rotulo;
            }
          },
          grid: { display: false },
          border: { color: corGrade }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (contexto) => {
              const campanha = campanhas[contexto.dataIndex];
              return `${numero(campanha.arrecadado)} de ${numero(campanha.quantidade)} ${campanha.unidade} (${contexto.raw}%)`;
            }
          }
        }
      }
    },
    plugins: [rotuloNaPonta]
  });
}

/* Libera o canvas e os observadores da biblioteca ao sair da página */
export function destruirGraficoCampanhas() {
  if (grafico) {
    grafico.destroy();
    grafico = null;
  }
}
