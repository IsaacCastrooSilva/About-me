import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Sobre from "./components/Sobre";
import TheodorPreview from "./components/TheodorPreview";
import Icon from "./components/Icon";
import useReveal from "./hooks/useReveal";
import "./App.css";

const API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:8080/api/chat";

const sugestoes = [
  { icone: "brain", titulo: "Sobre mim", pergunta: "Quem é o Isaac?" },
  { icone: "project", titulo: "Projetos", pergunta: "Quais projetos o Isaac desenvolveu?" },
  { icone: "verified", titulo: "Habilidades", pergunta: "Quais são as principais habilidades do Isaac?" },
  { icone: "fileplus", titulo: "Contato", pergunta: "Como posso entrar em contato com o Isaac?" },
];
const FRASES_CAMPO = [
  "Digite aqui sua pergunta!",
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

function App() {
  useReveal();
  // Conversas desta sessão: cada uma tem seu próprio contexto na API.
  const [conversas, setConversas] = useState(() => [criarConversa()]);
  const [ativaId, setAtivaId] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = useState(true);
  const mensagensRef = useRef(null);
  const acompanharMensagensRef = useRef(true);
  const entradaRef = useRef(null);
  const menuRef = useRef(null);
  const requisicaoRef = useRef(null);
  const conversa = conversas.find((item) => item.id === ativaId) || conversas[0];
  const iniciou = conversa.mensagens.length > 0;

  useLayoutEffect(() => {
    const lista = mensagensRef.current;
    if (lista && acompanharMensagensRef.current) {
      // Rola somente as mensagens, sem deslocar o restante do site.
      lista.scrollTop = lista.scrollHeight;
    }
  }, [conversa.id, conversa.mensagens, carregando]);

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
    acompanharMensagensRef.current = true;
    setAtivaId(id);
    setPergunta("");
    setMenuAberto(false);
    entradaRef.current?.focus({ preventScroll: true });
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
    acompanharMensagensRef.current = true;
    entradaRef.current?.focus({ preventScroll: true });
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
      atualizar((item) => ({ ...item, mensagens: [...item.mensagens, { autor: "ai", erro: true, texto: "Ops não consegui obter uma resposta. Tente enviar sua pergunta novamente em alguns instantes." }] }));
      setPergunta(texto);
    } finally {
      clearTimeout(timeout);
      requisicaoRef.current = null;
      setCarregando(false);
    }
  }

  function abrirChat(texto) {
    if (requisicaoRef.current) return;
    if (texto) setPergunta(texto);
    document.getElementById("theodor-ai")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
    entradaRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className={"app portfolio" + (menuAberto ? " menu-aberto" : "") + (sidebarRecolhida ? " sidebar-recolhida" : "")} onKeyDown={e => { if(e.key === "Escape" && menuAberto) fecharMenu(); }}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Navigation />
      <button className="fundo-sidebar" aria-label="Fechar conversas" tabIndex={-1} onClick={fecharMenu} />
      <aside className="sidebar" id="historico" aria-label="Conversas">
        <div className="sidebar-logo"><strong>Theodor AI</strong><button className="icone-botao alternar-sidebar" onClick={() => { setSidebarRecolhida(true); requestAnimationFrame(() => menuRef.current?.focus()); }} aria-expanded={!sidebarRecolhida} aria-controls="conteudo-sidebar" aria-label={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"} title={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"}><Icon nome="panel" /></button><button className="icone-botao fechar-sidebar" onClick={fecharMenu} aria-label="Fechar conversas"><Icon nome="close" /></button></div>
        <div className="conteudo-sidebar" id="conteudo-sidebar">
        <button className="nova-conversa" onClick={novaConversa} disabled={carregando}><Icon nome="plus" />Nova conversa</button>
        <p className="sidebar-legenda">CONVERSAS</p>
        <nav className="lista-conversas" aria-label="Histórico de conversas">
          {!conversas.some(item => item.mensagens.length) && <p className="historico-vazio">Suas conversas aparecem aqui.</p>}
          {conversas.filter(item => item.mensagens.length).map(item => <button key={item.id} disabled={carregando} onClick={() => selecionarConversa(item.id)} aria-current={item.id === conversa.id ? "true" : undefined} title={item.titulo}><Icon nome="chat" /><span>{item.titulo}</span></button>)}
        </nav>
        <span className="sidebar-rodape">Um pouco mais sobre o Isaac.</span>
        </div>
      </aside>
      <main id="conteudo">
        <Hero />
        <Sobre />
        <TheodorPreview onIniciarConversa={abrirChat} ocupado={carregando} />
        <section className="secao-ia secao" id="theodor-ai" aria-labelledby="chat-titulo" data-reveal>
          <div className="ia-cabecalho"><span className="eyebrow"></span><button ref={menuRef} className="historico-botao" onClick={() => { if (window.matchMedia("(max-width: 767px)").matches) { setMenuAberto(!menuAberto); } else { setSidebarRecolhida(!sidebarRecolhida); } }} aria-expanded={menuAberto || !sidebarRecolhida} aria-controls="historico"><Icon nome="panel" />Conversas</button></div>
          <div className="chat-painel">
            <div className={"convite-conversa" + (iniciou ? " chat-iniciado" : "")}><span className="chat-identidade"></span><h2 id="chat-titulo">O que você quer descobrir<br />sobre mim?</h2>{!iniciou && <p>Projetos, habilidades ou uma curiosidade<br />O que você quiser.</p>}</div>
            {iniciou && <div className="mensagens" ref={mensagensRef} onScroll={e => {
              const lista = e.currentTarget;
              acompanharMensagensRef.current = lista.scrollHeight - lista.scrollTop - lista.clientHeight <= 48;
            }} role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">{conversa.mensagens.map((mensagem,index) => <article key={index} className={"mensagem " + mensagem.autor + (mensagem.erro ? " erro" : "")} aria-label={mensagem.autor === "user" ? "Você" : "Theodor AI"}>{mensagem.autor === "ai" ? <><div className="autor"><span>Theodor AI</span></div><div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mensagem.texto}</ReactMarkdown></div></> : <p>{mensagem.texto}</p>}</article>)}{carregando && <div className="resposta-pendente" role="status"><span>Pensando...</span></div>}</div>}
            <form className="compositor" aria-busy={carregando} onSubmit={e => { e.preventDefault(); enviarMensagem(); }}><div className="campo-pergunta"><textarea id="pergunta" ref={entradaRef} aria-label="Sua pergunta para o Theodor AI" aria-describedby="ajuda-pergunta" value={pergunta} onChange={e => setPergunta(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviarMensagem(); } }} rows={1} readOnly={carregando} />{!pergunta && !carregando && <SugestaoAnimada />}</div><button className="enviar" type="submit" disabled={carregando || !pergunta.trim()} aria-label={carregando ? "Montando sua resposta" : "Enviar pergunta"} title="Enviar pergunta"><Icon nome="arrow" /></button></form>
            <p id="ajuda-pergunta" className="campo-ajuda"> Shift + Enter para uma nova linha</p>
            <div className="perguntas-basicas" aria-label="Perguntas básicas">{sugestoes.map(item => <button key={item.titulo} disabled={carregando} onClick={() => enviarMensagem(item.pergunta)}><span>{item.titulo}</span><Icon nome={item.icone} /></button>)}</div>
          </div>
        </section>
      </main>
      <footer className="portfolio-footer"><a className="portfolio-marca" href="#inicio"></a><a href="#inicio">Voltar ao topo ↑</a></footer>
    </div>
  );
}
export default App;
