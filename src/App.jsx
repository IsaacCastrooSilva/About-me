import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:8080/api/chat";

function Icon({ nome, ...props }) {
  const caminhos = {
    brain: <><path d="M12 5a3 3 0 0 0-5.8-1A3.8 3.8 0 0 0 3 9.8a4 4 0 0 0 .8 7.1A3.5 3.5 0 0 0 10.5 20L12 19V5Zm0 0a3 3 0 0 1 5.8-1A3.8 3.8 0 0 1 21 9.8a4 4 0 0 1-.8 7.1 3.5 3.5 0 0 1-6.7 3.1L12 19" /><path d="M6.2 4A3 3 0 0 0 7 8m-4 2a3 3 0 0 1 4 3m-3.2 3.9A3 3 0 0 0 7 16m10.8-12A3 3 0 0 1 17 8m4 2a3 3 0 0 0-4 3m3.2 3.9A3 3 0 0 1 17 16" /></>,
    verified: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.7 2.7L16 9.5" /></>,
    project: <><path d="M12 4v12M6 10h12M6 21h12" /></>,
    fileplus: <><path d="M7 16H5V3h9l5 5v8h-2M14 3v5h5M5 20h6m-3-3v6m5-3h6m-3-3v6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M12 19V5m-6 6 6-6 6 6" />,
    panel: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>,
    chat: <path d="M20 11.5a8 8 0 0 1-8 8H4l1.3-4A8 8 0 1 1 20 11.5Z" />,
    person: <><circle cx="12" cy="8" r="3" /><path d="M5 20v-2a7 7 0 0 1 14 0v2" /></>,
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{caminhos[nome]}</svg>;
}

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
  const [estado, setEstado] = useState({ indice: 0, letras: 0, fase: "escrevendo" });
  const frase = FRASES_ABERTURA[estado.indice];
  useEffect(() => {
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
  }, [estado, frase]);
  return <div className="texto-terminal">
    <span className="sr-only">{FRASES_ABERTURA.join(" ")}</span>
    <div className="terminal-linha" aria-hidden="true">{frase.slice(0, estado.letras)}<span className={"terminal-cursor" + (estado.fase === "esperando" ? " piscando" : "")}>_</span></div>
  </div>;
}

const DESCRICAO_PESSOAL = "Sou um desenvolvedor de software sou apaixonado por tecnologia, tenho 19 anos e já estou trabalhando na área.";

function DescricaoDigitada() {
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
    if (!iniciou || letras >= DESCRICAO_PESSOAL.length) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setLetras(atual => reduzir ? DESCRICAO_PESSOAL.length : atual + 1), reduzir ? 0 : 45);
    return () => clearTimeout(timer);
  }, [iniciou, letras]);
  return <p ref={descricaoRef} className="descricao-digitada"><span className="sr-only">{DESCRICAO_PESSOAL}</span><span className="descricao-reserva" aria-hidden="true">{DESCRICAO_PESSOAL}<span>_</span></span><span className="descricao-visivel" aria-hidden="true">{DESCRICAO_PESSOAL.slice(0, letras)}{iniciou && <span className={"terminal-cursor" + (letras === DESCRICAO_PESSOAL.length ? " piscando" : "")}>_</span>}</span></p>;
}

function App() {
  const [glitchAtivo, setGlitchAtivo] = useState(null);
  const glitchTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(glitchTimerRef.current), []);

  function navegarComGlitch(evento) {
    evento.preventDefault();
    const destino = evento.currentTarget.getAttribute("href");
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.history.pushState(null, "", destino);
    document.getElementById(destino.slice(1))?.scrollIntoView({ behavior: reduzirMovimento ? "instant" : "smooth", block: "start" });
    clearTimeout(glitchTimerRef.current);
    glitchTimerRef.current = null;
    if (reduzirMovimento) {
      setGlitchAtivo(null);
      return;
    }
    setGlitchAtivo(destino);
    glitchTimerRef.current = setTimeout(() => {
      setGlitchAtivo(null);
      glitchTimerRef.current = null;
    }, 800);
  }
  const [topbarCompacta, setTopbarCompacta] = useState(() => window.scrollY > 24);
  useEffect(() => {
    const atualizarTopbar = () => setTopbarCompacta(window.scrollY > 24);
    atualizarTopbar();
    window.addEventListener("scroll", atualizarTopbar, { passive: true });
    return () => window.removeEventListener("scroll", atualizarTopbar);
  }, []);
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
    <div id="inicio" className={"app portfolio" + (menuAberto ? " menu-aberto" : "") + (sidebarRecolhida ? " sidebar-recolhida" : "")} onKeyDown={e => { if(e.key === "Escape" && menuAberto) fecharMenu(); }}>
      <header className={"portfolio-header" + (topbarCompacta ? " topbar-compacta" : "")}>
        <div className="header-acoes"><nav aria-label="Navegação principal"><a href="#inicio" onClick={navegarComGlitch}><span className={glitchAtivo === "#inicio" ? "glitch-palavra" : undefined}>Início</span></a><a href="#projetos" onClick={navegarComGlitch}><span className={glitchAtivo === "#projetos" ? "glitch-palavra" : undefined}>Meu projeto</span></a><a href="#cube-ai" onClick={navegarComGlitch}><span className={glitchAtivo === "#cube-ai" ? "glitch-palavra" : undefined}>Vamos conversar</span> <span aria-hidden="true">↗</span></a></nav></div>
      </header>
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
      <main>
        <section className="abertura-player" aria-label="Animação de abertura"><div className="abertura-conteudo"><img src="/player-one.gif" alt="Silhueta animada formada por pontos coloridos." width="480" height="480" fetchPriority="high" /><TextoDigitado /></div></section>
        <section className="espaco-apresentacao" aria-label="Apresentação pessoal"><div className="retangulo-apresentacao"><DescricaoDigitada /></div><img className="gif-apresentacao" src="/digital-art-glitch.gif" alt="Retrato em preto e branco com efeitos digitais coloridos animados." width="480" height="270" loading="lazy" /></section>
        <section className="projeto-destaque" id="projetos" aria-labelledby="projeto-titulo">
          <div className="projeto-resumo"><div><h2 id="projeto-titulo"><span className="ponto" />Cube AI</h2><p className="rotulo">PORTFÓLIO INTERATIVO · INTELIGÊNCIA ARTIFICIAL</p></div><div><p>Um portfólio que também conversa. Conheça meus projetos, habilidades e trajetória fazendo perguntas do seu jeito.</p><a className="link-editorial" href="#cube-ai">Conheça a Cube AI <span aria-hidden="true">↗</span></a></div></div>
          <a className="projeto-visual" href="#cube-ai" aria-label="Experimentar a Cube AI"><span className="visual-legenda">CONHECER COMEÇA COM UMA PERGUNTA.</span><div className="visual-cubo"><span>Cube AI<span className="visual-subtitulo">Conectando ideias. Uma conversa por vez.</span></span></div><span className="visual-rodape">Uma experiência feita para explorar.<span className="visual-seta" aria-hidden="true">↗</span></span></a>
        </section>
        <section className="secao-ia" id="cube-ai" aria-label="Converse com a Cube AI">
          <div className="ia-cabecalho"><span className="ia-identidade">Cube AI</span><button ref={menuRef} className="historico-botao" onClick={() => { if (window.matchMedia("(max-width: 760px)").matches) { setMenuAberto(!menuAberto); } else { setSidebarRecolhida(!sidebarRecolhida); } }} aria-expanded={menuAberto || !sidebarRecolhida} aria-controls="historico"><Icon nome="panel" />Conversas</button></div>
          <div className="chat-painel">
            {!iniciou && <div className="convite-conversa"><p className="rotulo">AGORA É COM VOCÊ</p><h2>O que você quer descobrir<br />sobre o Isaac?</h2><p>Toda conversa começa com uma curiosidade.</p></div>}
            {iniciou && <div className="mensagens" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">{conversa.mensagens.map((mensagem,index) => <article key={index} className={"mensagem " + mensagem.autor + (mensagem.erro ? " erro" : "")} aria-label={mensagem.autor === "user" ? "Você" : "Cube AI"}>{mensagem.autor === "ai" ? <><div className="autor"><span>Cube AI</span></div><div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mensagem.texto}</ReactMarkdown></div></> : <p>{mensagem.texto}</p>}</article>)}{carregando && <div className="resposta-pendente" role="status"><span>Conectando as peças da sua resposta...</span></div>}<div ref={fimRef} /></div>}
            <form className="compositor" onSubmit={e => { e.preventDefault(); enviarMensagem(); }}><label className="sr-only" htmlFor="pergunta">Sua pergunta sobre o Isaac</label><div className="campo-pergunta"><textarea id="pergunta" ref={entradaRef} value={pergunta} onChange={e => setPergunta(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviarMensagem(); } }} rows={1} readOnly={carregando} />{!pergunta && !carregando && <SugestaoAnimada />}</div><button className="enviar" type="submit" disabled={carregando || !pergunta.trim()} aria-label={carregando ? "Montando sua resposta" : "Enviar pergunta"} title="Enviar pergunta"><Icon nome="arrow" /></button></form>
            <div className="perguntas-basicas" aria-label="Perguntas básicas">{sugestoes.map(item => <button key={item.titulo} disabled={carregando} onClick={() => enviarMensagem(item.pergunta)}><span>{item.titulo}</span><Icon nome={item.icone} /></button>)}</div>
          </div>
        </section>
      </main>
      <footer className="portfolio-footer"><a className="portfolio-marca" href="#inicio"><span className="ponto" />Isaac</a><span>Ideias, código e boas conversas.</span><a href="#inicio">Voltar ao topo ↑</a></footer>
    </div>
  );
}
export default App;
