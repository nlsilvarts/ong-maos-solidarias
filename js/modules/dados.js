/*
 * Dados exibidos nas páginas.
 * Ficam separados da marcação: os templates recebem estes objetos e
 * geram o HTML. No futuro, os mesmos dados podem vir de uma API sem
 * que as páginas precisem ser reescritas.
 */

export const projetos = [
  {
    titulo: "Educação para Todos",
    categoria: { texto: "Educação", tipo: "info" },
    status: { texto: "Em andamento", tipo: "sucesso" },
    imagem: {
      arquivo: "projeto-educacao",
      alt: "Ilustração de três crianças em carteiras escolares diante de uma lousa",
      largura: 400,
      altura: 260
    },
    resumo: "Aulas de reforço escolar gratuitas para crianças e adolescentes da comunidade.",
    legenda: "Turma de reforço escolar no período da tarde.",
    objetivo: "reduzir a evasão escolar com aulas de reforço gratuitas.",
    publico: "crianças e adolescentes de 7 a 15 anos.",
    destaque: true
  },
  {
    titulo: "Alimento Solidário",
    categoria: { texto: "Alimentação", tipo: "secundaria" },
    status: { texto: "Vagas abertas", tipo: "aviso" },
    imagem: {
      arquivo: "projeto-alimentos",
      alt: "Ilustração de caixas empilhadas com frutas e legumes para doação",
      largura: 400,
      altura: 260
    },
    resumo: "Arrecadação e distribuição mensal de cestas básicas para famílias cadastradas.",
    legenda: "Cestas montadas para a distribuição mensal.",
    objetivo: "garantir alimentação básica às famílias cadastradas.",
    publico: "cerca de 400 famílias por mês.",
    destaque: true
  },
  {
    titulo: "Bairro Verde",
    categoria: { texto: "Meio ambiente", tipo: "primaria" },
    status: { texto: "Em andamento", tipo: "sucesso" },
    imagem: {
      arquivo: "projeto-meio-ambiente",
      alt: "Ilustração de duas pessoas em um gramado entre árvores recém-crescidas",
      largura: 400,
      altura: 260
    },
    resumo: "Plantio de mudas e educação ambiental nas praças e escolas do bairro.",
    legenda: "Mutirão de plantio de mudas na praça do bairro.",
    objetivo: "recuperar áreas verdes e promover educação ambiental.",
    publico: "moradores e escolas da região.",
    destaque: false
  }
];

export const campanhas = [
  {
    titulo: "Campanha do Agasalho",
    status: { texto: "Urgente", tipo: "erro" },
    meta: "arrecadar 2.000 peças até o fim do inverno.",
    quantidade: 2000,
    arrecadado: 1480,
    unidade: "peças",
    itens: ["Casacos e blusas", "Cobertores", "Meias e toucas"]
  },
  {
    titulo: "Material Escolar",
    status: { texto: "Em andamento", tipo: "sucesso" },
    meta: "montar 300 kits para o início do ano letivo.",
    quantidade: 300,
    arrecadado: 120,
    unidade: "kits",
    itens: ["Cadernos e lápis", "Mochilas", "Livros de literatura infantil"]
  },
  {
    titulo: "Cesta Solidária",
    status: { texto: "Permanente", tipo: "neutra" },
    meta: "garantir 400 cestas básicas todos os meses.",
    quantidade: 400,
    arrecadado: 352,
    unidade: "cestas neste mês",
    itens: ["Arroz, feijão e óleo", "Leite em pó", "Produtos de higiene"]
  }
];

/* Percentual da meta já arrecadado (0 a 100), usado nos cartões e no gráfico */
export function percentualArrecadado(campanha) {
  return Math.min(100, Math.round((campanha.arrecadado / campanha.quantidade) * 100));
}

export const institucional = [
  { titulo: "Missão", texto: "Promover a dignidade e a inclusão social de pessoas em situação de vulnerabilidade." },
  { titulo: "Visão", texto: "Ser referência regional em projetos sociais transparentes e de impacto duradouro." },
  {
    titulo: "Valores",
    itens: ["Solidariedade", "Transparência", "Respeito à diversidade", "Compromisso com a comunidade"]
  }
];

export const areasVoluntariado = [
  { area: "Reforço escolar", detalhe: "4 horas semanais; ensino médio completo." },
  { area: "Montagem de cestas", detalhe: "1 sábado por mês; sem requisitos." },
  { area: "Plantio e jardinagem", detalhe: "mutirões mensais; sem requisitos." },
  { area: "Comunicação e redes sociais", detalhe: "remoto, 3 horas semanais." }
];

export const estados = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"],
  ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
  ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
  ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"]
];
