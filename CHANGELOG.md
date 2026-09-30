# Changelog

Todas as mudanças importantes do projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-09-30

### Adicionado
- SPA com roteador por hash (`#/inicio`, `#/projetos`, `#/cadastro`), títulos de aba e foco
  gerenciados a cada troca de página.
- Design System em variáveis CSS, Grid de 12 colunas com cinco breakpoints e menu responsivo
  com dropdown e menu hambúrguer.
- Templates reutilizáveis (cartões, badges, alertas) alimentados por `dados.js`.
- Componentes de feedback (toasts, alertas, modais) e guia de componentes em `#/componentes`.
- Formulário de cadastro com máscaras e verificação de consistência em tempo real
  (RegEx, dígitos do CPF, idade mínima, DDD) e resumo de erros com links para os campos.
- Persistência no localStorage: preferência de texto maior, rascunho do cadastro (sem CPF)
  e histórico de envios.
- Gráfico de arrecadação das campanhas com Chart.js 4.5.1, empacotado localmente com esbuild.

### Alterado
- Formulário dividido em módulos com responsabilidade única (`campos.js`, `resumo-erros.js`
  e o controlador `formulario.js`).

[1.0.0]: https://github.com/SEU-USUARIO/ong-maos-solidarias/releases/tag/v1.0.0
