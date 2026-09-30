/*
 * Página de cadastro: formulário com validação nativa do HTML5,
 * alertas de feedback e modal de confirmação.
 */
import { estados } from "../dados.js";
import { alerta } from "../templates.js";
import { iniciarFormulario } from "../formulario.js";
import { dataLimite, IDADE_MINIMA, IDADE_MAXIMA } from "../validacao.js";

/* Template de campo de texto: rótulo, input e dica opcional.
   Atenção: dentro de template literals, a barra do pattern precisa ser dupla (\\d). */
function campo({ id, rotulo, tipo = "text", colunas = "col-12 col-md-6 col-xl-4", obrigatorio = true, atributos = "", dica = "" }) {
  const idDica = dica ? `dica-${id}` : "";
  return `
    <div class="campo ${colunas}">
      <label for="${id}">${rotulo}${obrigatorio ? ' <span class="obrigatorio">*</span>' : ""}</label>
      <input type="${tipo}" id="${id}" name="${id}"${obrigatorio ? " required" : ""} ${atributos}${idDica ? ` aria-describedby="${idDica}"` : ""}>
      ${dica ? `<span class="dica" id="${idDica}">${dica}</span>` : ""}
    </div>`;
}

/* Template de opção (rádio ou checkbox) */
function opcao({ tipo, nome, valor, rotulo, obrigatorio = false }) {
  const id = `${nome}-${valor}`;
  return `
    <label for="${id}">
      <input type="${tipo}" id="${id}" name="${nome}" value="${valor}"${obrigatorio ? " required" : ""}>
      ${rotulo}
    </label>`;
}

export default {
  titulo: "Cadastro",

  render() {
    const opcoesEstado = estados
      .map(([sigla, nome]) => `<option value="${sigla}">${nome}</option>`)
      .join("");

    return `
      <h1>Cadastro de voluntários e doadores</h1>
      <p>Preencha os dados abaixo para fazer parte da nossa rede. Os campos marcados com <span class="obrigatorio">*</span> são obrigatórios.</p>

      ${alerta({
        tipo: "info",
        titulo: "Seus dados estão protegidos",
        texto: "Usamos suas informações apenas para entrar em contato sobre voluntariado e doações, conforme a LGPD."
      })}

      ${alerta({
        tipo: "erro",
        titulo: "Não foi possível enviar o cadastro",
        texto: "Corrija os campos destacados em vermelho e tente novamente.",
        fechavel: true,
        id: "alerta-erro",
        papel: "alert",
        oculto: true
      })}

      <!-- novalidate: a verificação e as mensagens ficam com o JavaScript (formulario.js);
           os atributos required, pattern, min e max continuam documentando as regras -->
      <form id="form-cadastro" method="post" novalidate>

        <fieldset>
          <legend>Dados pessoais</legend>
          <div class="grid-12">
            ${campo({ id: "nome", rotulo: "Nome completo", colunas: "col-12", atributos: 'minlength="5" maxlength="100" autocomplete="name" placeholder="Ex.: Maria da Silva Souza"' })}
            ${campo({ id: "email", rotulo: "E-mail", tipo: "email", atributos: 'maxlength="100" autocomplete="email" placeholder="nome@exemplo.com"' })}
            ${campo({ id: "cpf", rotulo: "CPF", dica: "Formato: 000.000.000-00", atributos: 'pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" maxlength="14" inputmode="numeric" placeholder="000.000.000-00" title="Digite o CPF no formato 000.000.000-00" data-mascara="cpf"' })}
            ${campo({ id: "nascimento", rotulo: "Data de nascimento", tipo: "date", dica: "É preciso ter pelo menos 16 anos.", atributos: `min="${dataLimite(IDADE_MAXIMA)}" max="${dataLimite(IDADE_MINIMA)}" autocomplete="bday"` })}
            ${campo({ id: "telefone", rotulo: "Telefone", tipo: "tel", dica: "Formato: (00) 00000-0000", atributos: 'pattern="\\(\\d{2}\\) \\d{4,5}-\\d{4}" maxlength="15" autocomplete="tel" placeholder="(00) 00000-0000" title="Digite o telefone no formato (00) 00000-0000 ou (00) 0000-0000" data-mascara="telefone"' })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Endereço</legend>
          <div class="grid-12">
            ${campo({ id: "cep", rotulo: "CEP", dica: "Formato: 00000-000", atributos: 'pattern="\\d{5}-\\d{3}" maxlength="9" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" title="Digite o CEP no formato 00000-000" data-mascara="cep"' })}
            ${campo({ id: "endereco", rotulo: "Endereço (rua, avenida)", colunas: "col-12", atributos: 'maxlength="120" autocomplete="address-line1" placeholder="Ex.: Rua da Esperança"' })}
            ${campo({ id: "numero", rotulo: "Número", atributos: 'maxlength="10" inputmode="numeric" placeholder="Ex.: 123 ou S/N"' })}
            ${campo({ id: "complemento", rotulo: "Complemento", obrigatorio: false, atributos: 'maxlength="60" autocomplete="address-line2" placeholder="Ex.: apto 12, bloco B"' })}
            ${campo({ id: "bairro", rotulo: "Bairro", atributos: 'maxlength="60" autocomplete="address-level3"' })}
            ${campo({ id: "cidade", rotulo: "Cidade", atributos: 'maxlength="60" autocomplete="address-level2"' })}
            <div class="campo col-12 col-md-6 col-xl-4">
              <label for="estado">Estado <span class="obrigatorio">*</span></label>
              <select id="estado" name="estado" required autocomplete="address-level1">
                <option value="">Selecione</option>
                ${opcoesEstado}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Forma de participação</legend>

          <fieldset>
            <legend>Como deseja participar? <span class="obrigatorio">*</span></legend>
            <div class="opcoes">
              ${opcao({ tipo: "radio", nome: "participacao", valor: "voluntario", rotulo: "Voluntário", obrigatorio: true })}
              ${opcao({ tipo: "radio", nome: "participacao", valor: "doador", rotulo: "Doador" })}
              ${opcao({ tipo: "radio", nome: "participacao", valor: "ambos", rotulo: "Voluntário e doador" })}
            </div>
          </fieldset>

          <fieldset>
            <legend>Áreas de interesse</legend>
            <div class="opcoes">
              ${opcao({ tipo: "checkbox", nome: "areas", valor: "educacao", rotulo: "Educação" })}
              ${opcao({ tipo: "checkbox", nome: "areas", valor: "alimentacao", rotulo: "Alimentação" })}
              ${opcao({ tipo: "checkbox", nome: "areas", valor: "meio-ambiente", rotulo: "Meio ambiente" })}
              ${opcao({ tipo: "checkbox", nome: "areas", valor: "comunicacao", rotulo: "Comunicação" })}
            </div>
          </fieldset>

          <div class="campo">
            <label for="mensagem">Conte um pouco sobre você (opcional)</label>
            <textarea id="mensagem" name="mensagem" rows="4" maxlength="500"></textarea>
          </div>
        </fieldset>

        <fieldset>
          <legend>Consentimento</legend>
          <div class="opcoes">
            <label for="aceite">
              <input type="checkbox" id="aceite" name="aceite" value="sim" required>
              <span>Autorizo o uso dos meus dados pela ONG Mãos Solidárias, conforme a Lei Geral de Proteção de Dados (LGPD). <span class="obrigatorio">*</span></span>
            </label>
          </div>
        </fieldset>

        <p class="dica" id="dica-envio">Para enviar, é preciso aceitar o uso dos dados conforme a LGPD.</p>
        <div class="acoes">
          <button type="submit" class="botao" aria-describedby="dica-envio" disabled>Enviar cadastro</button>
          <button type="reset" class="botao botao-secundario">Limpar campos</button>
        </div>
      </form>

      <dialog class="modal modal-sucesso" id="modal-cadastro" aria-labelledby="modal-cadastro-titulo" aria-describedby="modal-cadastro-texto">
        <form method="dialog">
          <button class="botao-fechar" aria-label="Fechar">×</button>
          <span class="icone-feedback icone-grande" aria-hidden="true">✓</span>
          <h2 id="modal-cadastro-titulo">Cadastro recebido!</h2>
          <p id="modal-cadastro-texto">Obrigado, <span id="modal-cadastro-nome">voluntário</span>! Nossa equipe entrará em contato em até 5 dias úteis.</p>
          <div class="modal-acoes">
            <button class="botao" autofocus>Entendi</button>
          </div>
        </form>
      </dialog>`;
  },

  // Chamado pelo roteador depois que o HTML da página entra no <main>
  iniciar(raiz) {
    iniciarFormulario(raiz.querySelector("#form-cadastro"));
  }
};
