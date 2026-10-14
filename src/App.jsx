import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import ContentGrid from "./components/ContentGrid";
import Sobre from "./components/Sobre";
import CubePreview from "./components/CubePreview";
import Icon from "./components/Icon";
import useReveal from "./hooks/useReveal";
import useReducedMotion from "./hooks/useReducedMotion";
import "./App.css";

const API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:8080/api/chat";

const sugestoes = [
  { icone: "brain", titulo: "Sobre mim", pergunta: "Quem é o Isaac?" },
  { icone: "project", titulo: "Projetos", pergunta: "Quais projetos o Isaac desenvolveu?" },
  { icone: "verified", titulo: "Habilidades", pergunta: "Quais são as principais habilidades do Isaac?" },
  { icone: "fileplus", titulo: "Contato", pergunta: "Como posso entrar em contato com o Isaac?" },
];
const FRASES_CAMPO = [
  "O que você quer saber sobre o Isaac?",
  "Pergunte sobre os projetos dele…",
  "Quer conhecer a trajetória dele?",
  "Quais tecnologias ele usa?",
  "Descubra o que ele está estudando…",
  "Qual é o próximo objetivo dele?",
  "Curioso sobre a Cube AI?",
  "Vamos falar de código?",
  "E fora do trabalho, o que ele curte?",
  "Pode perguntar do seu jeito…",
];

const TEMPO_LEITURA = 10000;
const TEMPO_TRANSICAO = 1800;

function SugestaoAnimada() {
  const [estado, setEstado] = useState({ indice: 0, fase: "parada" });
  useEffect(() => {
    const timer = setTimeout(() => {
      setEstado(atual => {
        if (atual.fase === "parada") return { ...atual, fase: "saindo" };
        if (atual.fase === "saindo") return { indice: (atual.indice + 1) % FRASES_CAMPO.length, fase: "entrando" };
        return { ...atual, fase: "parada" };
      });
    }, estado.fase === "parada" ? TEMPO_LEITURA : TEMPO_TRANSICAO);
    return () => clearTimeout(timer);
  }, [estado]);
  return <span className="placeholder-rotativo" style={{ '--tempo-transicao': TEMPO_TRANSICAO + 'ms' }} aria-hidden="true"><span key={estado.indice} className={estado.fase}>{FRASES_CAMPO[estado.indice]}</span></span>;
}

function criarConversa() {
  return { id: crypto.randomUUID(), titulo: "Nova conversa", mensagens: [] };
}

const FRASES_ABERTURA = [
  "Olá, usuário!",
  "Esse é o portifolio virtual do isaac, bem legal né?",
  "Quer saber mais sobre ele?",
  "Explore essa página!",
];
function TextoDigitado() {
  const reduzirMovimento = useReducedMotion();
  const [estado, setEstado] = useState({ indice: 0, letras: 0, fase: "escrevendo" });
  const frase = FRASES_ABERTURA[estado.indice];
  useEffect(() => {
    if (reduzirMovimento) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const atraso = estado.fase === "esperando" ? 3000 : estado.fase === "apagando" ? 30 : estado.letras === 0 ? 350 : 55;
    const timer = setTimeout(() => setEstado(atual => {
      if (atual.fase === "esperando") return { ...atual, fase: "apagando" };
      if (atual.fase === "apagando") {
        if (reduzir || atual.letras <= 1) return { indice: (atual.indice + 1) % FRASES_ABERTURA.length, letras: 0, fase: "escrevendo" };
        return { ...atual, letras: atual.letras - 1 };
      }
      const letras = reduzir ? frase.length : atual.letras + 1;
      return { ...atual, letras, fase: letras >= frase.length ? "esperando" : "escrevendo" };
    }), atraso);
    return () => clearTimeout(timer);
  }, [estado, frase, reduzirMovimento]);
  return <div className="texto-terminal">
    <span className="sr-only">{FRASES_ABERTURA.join(" ")}</span>
    <div className="terminal-linha" aria-hidden="true">{reduzirMovimento ? FRASES_ABERTURA[0] : frase.slice(0, estado.letras)}<span className={"terminal-cursor" + (estado.fase === "esperando" ? " piscando" : "")}>_</span></div>
  </div>;
}

const DESCRICAO_PESSOAL = "Sou desenvolvedor de software e apaixonado por tecnologia. Tenho 19 anos e já trabalho na área.";

function DescricaoDigitada() {
  const reduzirMovimento = useReducedMotion();
  const descricaoRef = useRef(null);
  const [iniciou, setIniciou] = useState(false);
  const [letras, setLetras] = useState(0);
  useEffect(() => {
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      setIniciou(true);
      observador.disconnect();
    }, { threshold: 0.35 });
    observador.observe(descricaoRef.current);
    return () => observador.disconnect();
  }, []);
  useEffect(() => {
    if (!iniciou || reduzirMovimento || letras >= DESCRICAO_PESSOAL.length) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setLetras(atual => reduzir ? DESCRICAO_PESSOAL.length : atual + 1), reduzir ? 0 : 45);
    return () => clearTimeout(timer);
  }, [iniciou, letras, reduzirMovimento]);
  return <p ref={descricaoRef} className="descricao-digitada"><span className="sr-only">{DESCRICAO_PESSOAL}</span><span className="descricao-reserva" aria-hidden="true">{DESCRICAO_PESSOAL}<span>_</span></span><span className="descricao-visivel" aria-hidden="true">{reduzirMovimento ? DESCRICAO_PESSOAL : DESCRICAO_PESSOAL.slice(0, letras)}{iniciou && <span className={"terminal-cursor" + (letras === DESCRICAO_PESSOAL.length ? " piscando" : "")}>_</span>}</span></p>;
}

function App() {
  useReveal();
  // Conversas desta sessão: cada uma tem seu próprio contexto na API.
  const [conversas, setConversas] = useState(() => [criarConversa()]);
  const [ativaId, setAtivaId] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = useState(true);
  const fimRef = useRef(null);
  const entradaRef = useRef(null);
  const menuRef = useRef(null);
  const requisicaoRef = useRef(null);
  const conversa = conversas.find((item) => item.id === ativaId) || conversas[0];
  const iniciou = conversa.mensagens.length > 0;

  useEffect(() => {
    if (!conversa.mensagens.length) return;
    fimRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [conversa.mensagens, carregando]);

  useEffect(() => {
    const campo = entradaRef.current;
    if (campo) {
      campo.style.height = "auto";
      campo.style.height = `${Math.min(campo.scrollHeight, 180)}px`;
    }
  }, [pergunta]);

  useEffect(() => () => requisicaoRef.current?.abort(), []);

  function fecharMenu() {
    setMenuAberto(false);
    menuRef.current?.focus();
  }

  function selecionarConversa(id) {
    setAtivaId(id);
    setPergunta("");
    setMenuAberto(false);
    entradaRef.current?.focus();
  }

  function novaConversa() {
    if (carregando) return;
    const vazia = conversas.find((item) => item.mensagens.length === 0);
    const nova = vazia || criarConversa();
    if (!vazia) setConversas((anteriores) => [nova, ...anteriores]);
    selecionarConversa(nova.id);
  }

  async function enviarMensagem(texto = pergunta) {
    texto = texto.trim();
    if (!texto || requisicaoRef.current) return;
    const id = conversa.id;
    const controller = new AbortController();
    requisicaoRef.current = controller;
    const atualizar = (callback) => setConversas((anteriores) => anteriores.map((item) => item.id === id ? callback(item) : item));
    atualizar((item) => ({ ...item, titulo: item.mensagens.length ? item.titulo : texto, mensagens: [...item.mensagens, { autor: "user", texto }] }));
    setPergunta("");
    setCarregando(true);
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, conversationId: id }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      if (typeof data.answer !== "string" || !data.answer.trim()) throw new Error("Resposta vazia do servidor");
      atualizar((item) => ({ ...item, mensagens: [...item.mensagens, { autor: "ai", texto: data.answer }] }));
    } catch {
      atualizar((item) => ({ ...item, mensagens: [...item.mensagens, { autor: "ai", erro: true, texto: "Não consegui obter uma resposta agora. Tente enviar sua pergunta novamente em alguns instantes." }] }));
      setPergunta(texto);
    } finally {
      clearTimeout(timeout);
      requisicaoRef.current = null;
      setCarregando(false);
      entradaRef.current?.focus();
    }
  }

  return (
    <div className={"app portfolio" + (menuAberto ? " menu-aberto" : "") + (sidebarRecolhida ? " sidebar-recolhida" : "")} onKeyDown={e => { if(e.key === "Escape" && menuAberto) fecharMenu(); }}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Navigation />
      <button className="fundo-sidebar" aria-label="Fechar conversas" tabIndex={-1} onClick={fecharMenu} />
      <aside className="sidebar" id="historico" aria-label="Conversas">
        <div className="sidebar-logo"><strong>Cube AI</strong><button className="icone-botao alternar-sidebar" onClick={() => { setSidebarRecolhida(true); requestAnimationFrame(() => menuRef.current?.focus()); }} aria-expanded={!sidebarRecolhida} aria-controls="conteudo-sidebar" aria-label={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"} title={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"}><Icon nome="panel" /></button><button className="icone-botao fechar-sidebar" onClick={fecharMenu} aria-label="Fechar conversas"><Icon nome="close" /></button></div>
        <div className="conteudo-sidebar" id="conteudo-sidebar">
        <button className="nova-conversa" onClick={novaConversa} disabled={carregando}><Icon nome="plus" />Nova conversa</button>
        <p className="sidebar-legenda">CONVERSAS</p>
        <nav className="lista-conversas" aria-label="Histórico de conversas">
          {!conversas.some(item => item.mensagens.length) && <p className="historico-vazio">Suas conversas aparecem aqui.</p>}
          {conversas.filter(item => item.mensagens.length).map(item => <button key={item.id} disabled={carregando} onClick={() => selecionarConversa(item.id)} aria-current={item.id === conversa.id ? "true" : undefined} title={item.titulo}><Icon nome="chat" /><span>{item.titulo}</span></button>)}
        </nav>
        <span className="sidebar-rodape">Um pouco mais sobre Isaac.</span>
        </div>
      </aside>
      <main id="conteudo">
        <Hero><TextoDigitado /></Hero>
        <ContentGrid />
        <Sobre><DescricaoDigitada /></Sobre>
        <CubePreview />
        <section className="secao-ia secao" id="cube-ai" aria-labelledby="chat-titulo" data-reveal>
          <div className="ia-cabecalho"><span className="eyebrow">03 / VAMOS CONVERSAR</span><button ref={menuRef} className="historico-botao" onClick={() => { if (window.matchMedia("(max-width: 767px)").matches) { setMenuAberto(!menuAberto); } else { setSidebarRecolhida(!sidebarRecolhida); } }} aria-expanded={menuAberto || !sidebarRecolhida} aria-controls="historico"><Icon nome="panel" />Conversas</button></div>
          <div className="chat-painel">
            <div className={"convite-conversa" + (iniciou ? " chat-iniciado" : "")}><span className="chat-identidade">CUBE AI</span><h2 id="chat-titulo">O que você quer descobrir<br />sobre o Isaac?</h2>{!iniciou && <p>Projetos, habilidades ou uma curiosidade.<br />Pode perguntar do seu jeito.</p>}</div>
            {iniciou && <div className="mensagens" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">{conversa.mensagens.map((mensagem,index) => <article key={index} className={"mensagem " + mensagem.autor + (mensagem.erro ? " erro" : "")} aria-label={mensagem.autor === "user" ? "Você" : "Cube AI"}>{mensagem.autor === "ai" ? <><div className="autor"><span>Cube AI</span></div><div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mensagem.texto}</ReactMarkdown></div></> : <p>{mensagem.texto}</p>}</article>)}{carregando && <div className="resposta-pendente" role="status"><span>Conectando as peças da sua resposta...</span></div>}<div ref={fimRef} /></div>}
            <label className="campo-label" htmlFor="pergunta">Sua pergunta para a Cube AI</label>
            <form className="compositor" aria-busy={carregando} onSubmit={e => { e.preventDefault(); enviarMensagem(); }}><div className="campo-pergunta"><textarea id="pergunta" ref={entradaRef} aria-describedby="ajuda-pergunta" value={pergunta} onChange={e => setPergunta(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviarMensagem(); } }} rows={1} readOnly={carregando} />{!pergunta && !carregando && <SugestaoAnimada />}</div><button className="enviar" type="submit" disabled={carregando || !pergunta.trim()} aria-label={carregando ? "Montando sua resposta" : "Enviar pergunta"} title="Enviar pergunta"><Icon nome="arrow" /></button></form>
            <p id="ajuda-pergunta" className="campo-ajuda">Enter para enviar <span aria-hidden="true">·</span> Shift + Enter para uma nova linha</p>
            <div className="perguntas-basicas" aria-label="Perguntas básicas">{sugestoes.map(item => <button key={item.titulo} disabled={carregando} onClick={() => enviarMensagem(item.pergunta)}><span>{item.titulo}</span><Icon nome={item.icone} /></button>)}</div>
          </div>
        </section>
      </main>
      <footer className="portfolio-footer"><a className="portfolio-marca" href="#inicio"><span className="ponto" />Isaac</a><span>Ideias, código e boas conversas.</span><a href="#inicio">Voltar ao topo ↑</a></footer>
    </div>
  );
}
export default App;
