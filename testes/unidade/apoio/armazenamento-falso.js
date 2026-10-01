/*
 * localStorage em memória para os testes de unidade.
 *
 * O Node.js não tem localStorage (é uma API do navegador). Os testes instalam
 * esta versão simples, com os mesmos métodos usados por armazenamento.js.
 * Com { falhar: true }, todos os métodos lançam erro, como acontece quando o
 * navegador bloqueia o armazenamento ou a cota está cheia.
 */
export function instalarArmazenamentoFalso({ falhar = false } = {}) {
  const dados = new Map();
  const conferir = () => {
    if (falhar) {
      throw new Error("Armazenamento indisponível");
    }
  };

  const armazenamento = {
    getItem(chave) {
      conferir();
      return dados.has(chave) ? dados.get(chave) : null;
    },
    setItem(chave, valor) {
      conferir();
      dados.set(chave, String(valor)); // o localStorage só guarda texto
    },
    removeItem(chave) {
      conferir();
      dados.delete(chave);
    }
  };

  Object.defineProperty(globalThis, "localStorage", { value: armazenamento, configurable: true, writable: true });
  return dados; // permite conferir o texto gravado
}
