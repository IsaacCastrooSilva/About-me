// Perguntas de continuação mostradas depois de cada resposta do Theodor.
// Só entram perguntas que a base de conhecimento do backend sabe responder
// (src/main/resources/knowledge). Ao adicionar um assunto lá, adicione aqui.
const TOPICOS = [
  {
    chaves: ["projeto", "theodor", "cantina", "rodar", "rag", "embedding", "desk", "friends", "agente", "claude"],
    perguntas: ["Como o Theodor AI funciona por dentro?", "O que é o Desk-Friends?", "Quais outros projetos o Isaac já fez?", "O que foi o projeto da Cantina Escolar?"],
  },
  {
    chaves: ["trabalh", "experiência", "experiencia", "itpower", "júnior", "junior", "empresa", "cargo", "profission"],
    perguntas: ["O que o Isaac faz na ITpower?", "Quais tecnologias ele usa no trabalho?","Em quais projetos ele atua no trabalho?"],
  },
  {
    chaves: ["tecnologia", "java", "spring", "react", "sql", "coldfusion", "python", "habilidade", "linguage", "ferramenta"],
    perguntas: ["Quais tecnologias ele usa no dia a dia do trabalho?", "O que ele está estudando agora?", "Qual a experiência dele com Java?"],
  },
  {
    chaves: ["formação", "formacao", "faculdade", "unip", "curso", "estud", "graduação", "técnico", "idioma", "inglês"],
    perguntas: ["Qual é a formação do Isaac?", "Quais cursos ele fez por fora da faculdade?", "Quais são os objetivos profissionais dele?"],
  },
  {
    chaves: ["guitarra", "música", "musica", "banda", "rock", "metal", "hobby", "hobbies", "lazer", "academia", "filme", "jogo", "curiosidade"],
    perguntas: ["Quais bandas o Isaac curte?", "Que guitarra ele toca?", "O que ele gosta de fazer além de programar?", "Quais filmes ele gosta?"],
  },
  {
    chaves: ["contato", "e-mail", "email", "linkedin", "github", "falar com", "oportunidade"],
    perguntas: ["Como entro em contato com o Isaac?"],
  },
];

const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "").trim();

// Devolve até `limite` perguntas: primeiro aprofunda o assunto da última troca,
// depois abre para assuntos que ainda não apareceram na conversa.
export default function sugerirContinuacoes(mensagens, limite = 3) {
  if (!mensagens.length) return [];
  const feitas = new Set(mensagens.filter(m => m.autor === "user").map(m => normalizar(m.texto)));
  const ultimaTroca = mensagens.slice(-2).map(m => m.texto).join(" ").toLowerCase();
  const conversaToda = mensagens.map(m => m.texto).join(" ").toLowerCase();
  const contar = (texto, chaves) => chaves.filter(chave => texto.includes(chave)).length;
  const livres = topico => topico.perguntas.filter(pergunta => !feitas.has(normalizar(pergunta)));

  const porRelevancia = [...TOPICOS].sort((a, b) => contar(ultimaTroca, b.chaves) - contar(ultimaTroca, a.chaves));
  const atual = contar(ultimaTroca, porRelevancia[0].chaves) > 0 ? porRelevancia[0] : null;
  const outros = TOPICOS.filter(topico => topico !== atual).sort((a, b) => contar(conversaToda, a.chaves) - contar(conversaToda, b.chaves));

  const escolhidas = atual ? livres(atual).slice(0, 2) : [];
  for (const topico of outros) {
    if (escolhidas.length >= limite) break;
    const [proxima] = livres(topico);
    if (proxima) escolhidas.push(proxima);
  }
  return escolhidas.slice(0, limite);
}
