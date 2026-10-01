# ONG Mãos Solidárias – Projeto Front-end

Site institucional da ONG Mãos Solidárias, construído como uma SPA (Single Page Application) em
HTML, CSS e JavaScript puro: uma única página cujo conteúdo é trocado pelo JavaScript, sem
recarregar o navegador e sem framework.

## Sumário

1. [Visão geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Como executar](#como-executar)
6. [Build](#build)
7. [Testes](#testes)
8. [Estrutura de pastas](#estrutura-de-pastas)
9. [Arquitetura](#arquitetura)
10. [Rotas](#rotas)
11. [Formulário de cadastro](#formulário-de-cadastro)
12. [Dados salvos no navegador](#dados-salvos-no-navegador)
13. [Gráfico com Chart.js](#gráfico-com-chartjs)
14. [Componentes de feedback](#componentes-de-feedback)
15. [Acessibilidade](#acessibilidade)
16. [Versionamento e contribuição](#versionamento-e-contribuição)

## Visão geral

A ONG Mãos Solidárias é uma organização fictícia, criada para a disciplina, que atua em educação,
segurança alimentar e meio ambiente. O site apresenta a instituição e os projetos, divulga as
campanhas de doação e recebe o cadastro de voluntários e doadores.

Principais funcionalidades:

- **Navegação SPA** por hash (`#/inicio`, `#/projetos`, `#/cadastro`), com título da aba, foco e
  botões Voltar e Avançar do navegador funcionando a cada troca de página.
- **Cadastro** com máscaras de CPF, telefone e CEP e verificação de consistência em tempo real
  (dígitos do CPF, idade mínima, DDD), com resumo de erros e links para os campos.
- **Persistência no navegador** (localStorage): preferências "Alto contraste" e "Texto maior",
  rascunho do cadastro e histórico dos envios.
- **Acessibilidade** seguindo a WCAG 2.1 nível AA: marcos, WAI-ARIA, navegação completa pelo
  teclado e modo de alto contraste.
- **Gráfico de arrecadação** das campanhas com Chart.js, carregado só na página de projetos.
- **Componentes de feedback** reutilizáveis: badges, alertas, toasts e modais.
- **Layout responsivo** com Grid de 12 colunas, cinco breakpoints e menu hambúrguer no celular.

O projeto não tem back-end: o envio do cadastro é simulado no próprio navegador.

## Tecnologias

| Tecnologia | Versão | Uso no projeto |
|---|---|---|
| HTML5 | — | Estrutura semântica (`header`, `nav`, `main`, `section`, `article`, `form`, `fieldset`, `dialog`) |
| CSS3 | — | Design System em variáveis, Grid de 12 colunas, Flexbox e media queries mobile-first |
| JavaScript (ES Modules) | ES2020 | Roteador, templates, validação, máscaras e persistência, sem framework |
| [Chart.js](https://www.chartjs.org/) | 4.5.1 | Gráfico de barras das campanhas |
| [esbuild](https://esbuild.github.io/) | 0.28.2 | Empacota o Chart.js em um único arquivo local |
| [Node.js](https://nodejs.org/) e npm | 20 ou superior | Servidor local, build e testes |
| `node:test` | nativo do Node.js | Testes de unidade |
| [Playwright](https://playwright.dev/) | 1.56.0 | Testes de ponta a ponta no Chromium |
| [axe-core](https://github.com/dequelabs/axe-core) | 4.13.0 | Auditoria automática da WCAG 2.1 AA nos testes |
| [W3C Nu Html Checker](https://validator.w3.org/nu/) | — | Validação do HTML e do CSS |
| Git | — | Versionamento com GitFlow e Conventional Commits |

## Pré-requisitos

- **Navegador atualizado** (Chrome, Edge, Firefox ou Safari), com suporte a ES Modules e ao
  elemento `<dialog>`.
- **Node.js 20 ou superior**, que já inclui o npm. É necessário para o servidor local, o build e
  os testes. Confira a versão com `node --version`.
- **Git**, para clonar o repositório e seguir o fluxo de branches.
- Opcional: **VS Code** com a extensão **Live Server**, para apenas visualizar o site sem instalar
  o Node.js.

## Instalação

```bash
git clone <endereço-do-repositório>
cd ong-maos-solidarias
npm install                        # Chart.js, esbuild, Playwright e axe-core (dependências de desenvolvimento)
npx playwright install chromium    # navegador usado nos testes de ponta a ponta
```

Para instalar exatamente as versões registradas no `package-lock.json` (por exemplo, em integração
contínua), use `npm ci` no lugar de `npm install`.

O site em si não depende de nenhum pacote: o Chart.js já está empacotado em `js/vendor/`. As
dependências do npm servem para gerar esse pacote e rodar os testes.

## Como executar

```bash
npm start
```

O comando inicia o servidor local (`ferramentas/servidor.js`, sem dependências) e mostra o endereço
`http://localhost:8080/html/index.html`. Para usar outra porta: `PORT=3000 npm start`
(no PowerShell: `$env:PORT=3000; npm start`).

Alternativas sem Node.js:

- **VS Code:** clique com o botão direito em `html/index.html` e escolha **Open with Live Server**;
- **Python:** na pasta do projeto, rode `python -m http.server` e acesse
  `http://localhost:8000/html/index.html`.

> Abrir o `index.html` direto do disco (`file://`) não funciona, porque os navegadores bloqueiam
> módulos JavaScript nesse modo. Nesse caso, a página mostra um aviso com estas instruções.

## Build

```bash
npm run build
```

Gera de novo o arquivo `js/vendor/chart.esm.js` com o esbuild: o Chart.js 4.5.1 vira um único
ES Module minificado (cerca de 148 KB), só com os componentes do gráfico de barras listados em
`ferramentas/chart-entrada.js`. A licença MIT do Chart.js fica no fim do arquivo.

O arquivo gerado é versionado para que o site funcione sem Node.js e sem CDN. Rode o build apenas
ao atualizar o Chart.js ou mudar os componentes importados. HTML, CSS e o restante do JavaScript
não passam por build: são servidos como estão.

## Testes

| Comando | O que executa | Ferramenta |
|---|---|---|
| `npm test` | Testes de unidade, sem navegador | `node:test`, nativo do Node.js |
| `npm run test:e2e` | Testes de ponta a ponta no Chromium | Playwright |
| `npm run contraste` | Tabela de contraste de cada par de cores do Design System | `ferramentas/contraste.js` (fórmula da WCAG) |

**Unidade (`testes/unidade/`):** regras de validação (CPF, idade, telefone, CEP e demais campos),
máscaras, templates (inclusive o `escapar()` contra HTML injetado), percentual das campanhas,
leitura e gravação no localStorage (com um armazenamento em memória), histórico de envios e
contraste de cada par de cores do site, no modo normal e no alto contraste.

**Ponta a ponta (`testes/e2e/`):** o Playwright inicia o servidor local, abre o Chromium e usa o
site como uma pessoa usaria:

- `navegacao.spec.js`: rotas, título da aba, foco, Voltar e Avançar, página não encontrada,
  link "Pular para o conteúdo" e menu no celular;
- `cadastro.spec.js`: máscaras, verificação em tempo real, resumo de erros e envio. Inclui o teste
  de regressão do defeito corrigido na versão 1.0.1 (foco ao fechar o modal);
- `persistencia.spec.js`: preferência de texto, rascunho sem CPF e dados corrompidos no localStorage;
- `grafico.spec.js`: carregamento sob demanda do Chart.js, destruição do gráfico ao sair da página
  e tabela alternativa quando a biblioteca não carrega;
- `acessibilidade.spec.js`: auditoria da WCAG 2.1 AA com o axe-core em todas as rotas e estados
  (erros, modal, menu do celular, alto contraste), marcos, ordem do Tab e contorno de foco em cada
  parada, submenu pelo teclado, foco ao fechar alertas, nomes acessíveis e preferências visuais.

Comandos úteis:

```bash
npx playwright test testes/e2e/cadastro.spec.js   # executa um arquivo só
npx playwright test --headed                       # mostra o navegador durante os testes
npx playwright show-report                         # abre o relatório da última execução
```

**Validação W3C:** o `html/index.html`, o HTML gerado por cada rota e os dois arquivos CSS foram
validados no [W3C Nu Html Checker](https://validator.w3.org/nu/), sem erros. Para conferir o HTML
gerado por uma rota, copie o elemento `<html>` no DevTools (Copy outerHTML) e cole na opção
"Text input" do validador.

## Estrutura de pastas

```
ong-maos-solidarias/
├── README.md                 Esta documentação
├── CHANGELOG.md              Histórico de versões
├── package.json              Scripts (start, build, test, test:e2e, contraste) e dependências de desenvolvimento
├── package-lock.json         Versões exatas das dependências instaladas
├── playwright.config.js      Configuração dos testes de ponta a ponta
├── .gitignore                Arquivos fora do repositório (node_modules, relatórios de teste)
├── ferramentas/
│   ├── servidor.js           Servidor local sem dependências (npm start)
│   ├── contraste.js          Contraste das cores do Design System pela fórmula da WCAG (npm run contraste)
│   └── chart-entrada.js      Entrada do pacote do Chart.js (só os componentes usados)
├── html/
│   └── index.html            Casca da SPA: cabeçalho, menu, <main> vazio e rodapé
├── css/
│   ├── reset.css             Normalização dos navegadores (carregado primeiro)
│   └── style.css             Design System, layout, Grid de 12 colunas e componentes
├── js/
│   ├── main.js               Ponto de entrada: importa e inicia os módulos
│   ├── vendor/
│   │   ├── chart.esm.js      Chart.js 4.5.1 empacotado em um único ES Module (gerado pelo build)
│   │   └── LICENSE-chart.js.md  Licença MIT do Chart.js
│   └── modules/
│       ├── router.js         Roteador por hash (#/inicio, #/projetos, #/cadastro)
│       ├── templates.js      Templates reutilizáveis (cartões, badges, alertas, imagens)
│       ├── dados.js          Dados dos projetos, campanhas e listas do formulário
│       ├── armazenamento.js  Leitura e gravação no localStorage (JSON.stringify / JSON.parse)
│       ├── preferencias.js   Preferências "Alto contraste" e "Texto maior"
│       ├── rascunho.js       Rascunho do cadastro (sem CPF e sem aceite)
│       ├── historico.js      Histórico dos cadastros enviados
│       ├── grafico-campanhas.js  Gráfico de progresso das campanhas (Chart.js)
│       ├── menu.js           Menu hambúrguer e submenu (aria-expanded)
│       ├── foco.js           Gestão de foco (rotas, alertas, notificações e modal)
│       ├── feedback.js       Toasts, alertas, modais e botão de copiar
│       ├── mascaras.js       Máscaras de CPF, telefone e CEP
│       ├── validacao.js      Regras de consistência (RegEx, CPF, idade, telefone...)
│       ├── campos.js         Estado visual de um campo (classes, mensagem, aria-*)
│       ├── resumo-erros.js   Alerta com a lista de erros e links para os campos
│       ├── formulario.js     Controlador do cadastro: liga eventos, regras, persistência e modal
│       └── paginas/          Um módulo por página: titulo, render(), iniciar() e sair()
│           ├── inicio.js
│           ├── projetos.js
│           ├── cadastro.js
│           ├── componentes.js
│           └── nao-encontrada.js
├── testes/
│   ├── unidade/              Testes de unidade (*.test.js), executados com node:test
│   └── e2e/                  Testes de ponta a ponta (*.spec.js), executados com Playwright
└── imagens/                  Imagens otimizadas em dois formatos (JPG/PNG + WebP)
```

## Arquitetura

O `html/index.html` é a casca fixa da aplicação. Ele carrega `js/main.js` como módulo, e o
`main.js` inicia a preferência de texto, o menu, os componentes de feedback, as máscaras e o
roteador. A cada mudança no endereço (evento `hashchange`), o roteador:

1. chama `sair()` da página anterior (por exemplo, para destruir o gráfico);
2. coloca no `<main>` o HTML devolvido por `render()` da nova página;
3. atualiza o título da aba e o item ativo do menu (`aria-current`);
4. chama `iniciar()` para ligar os eventos da página;
5. rola até a seção pedida e move o foco para o título.

Cada arquivo de `js/modules` tem uma única responsabilidade e se comunica pelos `export` e `import`
do ES6, sem variáveis globais. As dependências seguem um só sentido, sem ciclos:
`main.js` → `router.js` → páginas → templates, dados e controladores → módulos-base
(`dados`, `validacao`, `armazenamento`, `campos`, `resumo-erros`, `mascaras`, `menu`, `foco`),
que não importam nenhum outro módulo do projeto.

## Rotas

| Endereço | Página |
|---|---|
| `#/inicio` | Início |
| `#/projetos` | Projetos, voluntariado e doações |
| `#/projetos/campanhas` | Projetos, rolando até a seção indicada |
| `#/cadastro` | Formulário de cadastro |
| `#/componentes` | Guia de componentes (uso interno, fora do menu) |
| qualquer outro | Página não encontrada |

Os botões Voltar e Avançar do navegador funcionam normalmente, e o título da aba muda a cada página.

## Formulário de cadastro

- O formulário usa `novalidate`, e a verificação fica com o JavaScript (`js/modules/validacao.js`),
  em tempo real e no envio: nome com sobrenome, e-mail com domínio, CPF com dígitos verificadores,
  idade mínima de 16 anos, DDD e celular, CEP, número (ou S/N), cidade, estado, forma de
  participação e aceite da LGPD.
- Cada campo é verificado ao perder o foco e, a partir daí, a cada digitação. As mensagens aparecem
  abaixo do campo, ligadas a ele por `aria-describedby`.
- No envio com erros, um alerta no topo lista os problemas, com links que levam a cada campo.
- Os atributos nativos (`required`, `pattern`, `min`/`max`, `maxlength`) continuam no HTML
  documentando as regras, e `setCustomValidity()` mantém a validação nativa coerente com a do script.

## Dados salvos no navegador

Todas as chaves do localStorage começam com `ong-maos-solidarias:`.

| Chave | Estrutura | Quando é gravada | Quando é restaurada |
|---|---|---|---|
| `preferencias` | objeto `{ textoGrande, altoContraste }` | Ao clicar em "Alto contraste" ou "Texto maior" | No `<head>`, antes da página aparecer |
| `rascunho-cadastro` | objeto `{ campos, areas, salvoEm }` | 400 ms após a última digitação | Ao abrir `#/cadastro` |
| `cadastros-enviados` | array com até 5 envios `{ primeiroNome, participacao, enviadoEm }` | A cada envio válido | Ao abrir `#/cadastro` |

O campo `altoContraste` só é gravado depois que a pessoa escolhe; até lá, vale a configuração do
sistema (`prefers-contrast: more`). Por privacidade, o rascunho não guarda o CPF nem o aceite da LGPD. Dados corrompidos ou fora do
formato esperado são ignorados, e textos lidos do armazenamento passam por `escapar()` antes de
entrar no HTML.

## Gráfico com Chart.js

O gráfico "Quanto já arrecadamos" (página de projetos) usa o **Chart.js 4.5.1**, instalado pelo
npm e empacotado com o **esbuild** em um único ES Module local (veja [Build](#build)). Assim o site
não depende de CDN e funciona offline.

- A biblioteca é carregada sob demanda, com `import()`, só quando a página de projetos é aberta.
- Não cria variáveis globais; a instância é destruída (`destroy()`) quando o usuário sai da página.
- Se o arquivo não carregar, a página mostra uma tabela com os mesmos dados.

## Componentes de feedback

A rota `#/componentes` documenta badges, alertas, toasts e modais. Os comportamentos funcionam só
com atributos no HTML:

- `data-toast="Mensagem"` e `data-toast-tipo="sucesso"` mostram um toast;
- `data-abrir-modal="id-do-dialog"` abre um modal;
- `data-copiar="#id"` copia o texto de um elemento e confirma com um toast.

Tipos disponíveis: `info`, `sucesso`, `aviso` e `erro`.

## Acessibilidade

O site segue a WCAG 2.1, nível AA. A conformidade é verificada automaticamente pelo axe-core nos
testes de ponta a ponta (`testes/e2e/acessibilidade.spec.js`), pela verificação de contraste das
cores (`npm run contraste`) e manualmente, com o teclado.

**Estrutura e marcos (landmarks)**

- `<header>` (banner), `<nav aria-label="Menu principal">`, `<main id="conteudo">` e `<footer>`
  (contentinfo) em todas as páginas, além da região "Recursos de acessibilidade"
  (`role="region"` com `aria-label`).
- Um `<h1>` por página e seções com `<h2>`; cartões em `<article>`, listas, `<figure>` com
  `<figcaption>`, `<address>` e tabela com `<caption>` e `<th scope>`.

**WAI-ARIA nos elementos interativos**

- Menu hambúrguer e submenu "Projetos" no padrão de divulgação (disclosure): `aria-expanded` e
  `aria-controls`. O submenu abre com Enter ou Espaço e fecha com Esc, devolvendo o foco ao botão.
- Botões "Alto contraste" e "Texto maior" com `aria-pressed`; item da página atual com
  `aria-current="page"`.
- Formulário: `aria-describedby` liga dicas e mensagens aos campos, `aria-invalid` marca os campos
  com erro, o grupo de rádios é um `radiogroup` com `aria-required` e o resumo de erros usa
  `role="alert"`. Os asteriscos têm `aria-hidden="true"`, pois o `required` já informa a obrigatoriedade.
- Toasts em uma região `role="status"` com `aria-live="polite"`; modais com o `<dialog>` nativo,
  `aria-labelledby` e `aria-describedby`.
- Gráfico com `role="img"` e descrição no `aria-label`, além da tabela com os mesmos dados.

**Teclado e foco**

- Link "Pular para o conteúdo" e foco sempre visível com `:focus-visible`: contorno de 3px em todo
  elemento focável, com contraste de pelo menos 3:1 sobre o fundo (branco no cabeçalho e no rodapé
  verdes, amarelo no alto contraste). Os testes percorrem cada tela com Tab e conferem cada parada.
- A ordem do Tab segue a ordem visual: barra de acessibilidade, menu, conteúdo e rodapé.
- O botão "Enviar cadastro" usa `aria-disabled` em vez de `disabled`: continua no Tab, é anunciado
  como indisponível junto com a dica e, se acionado sem o aceite, leva o foco até ele.
- A cada troca de rota, o foco vai para o título da página; ao fechar um alerta, para o título da
  seção; ao fechar o modal do cadastro, para o histórico; ao apagar o histórico ou descartar o
  rascunho, para o título da página (`js/modules/foco.js`).
- Nomes acessíveis distintos: o botão de fechar de cada alerta inclui o título do alerta, e links
  com o mesmo texto levam ao mesmo destino.
- Esc fecha o menu, o submenu e os modais. Os toasts não somem enquanto o mouse ou o foco
  estiverem sobre eles.

**Contraste e preferências visuais**

- Cores do Design System com contraste de pelo menos 4,5:1 no texto e 3:1 nas bordas dos campos,
  nos ícones, no contorno de foco e nas barras do gráfico (WCAG AA). O laranja da marca (#f28c28)
  fica só nos detalhes decorativos, porque daria 2,45:1 com texto branco; os botões usam #a65300
  (5,44:1). O comando `npm run contraste` mostra a relação de cada par de cores, e o teste de
  unidade falha se alguma ficar abaixo do mínimo.
- Modo **Alto contraste**: fundo preto, texto branco e amarelo nos links, botões e foco (21:1 e
  19,56:1). Liga pelo botão da barra de acessibilidade ou, sem escolha salva, pela configuração do
  sistema (`prefers-contrast: more`). O gráfico troca as cores junto.
- Modo de cores forçadas do sistema (`forced-colors`, como o Alto Contraste do Windows): estados
  como "ligado" e "página atual" passam a usar as cores de destaque do sistema.
- "Texto maior" amplia textos e espaçamentos, que usam rem; animações são reduzidas com
  `prefers-reduced-motion`.

## Versionamento e contribuição

O repositório segue o modelo GitFlow:

| Branch | Função | Origem | Destino |
|---|---|---|---|
| `main` | Código publicado; cada versão recebe uma tag (`v1.0.0`, `v1.0.1`...) | — | — |
| `develop` | Integração contínua do que está pronto para a próxima versão | `main` | `release/*` |
| `feature/*` | Uma funcionalidade por branch (ex.: `feature/grafico-campanhas`) | `develop` | `develop` |
| `release/*` | Preparação de uma versão: número, CHANGELOG e revisão final | `develop` | `main` e `develop` |
| `hotfix/*` | Correção urgente de algo já publicado | `main` | `main` e `develop` |

Os merges usam `--no-ff`, para que cada funcionalidade apareça como um bloco no histórico
(`git log --graph --oneline --all`). Nenhum commit é feito direto na `main`.

Fluxo de uma nova funcionalidade:

```bash
git checkout develop
git checkout -b feature/nome-da-funcionalidade
# ...commits...
npm test && npm run test:e2e      # os testes precisam passar antes do merge
git checkout develop
git merge --no-ff feature/nome-da-funcionalidade
```

As mensagens de commit seguem o Conventional Commits, no formato `tipo(escopo): descrição no imperativo`:

| Tipo | Uso | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat(projetos): adiciona gráfico de arrecadação das campanhas` |
| `fix` | Correção de defeito | `fix(cadastro): devolve o foco ao título do histórico ao fechar o modal` |
| `refactor` | Mudança interna sem alterar o comportamento | `refactor(cadastro): separa estado dos campos e resumo de erros em módulos` |
| `test` | Testes automatizados | `test: adiciona testes de ponta a ponta com Playwright` |
| `docs` | Documentação | `docs: documenta estrutura, execução, módulos e versionamento no README` |
| `build` | Dependências, empacotamento e ferramentas | `build: empacota o Chart.js 4.5.1 com esbuild` |
| `chore` | Tarefas de manutenção e versões | `chore(release): prepara a versão 1.0.0` |

As versões seguem o Versionamento Semântico (MAIOR.MENOR.CORREÇÃO), e as mudanças de cada versão
estão no [CHANGELOG.md](CHANGELOG.md).
