import useReducedMotion from "../hooks/useReducedMotion";
import "./Hero.css";

export default function Hero({ children }) {
  const reduzir = useReducedMotion();
  return <section id="inicio" className="hero" aria-labelledby="hero-titulo">
    <h1 id="hero-titulo" className="sr-only">Isaac de Castro Silva — Desenvolvedor de Software</h1>
    <div className="hero-arte"><img src={reduzir ? "/player-one-poster.png" : "/player-one.gif"} alt="Silhueta humana animada formada por pontos coloridos." width="480" height="480" fetchPriority="high" decoding="async" />{children}</div>
  </section>;
}
