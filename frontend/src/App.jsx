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
const CORES_CUBO = ["#ffd500", "#c41e3a", "#ff5800", "#009e60", "#0051ba"];
function embaralharCubo(rodada) {
  return Array.from({ length: 9 }, (_, i) => (i * 2 + Math.floor(i / 3) + rodada) % CORES_CUBO.length);
}

function CuboQuadrado({ carregando = false, resolvido = false, rodada = 0 }) {
  const [quadro, setQuadro] = useState(() => ({ pecas: embaralharCubo(rodada), movimento: null, passo: 0 }));
  const pecasRef = useRef(quadro.pecas);
  const primeiraVez = useRef(true);

  useEffect(() => {
    if (primeiraVez.current && !carregando && !resolvido) {
      primeiraVez.current = false;
      return;
    }
    primeiraVez.current = false;
    let cancelado = false;
    let timer;
    let passo = 0;
    const destino = resolvido ? Array(9).fill(rodada % CORES_CUBO.length) : embaralharCubo(rodada);
    const mover = () => {
      if (cancelado) return;
      const eixo = carregando && Math.floor(passo / 9) % 2 ? 'coluna' : 'linha';
      const faixa = Math.floor(passo / 3) % 3;
      const indices = [0, 1, 2].map(i => eixo === 'linha' ? faixa * 3 + i : i * 3 + faixa);
      const montando = resolvido || (carregando && Math.floor(passo / 9) % 2 === 0);
      const novaCor = montando ? rodada % CORES_CUBO.length : destino[indices[passo % 3]];
      const antes = pecasRef.current;
      setQuadro({ pecas: antes, movimento: { eixo, faixa, novaCor }, passo: passo++ });
      timer = setTimeout(() => {
        const depois = [...antes];
        indices.forEach((indice, i) => { depois[indice] = i < 2 ? antes[indices[i + 1]] : novaCor; });
        pecasRef.current = depois;
        setQuadro({ pecas: depois, movimento: null, passo });
        if (carregando || passo < 9) timer = setTimeout(mover, 65);
      }, 240);
    };
    mover();
    return () => { cancelado = true; clearTimeout(timer); };
  }, [carregando, resolvido, rodada]);

  const movimento = quadro.movimento;
  const desenhar = (cor, x, y, key) => <rect key={key} x={x + 1} y={y + 1} width="8" height="8" rx="1" fill={CORES_CUBO[cor]} />;
  return <svg className="cubo-clean" viewBox="0 0 30 30" aria-hidden="true">

    {quadro.pecas.map((cor, i) => {
      const ativa = movimento && (movimento.eixo === 'linha' ? Math.floor(i / 3) : i % 3) === movimento.faixa;
      return ativa ? null : desenhar(cor, i % 3 * 10, Math.floor(i / 3) * 10, i);
    })}
    {movimento && <g key={quadro.passo} className={'cubo-giro-' + movimento.eixo}>
      {[0, 1, 2, 3].map(i => {
        const linha = movimento.eixo === 'linha';
        const indice = linha ? movimento.faixa * 3 + i : i * 3 + movimento.faixa;
        return desenhar(i === 3 ? movimento.novaCor : quadro.pecas[indice], linha ? i * 10 : movimento.faixa * 10, linha ? movimento.faixa * 10 : i * 10, i);
      })}
    </g>}
  </svg>;
}
function Marca() { return <CuboQuadrado />; }

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

function App() {
  // Conversas desta sessão: cada uma tem seu próprio contexto na API.
  const [conversas, setConversas] = useState(() => [criarConversa()]);
  const [ativaId, setAtivaId] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = useState(true);
  const [rodada, setRodada] = useState(0);
  const [resolvido, setResolvido] = useState(false);
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
    setResolvido(false);
    setRodada(valor => valor + 1);
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
    setResolvido(false);
    setRodada(v => v + 1);
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
      setResolvido(true);
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
    <div className={"app app-apenas-ia" + (menuAberto ? " menu-aberto" : "") + (sidebarRecolhida ? " sidebar-recolhida" : "")} onKeyDown={e => { if(e.key === "Escape" && menuAberto) fecharMenu(); }}>
      <button className="fundo-sidebar" aria-label="Fechar conversas" tabIndex={-1} onClick={fecharMenu} />
      <aside className="sidebar" id="historico" aria-label="Conversas">
        <div className="sidebar-logo"><Marca /><strong>Cube AI</strong><button className="icone-botao alternar-sidebar" onClick={() => { setSidebarRecolhida(true); requestAnimationFrame(() => menuRef.current?.focus()); }} aria-expanded={!sidebarRecolhida} aria-controls="conteudo-sidebar" aria-label={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"} title={sidebarRecolhida ? "Expandir sidebar" : "Recolher sidebar"}><Icon nome="panel" /></button><button className="icone-botao fechar-sidebar" onClick={fecharMenu} aria-label="Fechar conversas"><Icon nome="close" /></button></div>
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
        <button ref={menuRef} className="icone-botao abrir-sidebar" onClick={() => { if (window.matchMedia("(max-width: 760px)").matches) { setMenuAberto(!menuAberto); } else { setSidebarRecolhida(false); requestAnimationFrame(() => document.querySelector(".alternar-sidebar")?.focus()); } }} aria-expanded={menuAberto} aria-controls="historico" aria-label="Abrir conversas"><Icon nome="panel" /></button>
        <section className="secao-ia" id="cube-ai" aria-label="Converse com a Cube AI">
          <div className="chat-painel">
            {!iniciou && <div className="convite-conversa"><h1>O que você quer descobrir sobre o Isaac?</h1><p>Toda conversa começa com uma curiosidade.</p></div>}
            {iniciou && <div className="mensagens" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">{conversa.mensagens.map((mensagem,index) => <article key={index} className={"mensagem " + mensagem.autor + (mensagem.erro ? " erro" : "")} aria-label={mensagem.autor === "user" ? "Você" : "Cube AI"}>{mensagem.autor === "ai" ? <><div className="autor"><Marca pequena /><span>Cube AI</span></div><div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mensagem.texto}</ReactMarkdown></div></> : <p>{mensagem.texto}</p>}</article>)}{carregando && <div className="resposta-pendente" role="status"><span>Conectando as peças da sua resposta...</span></div>}<div ref={fimRef} /></div>}
            <form className="compositor" onSubmit={e => { e.preventDefault(); enviarMensagem(); }}><CuboQuadrado carregando={carregando} resolvido={resolvido} rodada={rodada} /><label className="sr-only" htmlFor="pergunta">Sua pergunta sobre o Isaac</label><div className="campo-pergunta"><textarea id="pergunta" ref={entradaRef} value={pergunta} onChange={e => setPergunta(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviarMensagem(); } }} rows={1} readOnly={carregando} />{!pergunta && !carregando && <SugestaoAnimada />}</div><button className="enviar" type="submit" disabled={carregando || !pergunta.trim()} aria-label={carregando ? "Montando sua resposta" : "Enviar pergunta"} title="Enviar pergunta"><Icon nome="arrow" /></button></form>
            <div className="perguntas-basicas" aria-label="Perguntas básicas">{sugestoes.map(item => <button key={item.titulo} disabled={carregando} onClick={() => enviarMensagem(item.pergunta)}><span>{item.titulo}</span><Icon nome={item.icone} /></button>)}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default App;
