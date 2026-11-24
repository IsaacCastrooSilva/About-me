import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import "./Navigation.css";

const LINKS = [
  { id: "inicio", texto: "Início" },
  { id: "sobre", texto: "Sobre mim" },
  { id: "projetos", texto: "Meu projeto" },
  { id: "theodor-ai", texto: "Vamos conversar" },
];

export default function Navigation() {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState("inicio");
  const [compacto, setCompacto] = useState(() => window.scrollY > 24);
  const headerRef = useRef(null);
  const botaoRef = useRef(null);
  // O tema inicial já foi aplicado no index.html (antes de a página aparecer).
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme === "light" ? "light" : "dark");
  function alternarTema() {
    const novo = tema === "light" ? "dark" : "light";
    setTema(novo);
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem("tema", novo); } catch { /* sem armazenamento: vale só nesta visita */ }
  }
  useEffect(() => {
    const observador = new IntersectionObserver(entradas => {
      const visivel = entradas.find(entrada => entrada.isIntersecting);
      if (visivel) setAtivo(visivel.target.id);
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    LINKS.forEach(({ id }) => { const secao = document.getElementById(id); if (secao) observador.observe(secao); });
    const aoRolar = () => {
      setCompacto(window.scrollY > 24);
      // Barra de progresso de leitura na base do cabeçalho.
      const total = document.documentElement.scrollHeight - window.innerHeight;
      headerRef.current?.style.setProperty("--progresso", total > 0 ? Math.min(1, window.scrollY / total).toFixed(4) : "0");
    };
    aoRolar();
    const aoClicarFora = evento => { if (!headerRef.current?.contains(evento.target)) setAberto(false); };
    const aoRedimensionar = () => { if (window.innerWidth >= 768) setAberto(false); };
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    document.addEventListener("pointerdown", aoClicarFora);
    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRedimensionar);
      document.removeEventListener("pointerdown", aoClicarFora);
    };
  }, []);
  return <header ref={headerRef} className={"site-header" + (compacto ? " compacto" : "")} onKeyDown={evento => {
    if (evento.key === "Escape" && aberto) { setAberto(false); botaoRef.current?.focus(); }
  }}><div className="nav-container">
    <button className="tema-botao" type="button" onClick={alternarTema} aria-label={tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"} title={tema === "light" ? "Modo escuro" : "Modo claro"}>{tema === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</button>
    <button ref={botaoRef} className="nav-toggle" aria-label={aberto ? "Fechar menu" : "Abrir menu"} aria-expanded={aberto} aria-controls="menu-principal" onClick={() => setAberto(atual => !atual)}>{aberto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    <nav id="menu-principal" className={"nav-panel" + (aberto ? " aberto" : "")} aria-label="Navegação principal">
      {LINKS.map(({ id, texto }) => <a key={id} href={`#${id}`} aria-current={ativo === id ? "location" : undefined} onClick={() => { setAtivo(id); setAberto(false); }}><span className="nav-marcador" aria-hidden="true">&gt;</span>{texto}{id === "theodor-ai" && <ArrowUpRight size={15} aria-hidden="true" />}</a>)}
    </nav>
  </div></header>;
}
