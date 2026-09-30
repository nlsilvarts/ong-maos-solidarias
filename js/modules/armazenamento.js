/*
 * Acesso ao localStorage.
 *
 * O localStorage só guarda texto. Por isso:
 * - salvar() converte objetos e arrays em string com JSON.stringify;
 * - ler() faz o caminho inverso com JSON.parse e confere se a estrutura
 *   recebida é a esperada antes de devolvê-la.
 * Se o valor não existir, estiver corrompido ou o navegador bloquear o
 * armazenamento (modo privado, cota cheia), a aplicação continua
 * funcionando com o valor padrão.
 */

// Prefixo evita conflito com dados de outros sites servidos no mesmo endereço (ex.: localhost)
const PREFIXO = "ong-maos-solidarias:";

export const CHAVES = {
  preferencias: "preferencias",     // objeto { textoGrande: boolean }
  rascunho: "rascunho-cadastro",    // objeto { campos: {...}, areas: [...], salvoEm: "data ISO" }
  historico: "cadastros-enviados"   // array [{ primeiroNome, participacao, enviadoEm }]
};

export function ler(chave, padrao, estruturaValida = () => true) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave); // string ou null
    if (texto === null) {
      return padrao;
    }
    const valor = JSON.parse(texto); // string → objeto ou array
    return estruturaValida(valor) ? valor : padrao;
  } catch {
    return padrao; // JSON corrompido ou armazenamento indisponível
  }
}

export function salvar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor)); // objeto ou array → string
    return true;
  } catch {
    return false; // cota cheia ou armazenamento bloqueado
  }
}

export function remover(chave) {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch {
    // Sem acesso ao armazenamento, não há o que remover
  }
}

/* Confere se o valor é um objeto comum (e não null ou array) */
export function ehObjeto(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}
