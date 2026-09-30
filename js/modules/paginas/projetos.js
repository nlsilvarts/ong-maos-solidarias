/*
 * Página de projetos: frentes de atuação, projetos, voluntariado,
 * campanhas de doação e formas de doar.
 */
import { projetos, campanhas, areasVoluntariado } from "../dados.js";
import { cartaoProjeto, cartaoCampanha, alerta, escapar } from "../templates.js";

export default {
  titulo: "Projetos",

  render() {
    const cartoesProjetos = projetos
      .map((projeto) => cartaoProjeto(projeto, { completo: true, colunas: "col-12 col-sm-6 col-lg-4" }))
      .join("");

    const areas = areasVoluntariado
      .map(({ area, detalhe }) => `<li><strong>${escapar(area)}:</strong> ${escapar(detalhe)}</li>`)
      .join("");

    return `
      <h1>Projetos sociais</h1>

      <section id="frentes-de-atuacao">
        <h2>Nossas frentes de atuação</h2>
        <p>A ONG Mãos Solidárias atua em três frentes: <strong>educação</strong>, <strong>segurança alimentar</strong> e <strong>meio ambiente</strong>. Você pode contribuir doando seu tempo como voluntário ou apoiando nossas campanhas de arrecadação.</p>
        <p><a href="#/projetos/voluntariado">Quero ser voluntário</a> | <a href="#/projetos/campanhas">Quero doar</a></p>
      </section>

      <section id="projetos-em-andamento">
        <h2>Projetos em andamento</h2>
        <div class="grid-12">${cartoesProjetos}</div>
      </section>

      <section id="voluntariado">
        <h2>Como ser voluntário</h2>
        <ol>
          <li>Preencha o formulário na página de <a href="#/cadastro">cadastro</a>, escolhendo a opção "Voluntário".</li>
          <li>Aguarde o contato da nossa equipe em até 5 dias úteis.</li>
          <li>Participe de uma conversa de acolhimento e da capacitação inicial.</li>
          <li>Escolha a área e os horários em que deseja atuar.</li>
        </ol>
        <article>
          <h3>Áreas de voluntariado disponíveis</h3>
          <ul>${areas}</ul>
        </article>
        <p><a class="botao" href="#/cadastro">Quero ser voluntário</a></p>
      </section>

      <section id="campanhas">
        <h2>Campanhas de doação</h2>
        ${alerta({
          tipo: "aviso",
          titulo: "Últimos dias da Campanha do Agasalho",
          texto: "As doações de roupas e cobertores podem ser entregues na sede até 15 de outubro.",
          fechavel: true
        })}
        <div class="grid-12">${campanhas.map(cartaoCampanha).join("")}</div>
      </section>

      <section id="formas-de-doar" class="destaque">
        <h2>Formas de doar</h2>
        <ul>
          <li>
            <strong>PIX:</strong> chave CNPJ <span id="chave-pix">00.000.000/0001-00</span>
            <button type="button" class="botao botao-pequeno" data-copiar="#chave-pix" data-copiar-mensagem="Chave PIX copiada! Agora é só colar no app do seu banco.">Copiar chave</button>
          </li>
          <li><strong>Transferência:</strong> Banco Exemplo, agência 0001, conta 12345-6</li>
          <li><strong>Doação presencial:</strong> alimentos, roupas e materiais na sede</li>
        </ul>
        <address>
          <strong>Local de entrega:</strong> Rua da Esperança, 123 – Centro, São Paulo – SP<br>
          <strong>Horário:</strong> segunda a sexta, das 9h às 17h
        </address>
      </section>`;
  }
};
