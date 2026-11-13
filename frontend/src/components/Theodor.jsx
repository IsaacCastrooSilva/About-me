import { ArrowRight } from "lucide-react";
import Pixels from "./Pixels";
import "./Theodor.css";

// O caminho real de uma pergunta dentro do backend.
const ETAPAS = [
  {
    titulo: "A pergunta chega na API",
    texto: "A interface em React envia a mensagem para uma API REST em Java com Spring Boot.",
  },
  {
    titulo: "Busca semântica na base",
    texto: "Uma base de conhecimento escrita por mim é dividida em trechos com embeddings. Os mais próximos da pergunta são recuperados por similaridade de cosseno.",
  },
  {
    titulo: "Memória da conversa",
    texto: "O histórico fica salvo em banco H2 com JPA/Hibernate e é compactado em um resumo para controlar o tamanho do contexto.",
  },
  {
    titulo: "Resposta com fallback",
    texto: "O Gemini gera a resposta a partir dos trechos recuperados. Se ele estiver indisponível, o Groq assume.",
  },
];

const STACK = ["Java", "Spring Boot", "JPA/Hibernate", "H2", "Gemini", "Groq", "React", "Vite"];

export default function Theodor({ onIniciarConversa, ocupado = false }) {
  return <section id="projetos" className="theodor secao" aria-labelledby="projeto-titulo" data-reveal>
    <div className="secao-topo"><p className="rotulo"><Pixels />Meu projeto</p><p className="rotulo">Theodor AI</p></div>
    <div className="theodor-grade">
      <div className="theodor-copy">
        <h2 id="projeto-titulo">Uma IA que eu construí para responder sobre mim.</h2>
        <p className="theodor-descricao">O Theodor conversa sobre minha trajetória, meus projetos e as tecnologias com que trabalho. Ele responde com base no que eu escrevi e segue regras para não inventar o que não sabe.</p>
        <button className="botao-primario" type="button" onClick={() => onIniciarConversa()} disabled={ocupado}>Conversar com o Theodor<ArrowRight size={18} aria-hidden="true" /></button>
      </div>
      <div className="theodor-funcionamento">
        <h3 className="theodor-subtitulo">Como ele funciona</h3>
        <ol className="theodor-etapas">
          {ETAPAS.map((etapa, indice) => <li key={etapa.titulo}>
            <span className="etapa-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
            <div><h4>{etapa.titulo}</h4><p>{etapa.texto}</p></div>
          </li>)}
        </ol>
        <ul className="theodor-stack" aria-label="Tecnologias do Theodor AI">{STACK.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  </section>;
}
