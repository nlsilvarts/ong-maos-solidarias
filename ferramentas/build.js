/*
 * Build de produção: gera a pasta dist/, pronta para publicar.
 *
 * Uso: npm run build   (e npm run preview para conferir o resultado)
 *
 * Ferramentas:
 *   - esbuild (bundler): parte de js/main.js, junta todos os módulos importados
 *     em um arquivo, separa o Chart.js em outro arquivo, carregado só quando o
 *     gráfico aparece (code splitting do import()), e minifica. Também junta o
 *     reset.css e o style.css em uma única folha de estilo minificada;
 *   - html-minifier-terser: minifica o index.html (espaços, comentários e os
 *     scripts embutidos no <head>).
 *
 * Os arquivos de assets/ levam no nome um hash do conteúdo (main-3F2K7Q1A.js):
 * se o conteúdo muda, o nome muda, e o navegador nunca usa uma cópia velha do
 * cache. Mapas de código-fonte (.map) acompanham o JS e o CSS, para depurar em
 * produção. As imagens, já otimizadas por "npm run imagens", são copiadas.
 *
 * Estrutura de dist/:
 *   index.html   página única da SPA, na raiz (no projeto, ela fica em html/)
 *   assets/      JavaScript e CSS minificados
 *   imagens/     imagens otimizadas (a pasta originais/ fica de fora)
 */
import * as esbuild from "esbuild";
import { minify } from "html-minifier-terser";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(RAIZ, "dist");
const ASSETS = join(DIST, "assets");

/* Navegadores com suporte ao <dialog> e aos demais recursos usados pelo site.
   O esbuild converte a sintaxe que algum deles não entenda */
export const NAVEGADORES = ["chrome98", "edge98", "firefox98", "safari15.4"];

/* Troca um trecho exato e falha se ele não aparecer o número de vezes esperado:
   assim, uma mudança no HTML que quebre o build é percebida na hora */
export function substituir(texto, de, para, vezes = 1) {
  const encontrados = texto.split(de).length - 1;
  if (encontrados !== vezes) {
    throw new Error(`Build: esperava ${vezes} ocorrência(s) de ${JSON.stringify(de)}, encontrei ${encontrados}`);
  }
  return texto.split(de).join(para);
}

/* No projeto, a página fica em html/ e aponta as imagens com "../imagens/".
   Em dist/, o index.html fica na raiz, então o caminho vira "imagens/" */
const caminhoDasImagens = {
  name: "caminho-das-imagens",
  setup(build) {
    build.onLoad({ filter: /[\\/]js[\\/]modules[\\/]templates\.js$/ }, async ({ path }) => ({
      contents: substituir(await readFile(path, "utf8"), 'const PASTA_IMAGENS = "../imagens/";', 'const PASTA_IMAGENS = "imagens/";'),
      loader: "js"
    }));
  }
};

const OPCOES_COMUNS = {
  absWorkingDir: RAIZ,
  bundle: true,
  minify: true,
  sourcemap: "linked",
  target: NAVEGADORES,
  charset: "utf8",          // acentos gravados como UTF-8, sem sequências ã
  legalComments: "eof",     // mantém a licença MIT do Chart.js no fim do arquivo
  metafile: true,
  logLevel: "warning"
};

const OPCOES_HTML = {
  collapseWhitespace: true,
  removeComments: true,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,     // tira só type="text/javascript"; type="module" fica
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyJS: true,
  minifyCSS: true
};

/* Arquivo gerado pelo esbuild (sem contar os .map) que atende à condição */
function saida(resultado, condicao) {
  const [arquivo, info] = Object.entries(resultado.metafile.outputs)
    .find(([nome, dados]) => !nome.endsWith(".map") && condicao(dados));
  return { nome: basename(arquivo), info };
}

/* Tamanho somado dos arquivos de origem de uma saída do esbuild */
function tamanhoDasOrigens(resultado, info) {
  return Object.keys(info.inputs).reduce((total, origem) => total + resultado.metafile.inputs[origem].bytes, 0);
}

export async function construir() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(ASSETS, { recursive: true });

  // 1. JavaScript: um pacote a partir de js/main.js e o Chart.js em separado
  const js = await esbuild.build({
    ...OPCOES_COMUNS,
    entryPoints: ["js/main.js"],
    outdir: ASSETS,
    format: "esm",
    splitting: true,
    entryNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    plugins: [caminhoDasImagens]
  });

  // 2. CSS: reset.css e style.css em uma folha de estilo só
  const css = await esbuild.build({
    ...OPCOES_COMUNS,
    stdin: { contents: '@import "./reset.css";\n@import "./style.css";\n', resolveDir: join(RAIZ, "css"), sourcefile: "estilos.css", loader: "css" },
    outdir: ASSETS,
    entryNames: "estilos-[hash]"
  });

  const main = saida(js, (dados) => dados.entryPoint === "js/main.js");
  const grafico = saida(js, (dados) => dados.entryPoint === "js/vendor/chart.esm.js");
  const estilos = saida(css, () => true);

  // 3. HTML: aponta para os arquivos gerados e minifica
  const origemHtml = (await readFile(join(RAIZ, "html", "index.html"), "utf8")).replace(/\r\n/g, "\n");
  let html = origemHtml;
  html = substituir(html, '<link rel="stylesheet" href="../css/reset.css">\n  <link rel="stylesheet" href="../css/style.css">',
    `<link rel="stylesheet" href="assets/${estilos.nome}">`);
  html = substituir(html, '<script type="module" src="../js/main.js"></script>', `<script type="module" src="assets/${main.nome}"></script>`);
  html = substituir(html, '"../imagens/', '"imagens/', 3);
  html = substituir(html, "acesse <code>/html/index.html</code>", "acesse <code>/index.html</code>");
  if (html.includes("../")) {
    throw new Error("Build: o index.html ainda tem caminhos com ../");
  }
  html = await minify(html, OPCOES_HTML);
  await writeFile(join(DIST, "index.html"), html);

  // 4. Imagens otimizadas (só os arquivos da pasta imagens/, sem os originais)
  await mkdir(join(DIST, "imagens"));
  const imagens = (await readdir(join(RAIZ, "imagens"), { withFileTypes: true })).filter((item) => item.isFile());
  let bytesImagens = 0;
  for (const { name } of imagens) {
    await copyFile(join(RAIZ, "imagens", name), join(DIST, "imagens", name));
    bytesImagens += (await stat(join(RAIZ, "imagens", name))).size;
  }

  const lerSaida = (nome) => readFile(join(ASSETS, nome));
  const relatorio = [
    { arquivo: "index.html", origem: "html/index.html", original: Buffer.byteLength(origemHtml), conteudo: Buffer.from(html) },
    { arquivo: `assets/${estilos.nome}`, origem: "css/reset.css + css/style.css", original: tamanhoDasOrigens(css, estilos.info), conteudo: await lerSaida(estilos.nome) },
    { arquivo: `assets/${main.nome}`, origem: `js/main.js + ${Object.keys(main.info.inputs).length - 1} módulos`, original: tamanhoDasOrigens(js, main.info), conteudo: await lerSaida(main.nome) },
    { arquivo: `assets/${grafico.nome}`, origem: "js/vendor/chart.esm.js (já minificado)", original: tamanhoDasOrigens(js, grafico.info), conteudo: await lerSaida(grafico.nome) }
  ].map((item) => ({ ...item, final: item.conteudo.length, gzip: gzipSync(item.conteudo, { level: 9 }).length }));

  return { relatorio, imagens: { quantidade: imagens.length, bytes: bytesImagens } };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
const reducao = (original, final) => `${Math.round((1 - final / original) * 100)}%`;

function imprimir({ relatorio, imagens }) {
  const largura = Math.max(...relatorio.map((item) => item.arquivo.length));
  console.log("Build de produção gerado em dist/\n");
  console.log(`  ${"Arquivo".padEnd(largura)}  ${"Original".padStart(9)}  ${"Minificado".padStart(10)}  ${"Redução".padStart(7)}  ${"Com gzip".padStart(9)}  Origem`);
  for (const item of relatorio) {
    console.log(`  ${item.arquivo.padEnd(largura)}  ${kb(item.original).padStart(9)}  ${kb(item.final).padStart(10)}  ${reducao(item.original, item.final).padStart(7)}  ${kb(item.gzip).padStart(9)}  ${item.origem}`);
  }
  const proprios = relatorio.filter((item) => !item.origem.includes("já minificado"));
  const original = proprios.reduce((total, item) => total + item.original, 0);
  const final = proprios.reduce((total, item) => total + item.final, 0);
  const gzip = proprios.reduce((total, item) => total + item.gzip, 0);
  console.log(`\n  HTML, CSS e JS do projeto: ${kb(original)} → ${kb(final)} minificados (-${reducao(original, final)}) e ${kb(gzip)} com gzip (-${reducao(original, gzip)}).`);
  console.log(`  Imagens: ${imagens.quantidade} arquivos otimizados copiados (${kb(imagens.bytes)}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  imprimir(await construir());
}
