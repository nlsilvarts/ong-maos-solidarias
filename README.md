# ONG Mãos Solidárias – Projeto Front-end

Site institucional da ONG construído como uma SPA (Single Page Application):
uma única página HTML cujo conteúdo é trocado pelo JavaScript, sem recarregar o navegador.

## Como executar

A aplicação usa módulos JavaScript (`import`/`export`), que os navegadores bloqueiam
quando o arquivo é aberto direto do computador (`file://`). Por isso, abra o projeto
por um servidor local:

- **VS Code:** abra a pasta do projeto, clique com o botão direito em `html/index.html`
  e escolha **Open with Live Server**; ou
- **Terminal:** na pasta do projeto, rode `python -m http.server` e acesse
  `http://localhost:8000/html/index.html`.

## Estrutura de pastas

```
ong-maos-solidarias/
├── README.md                 Esta documentação
├── CHANGELOG.md              Histórico de versões
├── .gitignore                Arquivos que não entram no repositório (node_modules)
├── package.json              Dependências de desenvolvimento (chart.js, esbuild) e script de build
├── ferramentas/
│   └── chart-entrada.js      Entrada do pacote do Chart.js (só os componentes usados)
├── html/
│   └── index.html            Casca da SPA: cabeçalho, menu, <main> vazio e rodapé
├── css/
│   ├── reset.css             Normalização dos navegadores (carregado primeiro)
│   └── style.css             Design System, layout, Grid de 12 colunas e componentes
├── js/
│   ├── main.js               Ponto de entrada: importa e inicia os módulos
│   ├── vendor/
│   │   ├── chart.esm.js      Chart.js 4.5.1 empacotado em um único ES Module (gerado)
│   │   └── LICENSE-chart.js.md  Licença MIT do Chart.js
│   └── modules/
│       ├── router.js         Roteador por hash (#/inicio, #/projetos, #/cadastro)
│       ├── templates.js      Templates reutilizáveis (cartões, badges, alertas, imagens)
│       ├── dados.js          Dados dos projetos, campanhas e listas do formulário
│       ├── armazenamento.js  Leitura e gravação no localStorage (JSON.stringify / JSON.parse)
│       ├── preferencias.js   Preferência "Texto maior"
│       ├── rascunho.js       Rascunho do cadastro (sem CPF e sem aceite)
│       ├── historico.js      Histórico dos cadastros enviados
│       ├── grafico-campanhas.js  Gráfico de progresso das campanhas (Chart.js)
│       ├── menu.js           Menu hambúrguer
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
└── imagens/                  Imagens otimizadas em dois formatos (JPG/PNG + WebP)
```

## Organização dos módulos

Cada arquivo de `js/modules` tem uma única responsabilidade e se comunica pelos `export` e
`import` do ES6. As dependências seguem um só sentido, sem ciclos:
`main.js` → `router.js` → páginas → templates, dados e controladores → módulos-base
(`dados`, `validacao`, `armazenamento`, `campos`, `resumo-erros`, `mascaras`, `menu`),
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

## Validação

- A casca `html/index.html`, os arquivos CSS e o HTML gerado por todas as rotas foram
  validados com o W3C Nu Html Checker, sem erros nem avisos.
- O formulário é verificado em JavaScript (`js/modules/validacao.js`), em tempo real e no envio:
  nome com sobrenome, e-mail com domínio, CPF com dígitos verificadores, idade mínima de 16 anos,
  DDD e celular, CEP, número (ou S/N), cidade, estado, forma de participação e aceite da LGPD.
- Os atributos nativos (`required`, `pattern`, `min`/`max`, `maxlength`) continuam no HTML
  documentando as regras, e `setCustomValidity()` mantém a validação nativa coerente com a do script.

## Dados salvos no navegador (localStorage)

Todas as chaves começam com `ong-maos-solidarias:`.

| Chave | Estrutura | Quando é gravada | Quando é restaurada |
|---|---|---|---|
| `preferencias` | objeto `{ textoGrande }` | Ao clicar em "Texto maior" | No `<head>`, antes da página aparecer |
| `rascunho-cadastro` | objeto `{ campos, areas, salvoEm }` | 400 ms após a última digitação | Ao abrir `#/cadastro` |
| `cadastros-enviados` | array com até 5 envios `{ primeiroNome, participacao, enviadoEm }` | A cada envio válido | Ao abrir `#/cadastro` |

Por privacidade, o rascunho não guarda o CPF nem o aceite da LGPD. Dados corrompidos ou fora do
formato esperado são ignorados, e textos lidos do armazenamento passam por `escapar()` antes de
entrar no HTML.

## Biblioteca externa: Chart.js

O gráfico "Quanto já arrecadamos" (página de projetos) usa o **Chart.js 4.5.1**, instalado pelo
npm e empacotado com o **esbuild** em um único ES Module local (`js/vendor/chart.esm.js`), com
apenas os componentes de um gráfico de barras. Assim o site não depende de CDN e funciona offline.

- A biblioteca é carregada sob demanda, com `import()`, só quando a página de projetos é aberta.
- Não cria variáveis globais; a instância é destruída (`destroy()`) quando o usuário sai da página.
- Se o arquivo não carregar, a página mostra a tabela com os mesmos dados.

Para gerar o pacote de novo (requer Node.js):

```
npm install
npm run build:vendor
```

## Componentes de feedback

A rota `#/componentes` documenta badges, alertas, toasts e modais. Os comportamentos
funcionam só com atributos no HTML:

- `data-toast="Mensagem"` e `data-toast-tipo="sucesso"` mostram um toast;
- `data-abrir-modal="id-do-dialog"` abre um modal;
- `data-copiar="#id"` copia o texto de um elemento e confirma com um toast.

Tipos disponíveis: `info`, `sucesso`, `aviso` e `erro`.

## Versionamento (GitFlow)

O repositório segue o modelo GitFlow:

| Branch | Função | Origem | Destino |
|---|---|---|---|
| `main` | Código publicado; cada versão recebe uma tag (`v1.0.0`, `v1.0.1`) | — | — |
| `develop` | Integração contínua do que está pronto para a próxima versão | `main` | `release/*` |
| `feature/*` | Uma funcionalidade por branch (ex.: `feature/grafico-campanhas`) | `develop` | `develop` |
| `release/*` | Preparação de uma versão: número, CHANGELOG e revisão final | `develop` | `main` e `develop` |
| `hotfix/*` | Correção urgente de algo já publicado | `main` | `main` e `develop` |

Os merges usam `--no-ff`, para que cada funcionalidade apareça como um bloco no histórico
(`git log --graph --oneline --all`). Nenhum commit é feito direto na `main`.

Fluxo de uma nova funcionalidade:

```
git checkout develop
git checkout -b feature/nome-da-funcionalidade
# ...commits...
git checkout develop
git merge --no-ff feature/nome-da-funcionalidade
```

## Padrão de commits

As mensagens seguem o Conventional Commits, no formato `tipo(escopo): descrição no imperativo`:

| Tipo | Uso | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat(projetos): adiciona gráfico de arrecadação das campanhas` |
| `fix` | Correção de defeito | `fix(cadastro): devolve o foco ao título do histórico ao fechar o modal` |
| `refactor` | Mudança interna sem alterar o comportamento | `refactor(cadastro): separa estado dos campos e resumo de erros em módulos` |
| `docs` | Documentação | `docs: documenta estrutura, execução, módulos e versionamento no README` |
| `build` | Dependências e empacotamento | `build: empacota o Chart.js 4.5.1 com esbuild` |
| `chore` | Tarefas de manutenção e versões | `chore(release): prepara a versão 1.0.0` |

As versões seguem o Versionamento Semântico (MAIOR.MENOR.CORREÇÃO), e as mudanças de cada
versão estão no `CHANGELOG.md`.
