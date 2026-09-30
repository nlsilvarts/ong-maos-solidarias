/*
 * Ponto de entrada da aplicação (carregado como módulo em html/index.html).
 * Importa os módulos e inicia cada parte da interface.
 */
import { iniciarPreferencias } from "./modules/preferencias.js";
import { iniciarMenu } from "./modules/menu.js";
import { iniciarFeedback } from "./modules/feedback.js";
import { iniciarMascaras } from "./modules/mascaras.js";
import { iniciarRoteador } from "./modules/router.js";

iniciarPreferencias();
iniciarMenu();
iniciarFeedback();
iniciarMascaras();
iniciarRoteador(document.getElementById("conteudo"));
