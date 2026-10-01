/*
 * Otimização das imagens do site com o sharp (biblioteca libvips).
 *
 * Uso: npm run imagens   (ou: node ferramentas/imagens.js)
 *
 * Os originais ficam em imagens/originais/ e não vão para o site. O script
 * grava em imagens/ as versões usadas pelas páginas, no mesmo tamanho em que
 * aparecem (400×260 nos cartões, 800×450 na página inicial e 120×120 no
 * logotipo), sem metadados (EXIF e perfis de cor são descartados):
 *   - ilustrações (originais em JPG): JPG progressivo com o codificador
 *     mozjpeg (qualidade 75), WebP (qualidade 75) e AVIF (qualidade 50).
 *     O elemento <picture> deixa o navegador escolher o formato mais leve
 *     que ele aceita;
 *   - logotipo (original em PNG, com transparência): PNG com paleta de até
 *     256 cores e WebP sem perdas feito a partir dessa paleta. O AVIF não
 *     compensa nesse caso, porque ficava maior que o WebP.
 *
 * O script sempre parte dos originais, então pode ser rodado de novo sem
 * perder qualidade. As versões geradas são versionadas no Git, para o site
 * funcionar sem instalar nada (o build de produção só as copia).
 */
import sharp from "sharp";
import { readdir, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
export const PASTA_ORIGINAIS = join(RAIZ, "imagens", "originais");
export const PASTA_IMAGENS = join(RAIZ, "imagens");

const paleta = (arquivo) => sharp(arquivo).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 });

/* Versões geradas para cada tipo de original: extensão do arquivo e conversão */
export const VERSOES = {
  ".jpg": [
    { formato: "jpg", gerar: (arquivo) => sharp(arquivo).jpeg({ quality: 75, mozjpeg: true }).toBuffer() },
    { formato: "webp", gerar: (arquivo) => sharp(arquivo).webp({ quality: 75, effort: 6 }).toBuffer() },
    { formato: "avif", gerar: (arquivo) => sharp(arquivo).avif({ quality: 50, effort: 6 }).toBuffer() }
  ],
  ".png": [
    { formato: "png", gerar: (arquivo) => paleta(arquivo).toBuffer() },
    { formato: "webp", gerar: async (arquivo) => sharp(await paleta(arquivo).toBuffer()).webp({ lossless: true, effort: 6 }).toBuffer() }
  ]
};

/* Originais encontrados em imagens/originais/: [{ nome, extensao, caminho }] */
export async function listarOriginais() {
  const arquivos = (await readdir(PASTA_ORIGINAIS)).sort();
  return arquivos
    .filter((arquivo) => VERSOES[extname(arquivo).toLowerCase()])
    .map((arquivo) => {
      const extensao = extname(arquivo).toLowerCase();
      return { nome: arquivo.slice(0, -extensao.length), extensao, caminho: join(PASTA_ORIGINAIS, arquivo) };
    });
}

export function kb(bytes) {
  return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
}

function reducao(original, final) {
  return `${Math.round((1 - final / original) * 100)}%`;
}

async function otimizar() {
  const linhas = [];
  for (const original of await listarOriginais()) {
    const tamanhoOriginal = (await stat(original.caminho)).size;
    const versoes = [];
    for (const versao of VERSOES[original.extensao]) {
      const conteudo = await versao.gerar(original.caminho);
      await writeFile(join(PASTA_IMAGENS, `${original.nome}.${versao.formato}`), conteudo);
      versoes.push(`${versao.formato.toUpperCase()} ${kb(conteudo.length)} (-${reducao(tamanhoOriginal, conteudo.length)})`);
    }
    linhas.push(`  ${`${original.nome}${original.extensao}`.padEnd(26)} ${kb(tamanhoOriginal).padStart(8)}  →  ${versoes.join("  ")}`);
  }
  console.log("Imagens otimizadas (original → versões em imagens/):");
  console.log(linhas.join("\n"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await otimizar();
}
