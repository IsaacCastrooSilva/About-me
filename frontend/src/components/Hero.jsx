import { ArrowDown, ArrowUpRight } from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";
import "./Hero.css";

export default function Hero({ children }) {
  const reduzir = useReducedMotion();
  return <section id="inicio" className="hero" aria-labelledby="hero-titulo">
    <div className="hero-copy">
      <p className="eyebrow"><span className="status-ponto" aria-hidden="true" />CURIOSIDADE. CÓDIGO. CONEXÕES.</p>
      <h1 id="hero-titulo">Isaac<span>— Desenvolvedor<br />de Software</span></h1>
      <p className="hero-valor">Transformo curiosidade em código e ideias em experiências digitais.</p>
      <p className="hero-contexto">Conheça meu trabalho. Ou puxe uma conversa com a IA que conta um pouco mais sobre mim.</p>
      <div className="hero-acoes"><a href="#cube-ai" className="botao-primario">Falar com a Cube AI<ArrowUpRight size={18} aria-hidden="true" /></a><a href="#sobre" className="botao-texto">Sobre mim<ArrowDown size={16} aria-hidden="true" /></a></div>
    </div>
    <div className="hero-arte"><span className="arte-legenda" aria-hidden="true">ISAAC / HUMAN IN THE LOOP</span><img src={reduzir ? "/player-one-poster.png" : "/player-one.gif"} alt="Silhueta humana formada por pontos de luz, em estilo digital." width="480" height="480" fetchPriority="high" decoding="async" />{children}</div>
    <a href="#sobre" className="indicador-scroll"><span aria-hidden="true">↓</span>UM POUCO MAIS ABAIXO</a>
  </section>;
}
