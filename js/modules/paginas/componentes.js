/*
 * Guia de componentes (uso interno da equipe, fora do menu): #/componentes
 * Os exemplos são gerados pelos mesmos templates usados nas páginas.
 */
import { listaBadges, alerta, blocoCodigo } from "../templates.js";

export default {
  titulo: "Guia de componentes",

  render() {
    return `
      <h1>Guia de componentes</h1>
      <p>Esta página reúne os componentes de feedback do site, com as classes CSS e os templates JavaScript prontos para reutilização. Todas as cores vêm das variáveis do Design System.</p>

      <section id="guia-badges">
        <h2>Badges (etiquetas)</h2>
        <h3>Categorias: fundo claro</h3>
        ${listaBadges([
          { texto: "Meio ambiente", tipo: "primaria" },
          { texto: "Alimentação", tipo: "secundaria" },
          { texto: "Educação", tipo: "info" },
          { texto: "Comunicação", tipo: "neutra" }
        ], "Exemplos de categoria")}
        <h3>Status: fundo sólido</h3>
        ${listaBadges([
          { texto: "Em andamento", tipo: "sucesso" },
          { texto: "Vagas abertas", tipo: "aviso" },
          { texto: "Urgente", tipo: "erro" },
          { texto: "Permanente", tipo: "neutra" }
        ], "Exemplos de status")}
        ${blocoCodigo(`
listaBadges([
  { texto: "Educação", tipo: "info" },
  { texto: "Em andamento", tipo: "sucesso" }
], "Etiquetas do projeto");`)}
      </section>

      <section id="guia-alertas">
        <h2>Alertas</h2>
        ${alerta({ tipo: "info", titulo: "Informação", texto: "As inscrições para o reforço escolar abrem em novembro." })}
        ${alerta({ tipo: "sucesso", titulo: "Doação registrada", texto: "Recebemos sua doação. O recibo foi enviado para o seu e-mail." })}
        ${alerta({ tipo: "aviso", titulo: "Atenção", texto: "A Campanha do Agasalho termina em 15 de outubro.", fechavel: true })}
        ${alerta({ tipo: "erro", titulo: "Não foi possível enviar o cadastro", texto: "3 campos precisam de atenção. Corrija os campos destacados em vermelho.", fechavel: true })}
        ${blocoCodigo(`
alerta({
  tipo: "aviso",            // info, sucesso, aviso ou erro
  titulo: "Atenção",
  texto: "Texto do alerta.",
  fechavel: true
});`)}
        <p>Para mensagens que aparecem depois de uma ação, como erros de envio, use <code>papel: "alert"</code> para que o leitor de tela anuncie o alerta.</p>
      </section>

      <section id="guia-toasts">
        <h2>Toasts (notificações)</h2>
        <p>Aparecem no canto inferior da tela, são anunciados por leitores de tela e somem sozinhos após 5 segundos. O tempo para enquanto o mouse ou o foco estiverem sobre eles.</p>
        <div class="acoes">
          <button type="button" class="botao botao-pequeno" data-toast="Suas preferências foram salvas." data-toast-tipo="info">Toast de informação</button>
          <button type="button" class="botao botao-pequeno" data-toast="Chave PIX copiada!" data-toast-tipo="sucesso">Toast de sucesso</button>
          <button type="button" class="botao botao-pequeno" data-toast="Sua sessão expira em 5 minutos." data-toast-tipo="aviso">Toast de aviso</button>
          <button type="button" class="botao botao-pequeno" data-toast="Sem conexão. Tente novamente." data-toast-tipo="erro">Toast de erro</button>
        </div>
        ${blocoCodigo(`
<button type="button" data-toast="Chave PIX copiada!" data-toast-tipo="sucesso">Copiar</button>

// ou pelo JavaScript:
import { mostrarToast } from "./modules/feedback.js";
mostrarToast("Chave PIX copiada!", "sucesso");`)}
      </section>

      <section id="guia-modal">
        <h2>Modal</h2>
        <p>Usa o elemento nativo <code>&lt;dialog&gt;</code>, que prende o foco dentro da janela, fecha com a tecla Esc e escurece o fundo.</p>
        <p><button type="button" class="botao" data-abrir-modal="modal-exemplo">Abrir modal de exemplo</button></p>
        <dialog class="modal modal-erro" id="modal-exemplo" aria-labelledby="modal-exemplo-titulo" aria-describedby="modal-exemplo-texto">
          <form method="dialog">
            <button class="botao-fechar" aria-label="Fechar">×</button>
            <span class="icone-feedback icone-grande" aria-hidden="true">!</span>
            <h2 id="modal-exemplo-titulo">Cancelar inscrição?</h2>
            <p id="modal-exemplo-texto">Você deixará de receber avisos sobre as ações de voluntariado.</p>
            <div class="modal-acoes">
              <button class="botao botao-secundario" value="voltar" autofocus>Voltar</button>
              <button class="botao" value="confirmar">Sim, cancelar</button>
            </div>
          </form>
        </dialog>
        ${blocoCodigo(`
<button type="button" data-abrir-modal="meu-modal">Abrir</button>

<dialog class="modal modal-sucesso" id="meu-modal" aria-labelledby="meu-modal-titulo">
  <form method="dialog">
    <button class="botao-fechar" aria-label="Fechar">×</button>
    <span class="icone-feedback icone-grande" aria-hidden="true">✓</span>
    <h2 id="meu-modal-titulo">Título</h2>
    <p>Mensagem.</p>
    <div class="modal-acoes"><button class="botao">Entendi</button></div>
  </form>
</dialog>`)}
      </section>`;
  }
};
