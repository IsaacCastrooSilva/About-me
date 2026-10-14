import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageSquare, Sparkles } from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";

const RESPOSTA = "O Isaac é desenvolvedor de software, tem 19 anos e já trabalha na área. É apaixonado por tecnologia. Quer saber mais sobre seus projetos ou habilidades?";

export default function CubePreview() {
  const painelRef = useRef(null);
  const [iniciou, setIniciou] = useState(false);
  const [letras, setLetras] = useState(0);
  const reduzir = useReducedMotion();
  useEffect(() => {
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) { setIniciou(true); observador.disconnect(); }
    }, { threshold: 0.2 });
    observador.observe(painelRef.current);
    return () => observador.disconnect();
  }, []);
  useEffect(() => {
    if (!iniciou || reduzir) return;
    let timer;
    let indice = 0;
    const digitar = () => {
      indice += 1;
      setLetras(indice);
      if (indice < RESPOSTA.length) timer = setTimeout(digitar, 25);
    };
    timer = setTimeout(digitar, 700);
    return () => clearTimeout(timer);
  }, [iniciou, reduzir]);
  const completo = reduzir || letras === RESPOSTA.length;
  return <section id="projetos" className="cube-destaque secao" aria-labelledby="projeto-titulo" data-reveal>
    <div className="cube-copy"><p className="eyebrow">02 / PROJETO EM DESTAQUE</p><h2 id="projeto-titulo">Meu portfólio.<br />Sua próxima conversa.</h2><p className="cube-nome">Cube AI <Sparkles size={19} aria-hidden="true" /></p><p>Uma forma mais direta de me conhecer. Pergunte sobre meus projetos, habilidades ou trajetória — a Cube AI conecta as respostas.</p><a href="#cube-ai" className="botao-primario">Experimentar a Cube AI<ArrowUpRight size={18} aria-hidden="true" /></a><span className="cube-legenda">SUAS PERGUNTAS. UM POUCO MAIS DE MIM.</span></div>
    <div ref={painelRef} className="preview-painel" aria-label="Exemplo demonstrativo de conversa com a Cube AI"><div className="preview-topo"><span><MessageSquare size={17} aria-hidden="true" />Cube AI</span><span className="preview-selo">EXEMPLO</span></div><div className="preview-corpo"><p className="preview-pergunta">Quem é o Isaac?</p><div className="preview-autor"><Sparkles size={16} aria-hidden="true" /><span>Cube AI</span></div><span className="sr-only">{RESPOSTA}</span><div className="preview-resposta" aria-hidden="true"><span className="preview-reserva">{RESPOSTA}</span><span className="preview-digitada">{reduzir ? RESPOSTA : RESPOSTA.slice(0, letras)}{!completo && <span className="preview-cursor">▍</span>}</span></div>{!completo && <span className="preview-status" aria-hidden="true"><i /><i /><i />Digitando</span>}</div><div className="preview-rodape"><span>Uma curiosidade já é um começo.</span><ArrowUpRight size={17} aria-hidden="true" /></div></div>
  </section>;
}
