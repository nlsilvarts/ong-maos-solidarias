/*
 * Servidor local para desenvolvimento, testes e conferência do build, sem
 * dependências (só Node.js).
 *
 * Uso: npm start         serve o projeto (página em /html/index.html)
 *      npm run preview   serve a pasta dist/, gerada por npm run build (página em /)
 *      (ou: node ferramentas/servidor.js [pasta])
 * Porta: 8080, ou a definida na variável de ambiente PORT.
 * Prefixo: com PREFIXO=/ong-maos-solidarias/, o site fica em um subcaminho, como
 * no GitHub Pages (usuario.github.io/ong-maos-solidarias/). Os testes do build
 * usam esse modo para conferir que nenhum endereço depende da raiz do domínio.
 * Compressão: HTML, CSS, JS e mapas saem comprimidos com gzip quando o navegador
 * aceita, também como no GitHub Pages. Assim, medições de desempenho feitas no
 * preview (Lighthouse, aba Rede do DevTools) refletem o site publicado.
 *
 * O site usa módulos JavaScript (import/export), que os navegadores bloqueiam
 * quando o arquivo é aberto direto do disco (file://). Por isso o projeto
 * precisa ser aberto por um servidor HTTP. Os testes de ponta a ponta
 * (playwright.config.js) também iniciam este servidor.
 */
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PROJETO = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PASTA = process.argv[2];
// Pasta servida: a do projeto ou a indicada na linha de comando (por exemplo, dist)
const RAIZ = resolve(PROJETO, PASTA ?? ".");
// No projeto, a página fica em html/; no build de produção, na raiz da pasta
const PAGINA = existsSync(join(RAIZ, "html", "index.html")) ? "/html/index.html" : "/";
const PORTA = Number(process.env.PORT) || 8080;
const PREFIXO = process.env.PREFIXO || "/";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon"
};

const COMPRIMIVEIS = /^(text\/|application\/json|image\/svg)/;

function responder(resposta, status, texto) {
  resposta.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  resposta.end(texto);
}

const servidor = createServer(async (requisicao, resposta) => {
  let caminho;
  try {
    caminho = decodeURIComponent(new URL(requisicao.url, "http://localhost").pathname);
  } catch {
    return responder(resposta, 400, "Endereço inválido");
  }

  // Com prefixo, só os endereços dentro dele existem (e o prefixo sem a barra final ganha a barra)
  if (PREFIXO !== "/") {
    if (`${caminho}/` === PREFIXO) {
      resposta.writeHead(301, { Location: PREFIXO });
      return resposta.end();
    }
    if (!caminho.startsWith(PREFIXO)) {
      return responder(resposta, 404, "Arquivo não encontrado");
    }
    caminho = caminho.slice(PREFIXO.length - 1);
  }

  // No projeto, a raiz leva à página da aplicação; no build, cada pasta serve o seu index.html
  if (caminho === "/" && PAGINA !== "/") {
    resposta.writeHead(302, { Location: PREFIXO + PAGINA.slice(1) });
    return resposta.end();
  }
  if (caminho.endsWith("/")) {
    caminho += "index.html";
  }

  // Não serve arquivos ocultos (.git, .gitignore) nem caminhos fora da pasta do projeto
  const arquivo = normalize(join(RAIZ, caminho));
  if (!arquivo.startsWith(RAIZ + sep) || caminho.split("/").some((parte) => parte.startsWith("."))) {
    return responder(resposta, 404, "Arquivo não encontrado");
  }

  try {
    let conteudo = await readFile(arquivo);
    const tipo = TIPOS[extname(arquivo).toLowerCase()] || "application/octet-stream";
    const cabecalhos = { "Content-Type": tipo, Vary: "Accept-Encoding" };
    if (COMPRIMIVEIS.test(tipo) && /\bgzip\b/.test(requisicao.headers["accept-encoding"] ?? "")) {
      conteudo = gzipSync(conteudo);
      cabecalhos["Content-Encoding"] = "gzip";
    }
    resposta.writeHead(200, cabecalhos);
    resposta.end(conteudo);
  } catch {
    responder(resposta, 404, "Arquivo não encontrado");
  }
});

servidor.listen(PORTA, () => {
  if (!existsSync(RAIZ)) {
    console.warn(`A pasta ${PASTA} não existe. Gere o build antes, com: npm run build`);
  }
  console.log(`ONG Mãos Solidárias em http://localhost:${PORTA}${PREFIXO}${PAGINA.slice(1)}${PASTA ? ` (pasta ${PASTA})` : ""}`);
  console.log("Pressione Ctrl+C para encerrar.");
});
