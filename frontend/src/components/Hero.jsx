import { ArrowDown, ArrowUpRight } from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";
import "./Hero.css";

export default function Hero({ children }) {
  const reduzir = useReducedMotion();
  return <section id="inicio" className="hero" aria-labelledby="hero-titulo">
    <div className="hero-copy">
      <p className="eyebrow"><span className="status-ponto" aria-hidden="true" /></p>
      <h1 id="hero-titulo">Isaac de Castro Silva<span>Desenvolvedor<br />de Software</span></h1>
      <p className="hero-valor">Barueri, São Paulo - Brasil </p>
      <p className="hero-contexto"></p>
      <div className="hero-acoes"><a href="#cube-ai" className="botao-primario">Falar com a minha IA<ArrowUpRight size={18} aria-hidden="true" /></a><a href="#sobre" className="botao-texto">Sobre mim<ArrowDown size={16} aria-hidden="true" /></a></div>
    </div>
  </section>;
}
