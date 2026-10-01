/*
 * Servidor local para desenvolvimento e testes, sem dependências (só Node.js).
 *
 * Uso: npm start   (ou: node ferramentas/servidor.js)
 * Porta: 8080, ou a definida na variável de ambiente PORT.
 *
 * O site usa módulos JavaScript (import/export), que os navegadores bloqueiam
 * quando o arquivo é aberto direto do disco (file://). Por isso o projeto
 * precisa ser aberto por um servidor HTTP. Os testes de ponta a ponta
 * (playwright.config.js) também iniciam este servidor.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORTA = Number(process.env.PORT) || 8080;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

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

  // A raiz leva à página da aplicação
  if (caminho === "/") {
    resposta.writeHead(302, { Location: "/html/index.html" });
    return resposta.end();
  }

  // Não serve arquivos ocultos (.git, .gitignore) nem caminhos fora da pasta do projeto
  const arquivo = normalize(join(RAIZ, caminho));
  if (!arquivo.startsWith(RAIZ + sep) || caminho.split("/").some((parte) => parte.startsWith("."))) {
    return responder(resposta, 404, "Arquivo não encontrado");
  }

  try {
    const conteudo = await readFile(arquivo);
    resposta.writeHead(200, { "Content-Type": TIPOS[extname(arquivo).toLowerCase()] || "application/octet-stream" });
    resposta.end(conteudo);
  } catch {
    responder(resposta, 404, "Arquivo não encontrado");
  }
});

servidor.listen(PORTA, () => {
  console.log(`ONG Mãos Solidárias em http://localhost:${PORTA}/html/index.html`);
  console.log("Pressione Ctrl+C para encerrar.");
});
