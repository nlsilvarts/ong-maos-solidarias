# Changelog

Todas as mudanças importantes do projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-09-30

### Adicionado
- Testes de unidade com o executor nativo do Node.js (`npm test`): regras de validação, máscaras,
  templates, dados das campanhas, localStorage e histórico de envios.
- Testes de ponta a ponta com Playwright (`npm run test:e2e`): navegação, cadastro, persistência e
  gráfico, incluindo o teste de regressão do defeito corrigido na versão 1.0.1.
- Servidor local sem dependências (`npm start`) e o script `npm run build`.
- `package-lock.json` com as versões exatas das dependências de desenvolvimento.

### Alterado
- README reorganizado: visão geral, tecnologias, pré-requisitos, instalação, execução, build,
  testes, arquitetura e acessibilidade.
- Links do CHANGELOG relativos ao repositório.

## [1.0.1] - 2026-09-30

### Corrigido
- Ao fechar o modal de confirmação do cadastro, o foco ia para o fim da página e o usuário de
  teclado era levado ao rodapé. Agora o foco vai para o título do histórico de envios.

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

[1.1.0]: ../../compare/v1.0.1...v1.1.0
[1.0.1]: ../../compare/v1.0.0...v1.0.1
[1.0.0]: ../../releases/tag/v1.0.0
