/*
 * Página exibida quando o endereço não corresponde a nenhuma rota.
 */
import { alerta } from "../templates.js";

export default {
  titulo: "Página não encontrada",

  render() {
    return `
      <h1>Página não encontrada</h1>
      ${alerta({
        tipo: "aviso",
        titulo: "Não encontramos esta página",
        texto: "O endereço pode ter sido digitado errado ou a página mudou de lugar."
      })}
      <p><a class="botao" href="#/inicio">Voltar para o início</a></p>`;
  }
};
