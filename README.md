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
6. [Build de produção](#build-de-produção)
7. [Testes](#testes)
8. [Deploy](#deploy)
9. [Estrutura de pastas](#estrutura-de-pastas)
10. [Arquitetura](#arquitetura)
11. [Rotas](#rotas)
12. [Formulário de cadastro](#formulário-de-cadastro)
13. [Dados salvos no navegador](#dados-salvos-no-navegador)
14. [Gráfico com Chart.js](#gráfico-com-chartjs)
15. [Componentes de feedback](#componentes-de-feedback)
16. [Acessibilidade](#acessibilidade)
17. [Versionamento e contribuição](#versionamento-e-contribuição)

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
| [esbuild](https://esbuild.github.io/) | 0.28.2 | Bundler: build de produção (JS e CSS minificados) e pacote local do Chart.js |
| [html-minifier-terser](https://github.com/terser/html-minifier-terser) | 7.2.0 | Minificação do HTML no build |
| [sharp](https://sharp.pixelplumbing.com/) | 0.35.5 | Otimização das imagens (JPG, PNG, WebP e AVIF) |
| [Node.js](https://nodejs.org/) e npm | 20 ou superior | Servidor local, build e testes |
| `node:test` | nativo do Node.js | Testes de unidade |
| [Playwright](https://playwright.dev/) | 1.56.0 | Testes de ponta a ponta no Chromium |
| [axe-core](https://github.com/dequelabs/axe-core) | 4.13.0 | Auditoria automática da WCAG 2.1 AA nos testes |
| [W3C Nu Html Checker](https://validator.w3.org/nu/) | — | Validação do HTML e do CSS |
| Git | — | Versionamento com GitFlow e Conventional Commits |
| GitHub Actions e GitHub Pages | — | Testes a cada push e pull request e deploy do build de produção |

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
npm install                        # dependências de desenvolvimento: esbuild, sharp, Playwright...
npx playwright install chromium    # navegador usado nos testes de ponta a ponta
```

Para instalar exatamente as versões registradas no `package-lock.json` (por exemplo, em integração
contínua), use `npm ci` no lugar de `npm install`.

O site em si não depende de nenhum pacote: o Chart.js já está empacotado em `js/vendor/`. As
dependências do npm servem para o build de produção, a otimização das imagens e os testes.

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

## Build de produção

```bash
npm run build      # gera a pasta dist/, pronta para publicar
npm run preview    # serve a pasta dist/ em http://localhost:8080/, com gzip
```

O build (`ferramentas/build.js`) usa o **esbuild** como bundler:

- **JavaScript:** parte de `js/main.js`, junta os 22 módulos em um único arquivo e separa o Chart.js
  em outro, baixado só quando o gráfico aparece (code splitting do `import()`). O código é
  minificado (sem espaços e comentários, com nomes encurtados) para os navegadores com suporte ao
  `<dialog>`: Chrome e Edge 98, Firefox 98 e Safari 15.4.
- **CSS:** `reset.css` e `style.css` viram uma única folha de estilo minificada.
- **HTML:** o `index.html` passa a apontar para os arquivos gerados e é minificado pelo
  **html-minifier-terser** (espaços, comentários e os scripts do `<head>`).
- Os arquivos de `assets/` levam um hash do conteúdo no nome (`main-[hash].js`): quando o conteúdo
  muda, o nome muda, e o navegador não usa uma cópia velha do cache. Mapas de código (`.map`)
  acompanham o JS e o CSS, para depuração.
- As imagens, já otimizadas, são copiadas para `dist/imagens/`.

| Arquivo em `dist/` | Original | Minificado | Com gzip |
|---|---|---|---|
| `index.html` | 5,5 KB | 3,7 KB (−33%) | 1,6 KB |
| `assets/estilos-[hash].css` | 42,1 KB | 26,4 KB (−37%) | 5,7 KB |
| `assets/main-[hash].js` | 77,2 KB | 42,1 KB (−45%) | 14,3 KB |
| `assets/chart.esm-[hash].js` | 148,1 KB (já minificado) | 148,2 KB | 51,6 KB |

No total, o HTML, o CSS e o JavaScript do projeto caem de 124,8 KB para 72,1 KB (−42%), e para
21,6 KB com a compressão gzip feita pelo servidor. A primeira visita baixa menos de 100 KB, e os
testes do build conferem esse orçamento. A pasta `dist/` não é versionada: ela é gerada a cada
build e no deploy.

### Medição com o Lighthouse

Comparação entre a v1.2.2 (antes do build e da otimização das imagens) e o build da v1.3.2,
servidos pelo `servidor.js` com gzip, como no GitHub Pages. Lighthouse 13.5, página inicial,
mediana de 5 execuções:

| Métrica | Celular (4G lento simulado) | Computador |
|---|---|---|
| LCP (maior conteúdo visível) | 1,74 s → 1,35 s (−22%) | 0,45 s → 0,36 s (−21%) |
| FCP (primeiro conteúdo) | 1,12 s → 1,12 s | 0,33 s → 0,31 s |
| CLS (mudança de layout) | 0,15 → 0 | 0,76 → 0 |
| Peso da página | 68,2 KB → 32,6 KB (−52%) | 71,7 KB → 34,6 KB (−52%) |
| Requisições | 29 → 7 | 30 → 8 |
| Pontuação de desempenho | 93 → 100 | 76 → 100 |

O maior ganho vem de trocar os 22 módulos JavaScript, baixados em cadeia (cada `import` só é
descoberto depois que o arquivo anterior chega, em até 6 níveis), por um único arquivo: a cadeia
de requisições cai para 2 níveis, e cada nível a menos economiza uma ida e volta na rede. O CLS
vinha do rodapé, que aparecia logo abaixo do "Carregando…" e pulava quando o conteúdo chegava;
agora o `<main>` tem altura mínima de uma tela.

Para repetir a medição: `npm run build`, `npm run preview` e, no Chrome, **DevTools > Lighthouse**
com a categoria Performance (ou `npx lighthouse http://localhost:8080/`).

### Imagens

```bash
npm run imagens
```

O `ferramentas/imagens.js` usa o **sharp** para gerar, a partir dos originais de
`imagens/originais/`, as versões usadas pelo site, no tamanho em que aparecem e sem metadados:

| Imagem | Original | JPG/PNG otimizado | WebP | AVIF |
|---|---|---|---|---|
| `logo.png` | 7,2 KB | 2,0 KB (−72%) | 1,7 KB (−76%) | — |
| `projeto-alimentos.jpg` | 8,4 KB | 6,7 KB (−20%) | 3,1 KB (−63%) | 1,8 KB (−78%) |
| `projeto-educacao.jpg` | 9,5 KB | 7,4 KB (−21%) | 3,0 KB (−68%) | 2,2 KB (−76%) |
| `projeto-meio-ambiente.jpg` | 8,1 KB | 6,2 KB (−24%) | 3,4 KB (−59%) | 2,8 KB (−66%) |
| `voluntarios.jpg` | 14,6 KB | 11,0 KB (−25%) | 5,2 KB (−64%) | 3,5 KB (−76%) |
| `voluntarios-400` (400 px) | — | 5,0 KB | 2,4 KB | 1,9 KB |

- Ilustrações: JPG progressivo com o codificador mozjpeg (qualidade 75), WebP (qualidade 75) e AVIF
  (qualidade 50). O `<picture>` oferece o AVIF, depois o WebP, e deixa o JPG como alternativa.
- Logotipo: PNG com paleta de até 256 cores e WebP sem perdas feito a partir dela. O AVIF ficava
  maior que o WebP e não é usado.
- As imagens têm `width` e `height` (o espaço fica reservado e o layout não salta),
  `loading="lazy"` fora do topo da página e `fetchpriority="high"` na imagem principal do início.

**Resolução conforme a tela.** As imagens são exportadas no maior tamanho em que aparecem, medido
no layout de 320 a 1920 px de tela, e o CSS (`max-width: 100%; height: auto`) as reduz em telas
menores:

| Imagem | Largura na tela | Versões |
|---|---|---|
| Ilustração do início | de 288 px (celular) a 800 px (tablet) | 400 e 800 px, com `srcset` e `sizes` |
| Cartões dos projetos | de 224 a 400 px | 400 px |
| Logotipo | 56 px (celular) e 72 px (computador) | 120 px, nítido em telas 2x |

Na ilustração do início, o atributo `sizes` informa a largura que ela ocupa em cada faixa de tela,
e o navegador escolhe pelo `srcset`, considerando a densidade de pixels: um celular com tela 1x
baixa a versão de 400 px (1,9 KB em AVIF, em vez de 3,5 KB), e telas 2x ou maiores recebem a de
800 px. A lista de larguras fica em `LARGURAS_MENORES`, no `ferramentas/imagens.js`.

As versões geradas são versionadas, e o build só as copia. Rode `npm run imagens` ao trocar um
original.

### Pacote do Chart.js

```bash
npm run build:vendor
```

Gera de novo o arquivo `js/vendor/chart.esm.js` com o esbuild: o Chart.js 4.5.1 vira um único
ES Module minificado (cerca de 148 KB), só com os componentes do gráfico de barras listados em
`ferramentas/chart-entrada.js`. A licença MIT do Chart.js fica no fim do arquivo.

O arquivo gerado é versionado para que o site funcione sem CDN, inclusive em desenvolvimento, sem
build. Rode este comando apenas ao atualizar o Chart.js ou mudar os componentes importados.

## Testes

| Comando | O que executa | Ferramenta |
|---|---|---|
| `npm test` | Testes de unidade, sem navegador | `node:test`, nativo do Node.js |
| `npm run test:e2e` | Testes de ponta a ponta no Chromium, no código-fonte | Playwright |
| `npm run test:e2e:producao` | Os mesmos testes no build de produção (gera o build antes) | Playwright |
| `npm run contraste` | Tabela de contraste de cada par de cores do Design System | `ferramentas/contraste.js` (fórmula da WCAG) |

**Unidade (`testes/unidade/`):** regras de validação (CPF, idade, telefone, CEP e demais campos),
máscaras, templates (inclusive o `escapar()` contra HTML injetado), percentual das campanhas,
leitura e gravação no localStorage (com um armazenamento em memória), histórico de envios,
contraste de cada par de cores do site, no modo normal e no alto contraste, e imagens otimizadas
(cada versão com as dimensões do original e menor que ele).

**Ponta a ponta (`testes/e2e/`):** o Playwright inicia o servidor local, abre o Chromium e usa o
site como uma pessoa usaria. Os testes rodam em dois projetos: `desenvolvimento`, com o
código-fonte, e `producao`, com a pasta `dist/` servida em `/ong-maos-solidarias/`, como no
GitHub Pages, o que garante que nenhum endereço dependa da raiz do domínio.

- `navegacao.spec.js`: rotas, título da aba, foco, Voltar e Avançar, página não encontrada,
  link "Pular para o conteúdo", menu no celular e logotipo sem distorção em telas estreitas;
- `cadastro.spec.js`: máscaras, verificação em tempo real, resumo de erros e envio. Inclui o teste
  de regressão do defeito corrigido na versão 1.0.1 (foco ao fechar o modal);
- `persistencia.spec.js`: preferência de texto, rascunho sem CPF e dados corrompidos no localStorage;
- `grafico.spec.js`: carregamento sob demanda do Chart.js, destruição do gráfico ao sair da página
  e tabela alternativa quando a biblioteca não carrega;
- `acessibilidade.spec.js`: auditoria da WCAG 2.1 AA com o axe-core em todas as rotas e estados
  (erros, modal, menu do celular, alto contraste), marcos, ordem do Tab e contorno de foco em cada
  parada, submenu pelo teclado, foco ao fechar alertas, nomes acessíveis e preferências visuais;
- `desempenho.spec.js`: imagens em AVIF com `width` e `height`, prioridade da imagem principal,
  versão da imagem principal escolhida pelo `srcset` (celular 1x e 2x e notebook), layout estável
  durante o carregamento (CLS abaixo de 0,1) e, só no build, arquivos minificados, com hash no
  nome e servidos com gzip, e o orçamento de tamanho (JS abaixo de 50 KB, CSS abaixo de 30 KB e
  primeira visita abaixo de 100 KB).

Comandos úteis:

```bash
npx playwright test testes/e2e/cadastro.spec.js   # executa um arquivo só
npx playwright test --headed                       # mostra o navegador durante os testes
npx playwright show-report                         # abre o relatório da última execução
```

**Validação W3C:** o `html/index.html`, o HTML gerado por cada rota e os dois arquivos CSS foram
validados no [W3C Nu Html Checker](https://validator.w3.org/nu/), sem erros, assim como o
`index.html` e o CSS minificados do build. Para conferir o HTML
gerado por uma rota, copie o elemento `<html>` no DevTools (Copy outerHTML) e cole na opção
"Text input" do validador.

## Deploy

O site é publicado no **GitHub Pages** pelo **GitHub Actions**, com o workflow
`.github/workflows/deploy.yml`:

1. A cada push na `main` e a cada pull request, o workflow instala as dependências com `npm ci`
   (versões exatas do `package-lock.json`), roda os testes de unidade, a verificação de contraste, o
   build de produção e os testes de ponta a ponta no código-fonte e no build.
2. Se tudo passar e o push for na `main`, a pasta `dist/` é empacotada
   (`actions/upload-pages-artifact`) e publicada (`actions/deploy-pages`). Nos pull requests, o
   workflow só testa; se um teste falhar, nada é publicado.
3. O site fica em `https://<seu-usuario>.github.io/ong-maos-solidarias/`. Como a navegação usa o
   hash (`#/projetos`) e todos os caminhos do build são relativos, ele funciona nesse subcaminho
   sem nenhuma configuração de servidor. O GitHub Pages serve os arquivos por HTTPS e com
   compressão gzip.

Configuração, uma única vez, no repositório do GitHub: **Settings > Pages > Build and deployment >
Source: GitHub Actions**. Para publicar de novo sem um novo commit, use **Actions > Testes e deploy
> Run workflow**.

## Estrutura de pastas

```
ong-maos-solidarias/
├── README.md                 Esta documentação
├── CHANGELOG.md              Histórico de versões
├── package.json              Scripts (start, build, preview, imagens, test, test:e2e...) e dependências de desenvolvimento
├── package-lock.json         Versões exatas das dependências instaladas
├── playwright.config.js      Configuração dos testes de ponta a ponta
├── .gitignore                Arquivos fora do repositório (node_modules, dist, relatórios de teste)
├── .github/workflows/
│   └── deploy.yml            Testes e deploy no GitHub Pages (GitHub Actions)
├── ferramentas/
│   ├── servidor.js           Servidor local sem dependências (npm start e npm run preview)
│   ├── build.js              Build de produção com esbuild e html-minifier-terser (npm run build)
│   ├── imagens.js            Otimização das imagens com sharp (npm run imagens)
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
├── imagens/                  Imagens otimizadas (JPG/PNG, WebP e AVIF), usadas pelo site
│   └── originais/            Originais das imagens, que não vão para o site
└── dist/                     Build de produção (gerado por npm run build, fora do Git)
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
npm e empacotado com o **esbuild** em um único ES Module local (veja [Pacote do Chart.js](#pacote-do-chartjs)). Assim o site
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
# ...commits... (os testes precisam passar antes do merge)
npm test                          # unidade
npm run test:e2e                  # ponta a ponta no código-fonte
npm run test:e2e:producao         # ponta a ponta no build de produção
git checkout develop
git merge --no-ff feature/nome-da-funcionalidade
```

As mensagens de commit seguem o Conventional Commits, no formato `tipo(escopo): descrição no imperativo`:

| Tipo | Uso | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat(projetos): adiciona gráfico de arrecadação das campanhas` |
| `fix` | Correção de defeito | `fix(cadastro): devolve o foco ao título do histórico ao fechar o modal` |
| `refactor` | Mudança interna sem alterar o comportamento | `refactor(cadastro): separa estado dos campos e resumo de erros em módulos` |
| `perf` | Melhoria de desempenho | `perf(imagens): imagem principal responsiva, com versões de 400 e 800 px escolhidas por srcset e sizes` |
| `test` | Testes automatizados | `test: adiciona testes de ponta a ponta com Playwright` |
| `docs` | Documentação | `docs: documenta estrutura, execução, módulos e versionamento no README` |
| `build` | Dependências, empacotamento e ferramentas | `build: empacota o Chart.js 4.5.1 com esbuild` |
| `ci` | Integração contínua e deploy | `ci: testa o projeto e publica o build no GitHub Pages com GitHub Actions` |
| `chore` | Tarefas de manutenção e versões | `chore(release): prepara a versão 1.0.0` |

As versões seguem o Versionamento Semântico (MAIOR.MENOR.CORREÇÃO), e as mudanças de cada versão
estão no [CHANGELOG.md](CHANGELOG.md).
