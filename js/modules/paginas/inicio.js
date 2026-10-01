/*
 * Página inicial: apresentação institucional, projetos em destaque e contato.
 */
import { projetos, institucional } from "../dados.js";
import { cartaoProjeto, cartaoTexto, imagem } from "../templates.js";

/* A ilustração ocupa toda a largura da coluna até 991 px de tela e 5 das 12 colunas a
   partir daí (medido no layout: de 288 a 800 px). O sizes repete essas larguras para o
   navegador escolher entre a versão de 400 px e a de 800 px */
export const fotoVoluntarios = {
  arquivo: "voluntarios",
  alt: "Ilustração de voluntários atrás de uma mesa entregando caixas de alimentos a duas pessoas",
  largura: 800,
  altura: 450,
  menores: [400],
  tamanhos: "(min-width: 1400px) 505px, (min-width: 1200px) 434px, (min-width: 992px) 38vw, (min-width: 576px) calc(100vw - 48px), calc(100vw - 32px)"
};

export default {
  titulo: "Início",

  render() {
    const destaques = projetos.filter((projeto) => projeto.destaque);

    return `
      <h1>Bem-vindo à ONG Mãos Solidárias</h1>

      <section id="quem-somos" class="grid-12">
        <div class="col-12 col-lg-7">
          <h2>Quem somos</h2>
          <p>Fundada em 2015, a ONG Mãos Solidárias atua no apoio a famílias em situação de vulnerabilidade social, promovendo ações de educação, alimentação e inclusão.</p>
          <p>Hoje, mais de 120 voluntários atendem cerca de 400 famílias por mês, sempre com transparência na aplicação dos recursos recebidos.</p>
          <p><a class="botao" href="#/cadastro">Quero participar</a></p>
        </div>
        <figure class="col-12 col-lg-5">
          ${imagem(fotoVoluntarios, { carregamento: "eager" })}
          <figcaption>Voluntários em ação durante a campanha de arrecadação de alimentos.</figcaption>
        </figure>
      </section>

      <section id="missao-visao-valores">
        <h2>Missão, visão e valores</h2>
        <div class="grid-12">
          ${institucional.map((item) => cartaoTexto(item)).join("")}
        </div>
      </section>

      <section id="nossos-projetos">
        <h2>Nossos projetos</h2>
        <div class="grid-12">
          ${destaques.map((projeto) => cartaoProjeto(projeto)).join("")}
        </div>
        <p><a href="#/projetos">Conheça todos os projetos</a></p>
      </section>

      <section id="contato" class="destaque">
        <h2>Contato</h2>
        <address>
          <p><strong>Endereço:</strong> Rua da Esperança, 123 – Centro, São Paulo – SP, CEP 01000-000</p>
          <p><strong>Telefone:</strong> <a href="tel:+551130000000">(11) 3000-0000</a></p>
          <p><strong>WhatsApp:</strong> <a href="https://wa.me/5511900000000">(11) 90000-0000</a></p>
          <p><strong>E-mail:</strong> <a href="mailto:contato@maossolidarias.org.br">contato@maossolidarias.org.br</a></p>
        </address>
        <p><strong>Horário de atendimento:</strong> segunda a sexta, das 9h às 17h</p>
      </section>`;
  }
};
