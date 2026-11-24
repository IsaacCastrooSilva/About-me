import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";
import "./Hero.css";

// Em teste: o olho se inclina na direção do mouse. Troque para false para desligar.
const OLHO_SEGUE_MOUSE = true;

const limitar = valor => Math.max(-1, Math.min(1, valor));

export default function Hero() {
  const reduzir = useReducedMotion();
  const arteRef = useRef(null);

  useEffect(() => {
    const arte = arteRef.current;
    if (!OLHO_SEGUE_MOUSE || reduzir || !arte) return;
    let quadro = 0;
    const aoMover = evento => {
      if (evento.pointerType !== "mouse") return;
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const area = arte.getBoundingClientRect();
        // -1 a 1: onde o mouse está em relação ao centro do olho.
        arte.style.setProperty("--olho-x", limitar((evento.clientX - (area.left + area.width / 2)) / (window.innerWidth / 2)).toFixed(3));
        arte.style.setProperty("--olho-y", limitar((evento.clientY - (area.top + area.height / 2)) / (window.innerHeight / 2)).toFixed(3));
      });
    };
    window.addEventListener("pointermove", aoMover, { passive: true });
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("pointermove", aoMover);
      arte.style.removeProperty("--olho-x");
      arte.style.removeProperty("--olho-y");
    };
  }, [reduzir]);

  return <section id="inicio" className="hero" aria-labelledby="hero-titulo">
    <div className="hero-copy">
      <p className="hero-etiqueta">Desenvolvedor Back-end <span aria-hidden="true">·</span> Barueri, SP</p>
      <h1 id="hero-titulo">Isaac de<br />Castro Silva</h1>
      <p className="hero-valor">Trabalho com sistemas web, integrações de APIs e automação de processos. Este portfólio tem uma IA que eu construí para responder sobre mim.</p>
      <div className="hero-acoes"><a href="#theodor-ai" className="botao-primario">Falar com a minha IA<ArrowUpRight size={18} aria-hidden="true" /></a><a href="#sobre" className="botao-texto">Sobre mim<ArrowDown size={16} aria-hidden="true" /></a></div>
    </div>
    {/* Transparência proporcional ao brilho: preto some, pixels coloridos ficam com a cor original. */}
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><filter id="olho-sem-preto" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2 2 2 0 0" /></filter></svg>
    <div className="hero-arte" ref={arteRef}>
      <img src={reduzir ? "/hero-eye-poster.png" : "/hero-eye.gif"} alt="" width="480" height="480" fetchPriority="high" decoding="async" />
    </div>
  </section>;
}
