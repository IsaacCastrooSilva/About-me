import { useState } from "react";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import "./TheodorPreview.css";

const EXEMPLOS = [
  {
    assunto: "Sobre mim",
    pergunta: "Quem é o Isaac?",
    resposta: "Isaac é desenvolvedor de software e estudante de Análise e Desenvolvimento de Sistemas. Trabalha com sistemas web, integrações de APIs e automação de processos.",
  },
  {
    assunto: "Projetos",
    pergunta: "O que é o Theodor AI?",
    resposta: "É a inteligência artificial que Isaac desenvolveu para este portfólio. Você pode conversar sobre sua trajetória e seus projetos, com respostas baseadas nas informações que ele compartilhou.",
  },
  {
    assunto: "Tecnologias",
    pergunta: "Com quais tecnologias o Isaac trabalha?",
    resposta: "No trabalho, Isaac usa principalmente ColdFusion e SQL Server. Em seus estudos e projetos, também explora Java, Spring Boot, React e inteligência artificial.",
  },
];

export default function TheodorPreview({ onIniciarConversa, ocupado = false }) {
  const [assuntoAtivo, setAssuntoAtivo] = useState(0);
  const exemplo = EXEMPLOS[assuntoAtivo];

  return <section id="projetos" className="theodor-destaque secao" aria-labelledby="projeto-titulo" data-reveal>
    <div className="theodor-copy">
      <div className="theodor-marca"><span className="theodor-simbolo" aria-hidden="true"><Sparkles size={18} /></span>Theodor AI<span className="theodor-marca-traco" aria-hidden="true" />Meu assistente</div>
      <h2 id="projeto-titulo">Meu portfólio.<br /><span>Sua próxima conversa.</span></h2>
      <p className="theodor-descricao">Conheça meus projetos, minha experiência e as tecnologias com que trabalho. Escolha um assunto ou pergunte do seu jeito.</p>
      <button className="botao-primario theodor-cta" type="button" onClick={() => onIniciarConversa()} disabled={ocupado}>Conversar com o Theodor<ArrowRight size={18} aria-hidden="true" /></button>
      <p className="theodor-nota">Uma pergunta é um bom começo. Sem cadastro.</p>
    </div>

    <div className="preview-painel" role="region" aria-label="Demonstração do Theodor AI">
      <div className="preview-topo">
        <div className="preview-identidade"><span className="preview-avatar" aria-hidden="true"><MessageSquare size={19} /></span><div><strong>Theodor AI</strong><span>Conheça o Isaac em uma conversa</span></div></div>
        <span className="preview-selo">Prévia</span>
      </div>

      <div className="preview-conteudo">
        <p className="preview-instrucao" id="preview-assuntos-titulo">Explore uma pergunta</p>
        <div className="preview-assuntos" role="group" aria-labelledby="preview-assuntos-titulo">
          {EXEMPLOS.map((item, indice) => <button key={item.assunto} type="button" aria-pressed={assuntoAtivo === indice} aria-controls="preview-exemplo" onClick={() => setAssuntoAtivo(indice)}>{item.assunto}</button>)}
        </div>

        <div className="preview-conversa" id="preview-exemplo" aria-live="polite" aria-atomic="true">
          <p className="preview-pergunta"><span className="sr-only">Pergunta de exemplo: </span>{exemplo.pergunta}</p>
          <div className="preview-resposta">
            <div className="preview-autor"><Sparkles size={15} aria-hidden="true" /><strong>Theodor AI</strong><span>Resposta de exemplo</span></div>
            <p>{exemplo.resposta}</p>
          </div>
        </div>
      </div>

      <div className="preview-rodape">
        <button type="button" className="preview-continuar" onClick={() => onIniciarConversa(exemplo.pergunta)} disabled={ocupado}><span>Levar esta pergunta para o chat</span><span className="preview-seta" aria-hidden="true"><ArrowRight size={18} /></span></button>
        <p>Você pode editar a pergunta antes de enviar.</p>
      </div>
    </div>
  </section>;
}