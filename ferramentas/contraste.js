/*
 * Verificação do contraste das cores do Design System (WCAG 2.1).
 *
 * Uso: npm run contraste   (ou: node ferramentas/contraste.js)
 *
 * Lê as variáveis de cor do css/style.css (modo normal e alto contraste),
 * calcula a relação de contraste de cada par de cores usado no site com a
 * fórmula de luminância relativa da WCAG e mostra uma tabela. Termina com
 * erro (código 1) se algum par ficar abaixo do mínimo:
 *   - texto: 4,5:1 (critério 1.4.3, nível AA);
 *   - componentes de interface e gráficos (bordas de campos, ícones, contorno
 *     de foco, barras do gráfico): 3:1 (critério 1.4.11, nível AA);
 *   - texto no modo de alto contraste: 7:1 (critério 1.4.6, nível AAA).
 *
 * O axe-core (testes/e2e/acessibilidade.spec.js) confere o contraste do texto
 * já desenhado em cada tela. Esta ferramenta confere a paleta, inclusive os
 * elementos não textuais, que o axe não avalia. O teste de unidade
 * testes/unidade/contraste.test.js usa as mesmas funções.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const MINIMOS = {
  texto: 4.5,
  grafico: 3,
  textoAltoContraste: 7
};

/* Pares de cores do site. "frente" é a cor do texto ou do elemento gráfico,
   "fundo" é a cor sobre a qual ele aparece; os dois são variáveis do style.css */
export const PARES = {
  normal: [
    { elemento: "Texto do corpo", frente: "--cor-texto", fundo: "--cor-fundo", tipo: "texto" },
    { elemento: "Texto em cartões e no formulário", frente: "--cor-texto", fundo: "--cor-branco", tipo: "texto" },
    { elemento: "Texto suave (dicas, legendas, eixos do gráfico)", frente: "--cor-texto-suave", fundo: "--cor-branco", tipo: "texto" },
    { elemento: "Texto suave sobre o fundo da página", frente: "--cor-texto-suave", fundo: "--cor-fundo", tipo: "texto" },
    { elemento: "Links, títulos h2 e legendas dos grupos", frente: "--cor-primaria-escura", fundo: "--cor-fundo", tipo: "texto" },
    { elemento: "Links e títulos em cartões", frente: "--cor-primaria-escura", fundo: "--cor-branco", tipo: "texto" },
    { elemento: "Títulos h3", frente: "--cor-primaria", fundo: "--cor-fundo", tipo: "texto" },
    { elemento: "Cabeçalho e menu", frente: "--cor-branco", fundo: "--cor-primaria", tipo: "texto" },
    { elemento: "Item da página atual no menu", frente: "--cor-primaria-escura", fundo: "--cor-branco", tipo: "texto" },
    { elemento: "Barra de acessibilidade e rodapé", frente: "--cor-branco", fundo: "--cor-primaria-escura", tipo: "texto" },
    { elemento: "Botão principal", frente: "--cor-branco", fundo: "--cor-secundaria-escura", tipo: "texto" },
    { elemento: "Botão principal com o mouse", frente: "--cor-branco", fundo: "--cor-secundaria-hover", tipo: "texto" },
    { elemento: "Botão principal pressionado", frente: "--cor-branco", fundo: "--cor-secundaria-ativa", tipo: "texto" },
    { elemento: "Botão secundário", frente: "--cor-branco", fundo: "--cor-texto-suave", tipo: "texto" },
    { elemento: "Botão secundário com o mouse", frente: "--cor-branco", fundo: "--cor-neutra-hover", tipo: "texto" },
    { elemento: "Alerta de erro: título", frente: "--cor-erro", fundo: "--cor-erro-fundo", tipo: "texto" },
    { elemento: "Alerta de erro: texto", frente: "--cor-texto", fundo: "--cor-erro-fundo", tipo: "texto" },
    { elemento: "Alerta de informação: título", frente: "--cor-info", fundo: "--cor-info-fundo", tipo: "texto" },
    { elemento: "Alerta de informação: texto", frente: "--cor-texto", fundo: "--cor-info-fundo", tipo: "texto" },
    { elemento: "Alerta de aviso: título", frente: "--cor-aviso", fundo: "--cor-aviso-fundo", tipo: "texto" },
    { elemento: "Alerta de aviso: texto", frente: "--cor-texto", fundo: "--cor-aviso-fundo", tipo: "texto" },
    { elemento: "Alerta de sucesso: título", frente: "--cor-primaria-escura", fundo: "--cor-primaria-clara", tipo: "texto" },
    { elemento: "Alerta de sucesso: texto", frente: "--cor-texto", fundo: "--cor-primaria-clara", tipo: "texto" },
    { elemento: "Badge neutro", frente: "--cor-texto-suave", fundo: "--cor-neutra-clara", tipo: "texto" },
    { elemento: "Badge primário", frente: "--cor-primaria-escura", fundo: "--cor-primaria-clara", tipo: "texto" },
    { elemento: "Badge secundário", frente: "--cor-secundaria-hover", fundo: "--cor-secundaria-clara", tipo: "texto" },
    { elemento: "Badge de status: sucesso", frente: "--cor-branco", fundo: "--cor-primaria-escura", tipo: "texto" },
    { elemento: "Badge de status: aviso", frente: "--cor-branco", fundo: "--cor-aviso", tipo: "texto" },
    { elemento: "Badge de status: erro", frente: "--cor-branco", fundo: "--cor-erro", tipo: "texto" },
    { elemento: "Mensagem de erro do campo", frente: "--cor-erro", fundo: "--cor-branco", tipo: "texto" },
    { elemento: "Texto do campo válido", frente: "--cor-texto", fundo: "--cor-sucesso-fundo", tipo: "texto" },
    { elemento: "Borda dos campos", frente: "--cor-borda-campo", fundo: "--cor-branco", tipo: "grafico" },
    { elemento: "Borda e ícone do campo válido", frente: "--cor-sucesso", fundo: "--cor-sucesso-fundo", tipo: "grafico" },
    { elemento: "Borda e ícone do campo com erro", frente: "--cor-erro", fundo: "--cor-erro-fundo", tipo: "grafico" },
    { elemento: "Contorno de foco", frente: "--cor-foco", fundo: "--cor-fundo", tipo: "grafico" },
    { elemento: "Contorno de foco em cartões, formulário e submenu", frente: "--cor-foco", fundo: "--cor-branco", tipo: "grafico" },
    { elemento: "Contorno de foco no cabeçalho", frente: "--cor-branco", fundo: "--cor-primaria", tipo: "grafico" },
    { elemento: "Contorno de foco na barra e no rodapé", frente: "--cor-branco", fundo: "--cor-primaria-escura", tipo: "grafico" },
    { elemento: "Barras do gráfico", frente: "--cor-grafico", fundo: "--cor-branco", tipo: "grafico" }
  ],
  altoContraste: [
    { elemento: "Texto", frente: "--hc-texto", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Links, botões e menu", frente: "--hc-destaque", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Página atual, botão ligado e botão com o mouse", frente: "--hc-fundo", fundo: "--hc-destaque", tipo: "texto" },
    { elemento: "Sucesso", frente: "--hc-sucesso", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Erro", frente: "--hc-erro", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Aviso", frente: "--hc-aviso", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Informação", frente: "--hc-info", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Badge de status: sucesso (texto preto)", frente: "--hc-fundo", fundo: "--hc-sucesso", tipo: "texto" },
    { elemento: "Badge de status: aviso (texto preto)", frente: "--hc-fundo", fundo: "--hc-aviso", tipo: "texto" },
    { elemento: "Badge de status: erro (texto preto)", frente: "--hc-fundo", fundo: "--hc-erro", tipo: "texto" },
    { elemento: "Botão desabilitado", frente: "--hc-desabilitado", fundo: "--hc-fundo", tipo: "texto" },
    { elemento: "Borda dos campos", frente: "--cor-borda-campo", fundo: "--hc-fundo", tipo: "grafico" },
    { elemento: "Contorno de foco", frente: "--cor-foco", fundo: "--hc-fundo", tipo: "grafico" },
    { elemento: "Barras do gráfico", frente: "--cor-grafico", fundo: "--hc-fundo", tipo: "grafico" },
    { elemento: "Linhas de grade do gráfico", frente: "--cor-grade", fundo: "--hc-fundo", tipo: "grafico" }
  ]
};

/* Luminância relativa de uma cor #rrggbb (definição da WCAG 2.1) */
export function luminancia(cor) {
  const [r, g, b] = [1, 3, 5]
    .map((inicio) => parseInt(cor.slice(inicio, inicio + 2), 16) / 255)
    .map((canal) => (canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* Relação de contraste entre duas cores, de 1 (iguais) a 21 (preto e branco) */
export function contraste(corA, corB) {
  const [clara, escura] = [luminancia(corA), luminancia(corB)].sort((a, b) => b - a);
  return (clara + 0.05) / (escura + 0.05);
}

/* Mostra a relação com duas casas. Abaixo do mínimo, o valor é cortado em vez de
   arredondado: a WCAG não aceita arredondar para cima (4,497 não vira 4,50) */
export function formatar(razao, minimo = 0) {
  const valor = razao >= minimo ? Math.round(razao * 100) / 100 : Math.floor(razao * 100) / 100;
  return `${valor.toFixed(2).replace(".", ",")}:1`;
}

/* Variáveis declaradas no bloco de um seletor (":root" ou "html.alto-contraste") */
export function lerVariaveis(css, seletor) {
  const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const inicio = semComentarios.search(new RegExp(`^${escapado}\\s*\\{`, "m"));
  if (inicio === -1) {
    throw new Error(`Bloco "${seletor} { ... }" não encontrado no CSS`);
  }
  const abre = semComentarios.indexOf("{", inicio);
  const bloco = semComentarios.slice(abre + 1, semComentarios.indexOf("}", abre));
  const variaveis = {};
  for (const [, nome, valor] of bloco.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    variaveis[nome] = valor.trim();
  }
  return variaveis;
}

/* Valor final de uma variável de cor, seguindo as referências var(--outra) */
export function resolverCor(variaveis, nome, caminho = []) {
  if (caminho.includes(nome)) {
    throw new Error(`Referência circular: ${[...caminho, nome].join(" -> ")}`);
  }
  const valor = variaveis[nome];
  if (valor === undefined) {
    throw new Error(`A variável ${nome} não existe no style.css`);
  }
  const referencia = valor.match(/^var\((--[\w-]+)\)$/);
  if (referencia) {
    return resolverCor(variaveis, referencia[1], [...caminho, nome]);
  }
  const hexadecimal = valor.toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (!hexadecimal) {
    throw new Error(`${nome} não é uma cor hexadecimal: ${valor}`);
  }
  const digitos = hexadecimal[1];
  return digitos.length === 3 ? `#${[...digitos].map((d) => d + d).join("")}` : `#${digitos}`;
}

/* Calcula a relação de contraste de todos os pares, nos dois modos */
export function verificarPares(css) {
  const normal = lerVariaveis(css, ":root");
  const altoContraste = { ...normal, ...lerVariaveis(css, "html.alto-contraste") };
  const modos = [
    { modo: "Modo normal", pares: PARES.normal, variaveis: normal, minimoTexto: MINIMOS.texto },
    { modo: "Alto contraste", pares: PARES.altoContraste, variaveis: altoContraste, minimoTexto: MINIMOS.textoAltoContraste }
  ];

  return modos.flatMap(({ modo, pares, variaveis, minimoTexto }) =>
    pares.map((par) => {
      const corFrente = resolverCor(variaveis, par.frente);
      const corFundo = resolverCor(variaveis, par.fundo);
      const razao = contraste(corFrente, corFundo);
      const minimo = par.tipo === "texto" ? minimoTexto : MINIMOS.grafico;
      return { modo, ...par, corFrente, corFundo, razao, minimo, ok: razao >= minimo };
    })
  );
}

/* Execução pela linha de comando: imprime a tabela e define o código de saída */
function executar() {
  const css = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");
  const resultados = verificarPares(css);
  const largura = Math.max(...resultados.map((r) => r.elemento.length));

  console.log("Contraste das cores do Design System (fórmula da WCAG 2.1)");
  console.log("Mínimos: texto 4,5:1 (1.4.3) · componentes e gráficos 3:1 (1.4.11) · texto no alto contraste 7:1 (1.4.6)");

  let modoAtual = "";
  for (const r of resultados) {
    if (r.modo !== modoAtual) {
      modoAtual = r.modo;
      console.log(`\n${modoAtual}`);
    }
    const situacao = r.ok ? "ok   " : "FALHA";
    const minimo = `mín. ${String(r.minimo).replace(".", ",")}:1`;
    console.log(`  ${situacao}  ${formatar(r.razao, r.minimo).padStart(7)}  ${minimo.padEnd(11)}  ${r.elemento.padEnd(largura)}  ${r.corFrente} sobre ${r.corFundo}`);
  }

  const falhas = resultados.filter((r) => !r.ok);
  console.log(`\n${resultados.length} pares verificados: ${falhas.length === 0 ? "todos acima do mínimo." : `${falhas.length} abaixo do mínimo.`}`);
  process.exitCode = falhas.length === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  executar();
}
