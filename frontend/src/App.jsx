import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Sobre from "./components/Sobre";
import Theodor from "./components/Theodor";
import Pixels from "./components/Pixels";
import PixelField from "./components/PixelField";
import RespostaDigitada from "./components/RespostaDigitada";
import Icon from "./components/Icon";
import AvisoConexao from "./components/AvisoConexao";
import useReveal from "./hooks/useReveal";
import useReducedMotion from "./hooks/useReducedMotion";
import sugerirContinuacoes from "./continuacoes";
import "./App.css";

const API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:8080/api/chat";
const MAX_PERGUNTA = 1000;
const ERRO_PADRAO = "Não consegui obter uma resposta agora. Tente de novo em alguns instantes.";
const ERRO_LIMITE = "Muitas perguntas seguidas. Aguarde um minuto e tente de novo.";
const ERRO_OFFLINE = "Você está sem internet. Assim que a conexão voltar, é só tentar de novo.";
const ERRO_DEMORA = "O servidor demorou para responder. Ele pode estar acordando depois de um tempo parado: tente de novo em alguns segundos.";

const sugestoes = [
  { titulo: "Quem é o Isaac?", pergunta: "Quem é o Isaac?" },
  { titulo: "Quais projetos ele desenvolveu?", pergunta: "Quais projetos o Isaac desenvolveu?" },
  { titulo: "Quais são as principais habilidades dele?", pergunta: "Quais são as principais habilidades do Isaac?" },
  { titulo: "Como entrar em contato?", pergunta: "Como posso entrar em contato com o Isaac?" },
];

const ANO = new Date().getFullYear();

// Canais de contato públicos. Telefone não é divulgado.
const CONTATOS = [
  { nome: "E-mail", url: "mailto:isaaccastro10092007@gmail.com" },
  { nome: "GitHub", url: "https://github.com/IsaacCastrooSilva" },
];

function criarConversa() {
  return { id: crypto.randomUUID(), titulo: "Nova conversa", mensagens: [] };
}

function App({ previaOffline = false }) {
  useReveal();
  const reduzir = useReducedMotion();
  // Conversas desta sessão: cada uma tem seu próprio contexto na API.
  const [conversas, setConversas] = useState(() => [criarConversa()]);
  const [ativaId, setAtivaId] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = useState(true);
  // Aumenta a cada resposta recebida: dispara a onda no campo de pixels.
  const [pulso, setPulso] = useState(0);
  // Campo em estilo terminal: o texto visível é um espelho do textarea,
  // com cursor em bloco na posição `cursor`.
  const [cursor, setCursor] = useState(0);
  const [focado, setFocado] = useState(false);
  const espelhoRef = useRef(null);
  const cursorVisivel = focado && !carregando;
  const mensagensRef = useRef(null);
  const acompanharMensagensRef = useRef(true);
  const entradaRef = useRef(null);
  const menuRef = useRef(null);
  const requisicaoRef = useRef(null);
  const conversa = conversas.find((item) => item.id === ativaId) || conversas[0];
  const iniciou = conversa.mensagens.length > 0;
  const totalConversas = conversas.filter(item => item.mensagens.length).length;
  const ultima = conversa.mensagens.at(-1);
  // Só sugere continuações com a resposta já inteira na tela.
  const continuacoes = !carregando && ultima?.autor === "ai" && !ultima.erro && !ultima.digitando ? sugerirContinuacoes(conversa.mensagens) : [];

  function rolarParaFim() {
    const lista = mensagensRef.current;
    if (lista && acompanharMensagensRef.current) lista.scrollTop = lista.scrollHeight;
  }

  function terminarDigitacao(conversaId, indice) {
    setConversas((anteriores) => anteriores.map((item) => item.id !== conversaId ? item : { ...item, mensagens: item.mensagens.map((mensagem, i) => i === indice ? { ...mensagem, digitando: false } : mensagem) }));
  }

  useLayoutEffect(() => {
    const lista = mensagensRef.current;
    if (lista && acompanharMensagensRef.current) {
      // Rola somente as mensagens, sem deslocar o restante do site.
      lista.scrollTop = lista.scrollHeight;
    }
  }, [conversa.id, conversa.mensagens, carregando, continuacoes.length]);

  useEffect(() => {
    const campo = entradaRef.current;
    if (campo) {
      campo.style.height = "auto";
      campo.style.height = `${Math.min(campo.scrollHeight, 180)}px`;
    }
  }, [pergunta]);

  useEffect(() => {
    // Acompanha o cursor do textarea (setas, clique, seleção, texto trocado por código).
    const sincronizar = () => {
      const campo = entradaRef.current;
      if (campo && document.activeElement === campo) setCursor(campo.selectionStart);
    };
    sincronizar();
    document.addEventListener("selectionchange", sincronizar);
    return () => document.removeEventListener("selectionchange", sincronizar);
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
      if (!response.ok) throw new Error(response.status === 429 ? ERRO_LIMITE : `Erro HTTP: ${response.status}`);
      const data = await response.json();
      if (typeof data.answer !== "string" || !data.answer.trim()) throw new Error("Resposta vazia do servidor");
      atualizar((item) => ({ ...item, mensagens: [...item.mensagens, { autor: "ai", texto: data.answer, digitando: !reduzir }] }));
      setPulso((atual) => atual + 1);
    } catch (erro) {
      // O campo continua vazio; a pergunta fica guardada no erro para reenviar.
      const aviso = !navigator.onLine ? ERRO_OFFLINE
        : erro?.name === "AbortError" ? ERRO_DEMORA
        : erro?.message === ERRO_LIMITE ? ERRO_LIMITE
        : ERRO_PADRAO;
      atualizar((item) => ({ ...item, mensagens: [...item.mensagens, { autor: "ai", erro: true, texto: aviso, pergunta: texto }] }));
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

  function alternarHistorico() {
    if (window.matchMedia("(max-width: 767px)").matches) setMenuAberto(!menuAberto);
    else setSidebarRecolhida(!sidebarRecolhida);
  }

  return (
    <div className={"app portfolio" + (menuAberto ? " menu-aberto" : "") + (sidebarRecolhida ? " sidebar-recolhida" : "") + (menuAberto || !sidebarRecolhida ? " sidebar-aberta" : "")} onKeyDown={e => { if(e.key === "Escape" && menuAberto) fecharMenu(); }}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <PixelField pensando={carregando} pulso={pulso} />
      <Navigation />
      <AvisoConexao forcar={previaOffline} />
      <button className="fundo-sidebar" aria-label="Fechar conversas" tabIndex={-1} onClick={fecharMenu} />
      <aside className="sidebar" id="historico" aria-label="Conversas">
        <div className="sidebar-logo"><Pixels /><strong>Conversas</strong><button className="icone-botao alternar-sidebar" onClick={() => { setSidebarRecolhida(true); requestAnimationFrame(() => menuRef.current?.focus()); }} aria-expanded={!sidebarRecolhida} aria-controls="conteudo-sidebar" aria-label={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"} title={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"}><Icon nome="panel" /></button><button className="icone-botao fechar-sidebar" onClick={fecharMenu} aria-label="Fechar conversas"><Icon nome="close" /></button></div>
        <div className="conteudo-sidebar" id="conteudo-sidebar">
        <button className="nova-conversa" onClick={novaConversa} disabled={carregando}><Icon nome="plus" />Nova conversa</button>
        <nav className="lista-conversas" aria-label="Histórico de conversas">
          {!totalConversas && <p className="historico-vazio">Suas conversas desta visita aparecem aqui.</p>}
          {conversas.filter(item => item.mensagens.length).map(item => <button key={item.id} disabled={carregando} onClick={() => selecionarConversa(item.id)} aria-current={item.id === conversa.id ? "true" : undefined} title={item.titulo}><span>{item.titulo}</span></button>)}
        </nav>
        <span className="sidebar-rodape">Ficam só nesta aba do navegador.</span>
        </div>
      </aside>
      <main id="conteudo">
        <Hero />
        <Sobre />
        <Theodor onIniciarConversa={abrirChat} ocupado={carregando} />
        <section className="secao-ia secao" id="theodor-ai" aria-labelledby="chat-titulo" data-reveal>
          <div className="secao-topo"><p className="rotulo"><Pixels />Vamos conversar</p><button ref={menuRef} className="historico-botao" onClick={alternarHistorico} aria-expanded={menuAberto || !sidebarRecolhida} aria-controls="historico"><Icon nome="panel" />Conversas{totalConversas > 0 && <span className="historico-contagem">{totalConversas}</span>}</button></div>
          <div className="chat-painel">
            <div className={"convite-conversa" + (iniciou ? " chat-iniciado" : "")}><h2 id="chat-titulo">O que você quer descobrir sobre mim?</h2>{!iniciou && <p>Pergunte ao Theodor sobre projetos, experiência, tecnologias ou alguma curiosidade.</p>}</div>
            {iniciou && <div className="mensagens" ref={mensagensRef} onScroll={e => {
              const lista = e.currentTarget;
              acompanharMensagensRef.current = lista.scrollHeight - lista.scrollTop - lista.clientHeight <= 48;
            }} onWheel={e => {
              // Rolar para cima interrompe o acompanhamento automático na hora.
              if (e.deltaY < 0) acompanharMensagensRef.current = false;
            }} onTouchMove={() => {
              const lista = mensagensRef.current;
              if (lista && lista.scrollHeight - lista.scrollTop - lista.clientHeight > 4) acompanharMensagensRef.current = false;
            }} role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">{conversa.mensagens.map((mensagem,index) => <article key={index} className={"mensagem " + mensagem.autor + (mensagem.erro ? " erro" : "")} aria-label={mensagem.autor === "user" ? "Você" : "Theodor AI"}><div className="autor" aria-hidden="true">{mensagem.autor === "ai" ? <><Pixels />Theodor</> : "Você"}</div>{mensagem.autor !== "ai" ? <p>{mensagem.texto}</p> : mensagem.digitando ? <RespostaDigitada texto={mensagem.texto} aoAvancar={rolarParaFim} aoTerminar={() => terminarDigitacao(conversa.id, index)} /> : <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mensagem.texto}</ReactMarkdown></div>}{mensagem.erro && mensagem.pergunta && index === conversa.mensagens.length - 1 && <button type="button" className="tentar-novamente" disabled={carregando} onClick={() => enviarMensagem(mensagem.pergunta)}>Tentar de novo</button>}</article>)}{carregando && <div className="resposta-pendente" role="status"><Pixels animado />Buscando nas minhas informações…</div>}{continuacoes.length > 0 && <div className="continuacoes"><p className="rotulo" id="continuacoes-titulo">Continue por aqui</p><ul aria-labelledby="continuacoes-titulo">{continuacoes.map(item => <li key={item}><button type="button" onClick={() => enviarMensagem(item)}>{item}<Icon nome="arrowRight" /></button></li>)}</ul></div>}</div>}
            <form className="compositor" aria-busy={carregando} onSubmit={e => { e.preventDefault(); enviarMensagem(); }}><label className="compositor-prompt" htmlFor="pergunta" aria-hidden="true">&gt;</label><div className="campo-terminal"><div className="terminal-espelho" ref={espelhoRef} aria-hidden="true">{[...pergunta].flatMap((letra, indice) => [indice === cursor && cursorVisivel ? <span key="cursor" className="cursor-bloco" /> : null, <span key={indice} className="tecla">{letra}</span>])}{cursor >= pergunta.length && cursorVisivel && <span className="cursor-bloco" />}{"​"}</div><textarea id="pergunta" ref={entradaRef} aria-label="Sua pergunta para o Theodor AI" aria-describedby="ajuda-pergunta" placeholder="Escreva sua pergunta" value={pergunta} onChange={e => { setPergunta(e.target.value); setCursor(e.target.selectionStart); }} onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviarMensagem(); } }} onFocus={() => setFocado(true)} onBlur={() => setFocado(false)} onScroll={e => { if (espelhoRef.current) espelhoRef.current.scrollTop = e.currentTarget.scrollTop; }} rows={1} maxLength={MAX_PERGUNTA} readOnly={carregando} spellCheck={false} /></div><button className="enviar" type="submit" disabled={carregando || !pergunta.trim()} aria-label={carregando ? "Montando sua resposta" : "Enviar pergunta"} title="Enviar pergunta"><Icon nome="arrow" /></button></form>
            <p id="ajuda-pergunta" className="campo-ajuda"><kbd>Enter</kbd> envia · <kbd>Shift</kbd> + <kbd>Enter</kbd> quebra a linha</p>
            {!iniciou && <div className="perguntas-basicas"><p className="rotulo" id="sugestoes-titulo">Ou comece por aqui</p><ul aria-labelledby="sugestoes-titulo">{sugestoes.map((item, indice) => <li key={item.titulo}><button disabled={carregando} onClick={() => enviarMensagem(item.pergunta)}><span className="sugestao-numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span><span>{item.titulo}</span><Icon nome="arrowRight" /></button></li>)}</ul></div>}
          </div>
        </section>
      </main>
      <footer className="portfolio-footer"><span className="portfolio-marca"><Pixels />Isaac de Castro Silva · {ANO}</span><nav className="footer-contato" aria-label="Contato">{CONTATOS.map(item => <a key={item.nome} href={item.url} {...(item.url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{item.nome}</a>)}</nav><a href="#inicio">Voltar ao topo ↑</a></footer>
    </div>
  );
}
export default App;
