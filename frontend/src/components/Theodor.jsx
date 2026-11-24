import { ArrowRight, Database, Search, Send, Sparkles } from "lucide-react";
import Pixels from "./Pixels";
import "./Theodor.css";

// O caminho real de uma pergunta dentro do backend. Cada etapa tem uma das
// três cores do site; a resposta final junta as três.
const ETAPAS = [
  {
    titulo: "A pergunta chega na API",
    texto: "A interface em React envia a mensagem para uma API REST em Java com Spring Boot.",
    Icone: Send,
    cor: "var(--pixel-r)",
    tags: ["React", "Spring Boot", "API REST"],
  },
  {
    titulo: "Busca semântica na base",
    texto: "Uma base de conhecimento escrita por mim é dividida em trechos com embeddings. Os mais próximos da pergunta são recuperados por similaridade de cosseno.",
    Icone: Search,
    cor: "var(--pixel-g)",
    tags: ["Embeddings", "Similaridade de cosseno"],
  },
  {
    titulo: "Memória da conversa",
    texto: "O histórico fica salvo em banco H2 com JPA/Hibernate e é compactado em um resumo para controlar o tamanho do contexto.",
    Icone: Database,
    cor: "var(--pixel-b)",
    tags: ["H2", "JPA/Hibernate"],
  },
  {
    titulo: "Resposta com fallback",
    texto: "O Groq gera a resposta a partir dos trechos recuperados. Se ele estiver indisponível, o Gemini assume.",
    Icone: Sparkles,
    cor: "var(--texto)",
    final: true,
    tags: ["Groq · principal", "Gemini · reserva"],
  },
];

const STACK = ["React", "Vite", "Java", "Spring Boot", "JPA/Hibernate", "H2", "Groq", "Gemini"];

export default function Theodor({ onIniciarConversa, ocupado = false }) {
  return <section id="projetos" className="theodor secao" aria-labelledby="projeto-titulo" data-reveal>
    <div className="secao-topo"><p className="rotulo"><Pixels />Meu projeto</p><p className="rotulo">Theodor AI</p></div>
    <div className="theodor-grade">
      <div className="theodor-copy">
        <h2 id="projeto-titulo">Uma IA que eu construí para responder sobre mim.</h2>
        <p className="theodor-descricao">O Theodor conversa sobre minha trajetória, meus projetos e as tecnologias com que trabalho. Ele responde com base no que eu escrevi e segue regras para não inventar o que não sabe.</p>
        <button className="botao-primario" type="button" onClick={() => onIniciarConversa()} disabled={ocupado}>Conversar com o Theodor<ArrowRight size={18} aria-hidden="true" /></button>
        <figure className="theodor-previa" aria-label="Exemplo de conversa com o Theodor">
          <figcaption><Pixels />exemplo de conversa</figcaption>
          <p className="previa-pergunta"><span aria-hidden="true">&gt;</span> Quais tecnologias ele usa no trabalho?</p>
          <p className="previa-resposta"><strong>Theodor</strong>No dia a dia, Isaac trabalha principalmente com <b>ColdFusion</b> e <b>SQL Server</b>, mantendo sistemas corporativos web e integrando APIs.</p>
          <button type="button" className="previa-acao" onClick={() => onIniciarConversa("Quais tecnologias ele usa no trabalho?")} disabled={ocupado}>Perguntar isso ao Theodor<ArrowRight size={14} aria-hidden="true" /></button>
        </figure>
      </div>
      <div className="theodor-funcionamento">
        <h3 className="theodor-subtitulo">Como ele funciona</h3>
        <p className="fluxo-ponta" aria-hidden="true"><span>›</span>sua pergunta</p>
        <ol className="theodor-etapas">
          {ETAPAS.map(({ titulo, texto, Icone, cor, tags, final }, indice) => <li key={titulo} className={final ? "etapa-final" : undefined} style={{ "--cor": cor, "--i": indice }}>
            <span className="etapa-no" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
            <div className="etapa-cartao">
              <h4><Icone size={18} aria-hidden="true" />{titulo}</h4>
              <p>{texto}</p>
              <ul className="etapa-tags" aria-label="Tecnologias desta etapa">{tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </li>)}
        </ol>
        <p className="fluxo-ponta" aria-hidden="true"><span>‹</span>resposta do Theodor</p>
        <ul className="theodor-stack" aria-label="Tecnologias do Theodor AI">{STACK.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  </section>;
}
