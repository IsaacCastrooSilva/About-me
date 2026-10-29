import { ArrowDown, ArrowUpRight } from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";
import "./Hero.css";

export default function Hero() {
  const reduzir = useReducedMotion();
  return <section id="inicio" className="hero" aria-labelledby="hero-titulo">
    <div className="hero-copy">
      <h1 id="hero-titulo">Isaac de Castro Silva<span className="hero-cargo">Desenvolvedor<br />de Software<br />Backend</span></h1>
      <p className="hero-valor">Barueri, São Paulo - Brasil</p>
    </div>
    <div className="hero-visual">
      <div className="hero-arte">
        <img src={reduzir ? "/hero-eye-poster.png" : "/hero-eye.gif"} alt="" width="480" height="480" fetchPriority="high" decoding="async" />
      </div>
      <div className="hero-acoes"><a href="#theodor-ai" className="botao-primario">Falar com a minha IA<ArrowUpRight size={18} aria-hidden="true" /></a><a href="#sobre" className="botao-texto">Sobre mim<ArrowDown size={16} aria-hidden="true" /></a></div>
    </div>
  </section>;
}
