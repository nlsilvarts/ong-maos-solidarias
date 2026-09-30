/*
 * Ponto de entrada da aplicação (carregado como módulo em html/index.html).
 * Importa os módulos e inicia cada parte da interface.
 */
import { iniciarMenu } from "./modules/menu.js";
import { iniciarFeedback } from "./modules/feedback.js";
import { iniciarMascaras } from "./modules/mascaras.js";
import { iniciarRoteador } from "./modules/router.js";

iniciarMenu();
iniciarFeedback();
iniciarMascaras();
iniciarRoteador(document.getElementById("conteudo"));
