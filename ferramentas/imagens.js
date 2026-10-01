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
 * A imagem que muda muito de tamanho conforme a tela também ganha versões
 * mais estreitas (LARGURAS_MENORES), usadas pelo srcset/sizes do <picture>.
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

/* Abre o original, reduzido para a largura pedida (sem largura, no tamanho original) */
const abrir = (arquivo, largura) => (largura ? sharp(arquivo).resize({ width: largura }) : sharp(arquivo));
const paleta = (arquivo, largura) => abrir(arquivo, largura).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 });

/* Versões geradas para cada tipo de original: extensão do arquivo e conversão */
export const VERSOES = {
  ".jpg": [
    { formato: "jpg", gerar: (arquivo, largura) => abrir(arquivo, largura).jpeg({ quality: 75, mozjpeg: true }).toBuffer() },
    { formato: "webp", gerar: (arquivo, largura) => abrir(arquivo, largura).webp({ quality: 75, effort: 6 }).toBuffer() },
    { formato: "avif", gerar: (arquivo, largura) => abrir(arquivo, largura).avif({ quality: 50, effort: 6 }).toBuffer() }
  ],
  ".png": [
    { formato: "png", gerar: (arquivo, largura) => paleta(arquivo, largura).toBuffer() },
    { formato: "webp", gerar: async (arquivo, largura) => sharp(await paleta(arquivo, largura).toBuffer()).webp({ lossless: true, effort: 6 }).toBuffer() }
  ]
};

/* Larguras menores, além do tamanho original, para a imagem que muda muito de tamanho
   conforme a tela. A ilustração da página inicial (800 px) ocupa de 288 a 800 px de
   largura: num celular com tela comum (1x), a versão de 400 px já fica nítida. Os
   cartões (400 px) e o logotipo (120 px) não precisam: nunca aparecem maiores que o
   original, e o logotipo, exibido com 56 a 72 px, já tem resolução para telas 2x */
export const LARGURAS_MENORES = {
  voluntarios: [400]
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
    for (const largura of [undefined, ...(LARGURAS_MENORES[original.nome] ?? [])]) {
      const sufixo = largura ? `-${largura}` : "";
      const versoes = [];
      for (const versao of VERSOES[original.extensao]) {
        const conteudo = await versao.gerar(original.caminho, largura);
        await writeFile(join(PASTA_IMAGENS, `${original.nome}${sufixo}.${versao.formato}`), conteudo);
        versoes.push(`${versao.formato.toUpperCase()} ${kb(conteudo.length)} (-${reducao(tamanhoOriginal, conteudo.length)})`);
      }
      const rotulo = largura ? `  ${original.nome}${sufixo} (${largura} px)` : `${original.nome}${original.extensao}`;
      linhas.push(`  ${rotulo.padEnd(26)} ${(largura ? "" : kb(tamanhoOriginal)).padStart(8)}  →  ${versoes.join("  ")}`);
    }
  }
  console.log("Imagens otimizadas (original → versões em imagens/):");
  console.log(linhas.join("\n"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await otimizar();
}
