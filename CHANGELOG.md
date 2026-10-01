# Changelog

Todas as mudanças importantes do projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.3.2] - 2026-10-01

### Corrigido
- O rodapé aparecia logo abaixo do "Carregando…" e pulava quando o conteúdo da página chegava
  (CLS de 0,15 no celular e de 0,76 no computador, segundo o Lighthouse). O `<main>` passou a ter
  altura mínima de uma tela, e o CLS caiu para 0.

### Alterado
- O servidor local (`npm start` e `npm run preview`) comprime HTML, CSS e JS com gzip, como o
  GitHub Pages, para as medições de desempenho refletirem o site publicado.
- README com a medição do Lighthouse antes e depois da otimização: LCP 22% menor no celular, página
  52% mais leve e pontuação de desempenho 100.

## [1.3.1] - 2026-10-01

### Corrigido
- Em telas estreitas, o logotipo era achatado (30 × 56 px a 390 px de largura), porque o
  `<picture>` encolhia ao lado do nome da ONG. Agora ele mantém 56 × 56 px.

### Alterado
- A ilustração da página inicial ganhou uma versão de 400 px, além da de 800 px, escolhida pelo
  navegador com `srcset` e `sizes`: um celular com tela 1x baixa 1,9 KB em AVIF, em vez de 3,5 KB.

## [1.3.0] - 2026-10-01

### Adicionado
- Build de produção (`npm run build`) com o esbuild como bundler: o JavaScript vira um pacote
  minificado, com o Chart.js em um arquivo separado, carregado sob demanda; o CSS vira uma única
  folha de estilo minificada; e o HTML é minificado pelo html-minifier-terser. Os arquivos levam
  hash no nome e mapas de código. HTML, CSS e JS do projeto caem de 124,8 KB para 72,1 KB
  (21,6 KB com gzip).
- `npm run preview`, para conferir o build em um servidor local.
- Otimização das imagens com o sharp (`npm run imagens`): JPG com o codificador mozjpeg, PNG com
  paleta, WebP e a nova versão AVIF, de 20% a 78% menores que os originais.
- Testes de ponta a ponta também no build de produção, servido em um subcaminho como no GitHub
  Pages, com orçamento de tamanho: JS abaixo de 50 KB, CSS abaixo de 30 KB e primeira visita
  abaixo de 100 KB.
- Integração contínua e deploy no GitHub Pages com GitHub Actions: cada push e pull request roda
  os testes, e a `main` é publicada se todos passarem.

### Alterado
- As imagens oferecem o AVIF antes do WebP, e a imagem principal do início tem
  `fetchpriority="high"`.
- `npm run build` passa a gerar o build de produção; o pacote do Chart.js agora é gerado por
  `npm run build:vendor`.
- Os originais das imagens foram para `imagens/originais/`, fora do site.

## [1.2.2] - 2026-10-01

### Adicionado
- Verificação do contraste das cores do Design System (`npm run contraste`): mostra a relação
  de cada par de cores do site, no modo normal e no alto contraste, calculada com a fórmula da
  WCAG. O teste de unidade falha se um par ficar abaixo do mínimo: 4,5:1 para texto, 3:1 para
  bordas, ícones, contorno de foco e gráfico, e 7:1 para texto no alto contraste.

### Alterado
- A cor do botão desabilitado no alto contraste virou a variável `--hc-desabilitado`.

### Removido
- A variável `--cor-borda` (#bbbbbb), que não era mais usada: a borda dos campos usa
  `--cor-borda-campo` (#767676, 4,54:1 sobre o branco).

## [1.2.1] - 2026-10-01

### Corrigido
- Contorno de foco invisível nos links do rodapé (verde sobre verde) e ausente no seletor de
  data; o `<summary>` passa a ter o mesmo contorno de 3px dos outros elementos, e o botão do
  submenu ganhou espaço para o contorno não encostar no item da página atual.
- O botão "Enviar cadastro" desabilitado saía da ordem do Tab, e o leitor de tela não chegava à
  dica. Agora ele usa `aria-disabled` e, acionado sem o aceite, leva o foco até o aceite.
- Os botões de fechar alertas tinham o mesmo nome ("Fechar aviso"), e dois links "Quero ser
  voluntário" levavam a destinos diferentes. Agora os nomes são distintos.
- O foco se perdia ao apagar o histórico ou descartar o rascunho; agora vai para o título da página.

### Adicionado
- Testes que percorrem cada tela com Tab e conferem, em cada parada, o contorno de foco com
  contraste mínimo de 3:1.

## [1.2.0] - 2026-10-01

### Adicionado
- Modo de alto contraste (fundo preto, texto branco e amarelo nos links, botões e foco), ligado
  pelo botão "Alto contraste" ou pela configuração do sistema (`prefers-contrast: more`), com a
  escolha salva no localStorage. O gráfico troca as cores junto.
- Suporte ao modo de cores forçadas do sistema (`forced-colors`): botões ligados e página atual
  usam as cores de destaque do sistema.
- Auditoria automática da WCAG 2.1 AA com axe-core nos testes de ponta a ponta, inclusive no
  modo de alto contraste.
- Região "Recursos de acessibilidade" como marco (landmark) e legenda (`caption`) na tabela de
  dados do gráfico.

### Alterado
- O submenu "Projetos" abre por um botão com `aria-expanded` e `aria-controls` (padrão de
  divulgação do WAI-ARIA) e fecha com Esc, em vez de abrir com o mouse ou o foco.
- O grupo "Como deseja participar?" passa a ser um `radiogroup` com `aria-required` e
  `aria-invalid`; os asteriscos dos campos ficam ocultos dos leitores de tela.
- Os toasts param a contagem enquanto o mouse ou o foco estiverem sobre eles.
- A gestão de foco foi reunida no módulo `foco.js`.

### Corrigido
- O submenu aberto com o mouse ou o foco não fechava com Esc (WCAG 1.4.13).
- Ao fechar um alerta pelo teclado, o foco ia para o início da página; agora vai para o título
  da seção.

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

[1.3.2]: ../../compare/v1.3.1...v1.3.2
[1.3.1]: ../../compare/v1.3.0...v1.3.1
[1.3.0]: ../../compare/v1.2.2...v1.3.0
[1.2.2]: ../../compare/v1.2.1...v1.2.2
[1.2.1]: ../../compare/v1.2.0...v1.2.1
[1.2.0]: ../../compare/v1.1.0...v1.2.0
[1.1.0]: ../../compare/v1.0.1...v1.1.0
[1.0.1]: ../../compare/v1.0.0...v1.0.1
[1.0.0]: ../../releases/tag/v1.0.0
