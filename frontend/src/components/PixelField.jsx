import { useEffect, useRef } from "react";
import useReducedMotion from "../hooks/useReducedMotion";
import "./PixelField.css";

// Fundo do site: uma grade de pixels quase apagados. Alguns acendem em
// vermelho, verde ou azul (as cores do olho do hero) e apagam devagar.
// Perto do mouse, a grade fica um pouco mais clara.
const PASSO = 24;          // distância entre pixels, em px
const TAMANHO = 2;         // tamanho de um pixel da grade
const TAMANHO_ACESO = 3;   // tamanho de um pixel aceso
const RAIO_MOUSE = 160;
const DENSIDADE = 0.012;   // fração da grade acesa ao mesmo tempo
const ALPHA_GRADE = 0.07;

const VELOCIDADE_ONDA = 0.55; // px por ms
const LARGURA_ONDA = 72;      // espessura do anel, em px
const TAMANHO_ONDA = 4;       // tamanho do pixel aceso pela onda
const INTERVALO_PENSANDO = 650;
const FAISCAS_PENSANDO = 6;   // vezes mais pixels acesos enquanto o Theodor pensa

// `pensando`: enquanto o Theodor busca a resposta, ondas saem do campo de pergunta.
// `pulso`: a cada mudança (resposta recebida), sai uma onda mais forte nas três cores.
const claro = () => document.documentElement.dataset.theme === "light";
const corBase = () => (claro() ? "0, 0, 0" : "255, 255, 255");

export default function PixelField({ pensando = false, pulso = 0 }) {
  const canvasRef = useRef(null);
  const reduzir = useReducedMotion();
  const pensandoRef = useRef(pensando);
  const emitirRef = useRef(null);

  useEffect(() => { pensandoRef.current = pensando; }, [pensando]);
  useEffect(() => { if (pulso > 0) emitirRef.current?.(true); }, [pulso]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const estilo = getComputedStyle(document.documentElement);
    const cores = ["--pixel-r", "--pixel-g", "--pixel-b"].map(nome => estilo.getPropertyValue(nome).trim() || "#ffffff");
    // A grade fixa é desenhada uma vez numa camada separada e só copiada a cada quadro.
    const grade = document.createElement("canvas");
    const gctx = grade.getContext("2d");
    const mouse = { x: null, y: null };
    let largura = 0, altura = 0, colunas = 0, linhas = 0;
    let faiscas = [];
    let ondas = [];
    let ultimaOnda = 0;
    let proximaCor = 0;
    let quadro = 0;

    // As ondas nascem no campo de pergunta do chat.
    function origem() {
      const campo = document.querySelector(".compositor")?.getBoundingClientRect();
      if (!campo) return { x: largura / 2, y: altura / 2 };
      return { x: campo.left + campo.width / 2, y: Math.min(altura, Math.max(0, campo.top + campo.height / 2)) };
    }

    function emitir(forte) {
      const agora = performance.now();
      const ponto = origem();
      if (forte) cores.forEach((cor, i) => ondas.push({ ...ponto, cor, inicio: agora + i * 140, forca: 1, vida: 2600 }));
      else ondas.push({ ...ponto, cor: cores[proximaCor++ % cores.length], inicio: agora, forca: 0.8, vida: 2600 });
      ultimaOnda = agora;
    }

    function desenharOndas(agora) {
      for (const onda of ondas) {
        const tempo = agora - onda.inicio;
        if (tempo < 0) continue;
        const raio = tempo * VELOCIDADE_ONDA;
        const forca = onda.forca * (1 - tempo / onda.vida);
        ctx.fillStyle = onda.cor;
        for (let c = 0; c < colunas; c++) {
          const dx = posicao(c) - onda.x;
          if (Math.abs(dx) > raio + LARGURA_ONDA) continue;
          for (let l = 0; l < linhas; l++) {
            const distancia = Math.abs(Math.hypot(dx, posicao(l) - onda.y) - raio);
            if (distancia >= LARGURA_ONDA) continue;
            ctx.globalAlpha = Math.min(1, (1 - distancia / LARGURA_ONDA) * forca);
            ctx.fillRect(posicao(c) - TAMANHO_ONDA / 2, posicao(l) - TAMANHO_ONDA / 2, TAMANHO_ONDA, TAMANHO_ONDA);
          }
        }
      }
    }

    const posicao = indice => indice * PASSO + PASSO / 2;
    const sortear = maximo => Math.floor(Math.random() * maximo);

    function criarFaisca(agora, coluna, linha, faseAleatoria = false) {
      const duracao = 1800 + Math.random() * 2600;
      return {
        coluna, linha, duracao,
        cor: cores[sortear(cores.length)],
        intensidade: 0.3 + Math.random() * 0.35,
        inicio: faseAleatoria ? agora - Math.random() * duracao : agora,
      };
    }

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = window.innerWidth;
      altura = window.innerHeight;
      for (const alvo of [canvas, grade]) {
        alvo.width = Math.round(largura * dpr);
        alvo.height = Math.round(altura * dpr);
        alvo.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      colunas = Math.ceil(largura / PASSO);
      linhas = Math.ceil(altura / PASSO);
      gctx.clearRect(0, 0, largura, altura);
      gctx.fillStyle = `rgba(${corBase()}, ${ALPHA_GRADE * (claro() ? 1.6 : 1)})`;
      for (let c = 0; c < colunas; c++) {
        for (let l = 0; l < linhas; l++) gctx.fillRect(posicao(c) - TAMANHO / 2, posicao(l) - TAMANHO / 2, TAMANHO, TAMANHO);
      }
      faiscas = faiscas.filter(f => f.coluna < colunas && f.linha < linhas);
    }

    const alvoFaiscas = () => Math.max(6, Math.round(colunas * linhas * DENSIDADE * (pensandoRef.current ? FAISCAS_PENSANDO : 1)));

    function desenhar(agora) {
      ctx.clearRect(0, 0, largura, altura);
      ctx.drawImage(grade, 0, 0, largura, altura);

      if (mouse.x !== null) {
        const c0 = Math.max(0, Math.floor((mouse.x - RAIO_MOUSE) / PASSO));
        const c1 = Math.min(colunas - 1, Math.ceil((mouse.x + RAIO_MOUSE) / PASSO));
        const l0 = Math.max(0, Math.floor((mouse.y - RAIO_MOUSE) / PASSO));
        const l1 = Math.min(linhas - 1, Math.ceil((mouse.y + RAIO_MOUSE) / PASSO));
        ctx.fillStyle = `rgb(${corBase()})`;
        for (let c = c0; c <= c1; c++) {
          for (let l = l0; l <= l1; l++) {
            const distancia = Math.hypot(posicao(c) - mouse.x, posicao(l) - mouse.y);
            if (distancia >= RAIO_MOUSE) continue;
            ctx.globalAlpha = (1 - distancia / RAIO_MOUSE) ** 2 * 0.3;
            ctx.fillRect(posicao(c) - TAMANHO / 2, posicao(l) - TAMANHO / 2, TAMANHO, TAMANHO);
          }
        }
      }

      for (const faisca of faiscas) {
        const progresso = Math.min(1, Math.max(0, (agora - faisca.inicio) / faisca.duracao));
        ctx.globalAlpha = Math.sin(Math.PI * progresso) * faisca.intensidade;
        ctx.fillStyle = faisca.cor;
        ctx.fillRect(posicao(faisca.coluna) - TAMANHO_ACESO / 2, posicao(faisca.linha) - TAMANHO_ACESO / 2, TAMANHO_ACESO, TAMANHO_ACESO);
      }
      desenharOndas(agora);
      ctx.globalAlpha = 1;
    }

    function animar(agora) {
      faiscas = faiscas.filter(f => agora - f.inicio < f.duracao);
      ondas = ondas.filter(onda => agora - onda.inicio < onda.vida);
      if (pensandoRef.current && agora - ultimaOnda > INTERVALO_PENSANDO) emitir(false);
      // Poucas por quadro, para os pixels não acenderem todos juntos.
      for (let i = 0; i < (pensandoRef.current ? 8 : 2) && faiscas.length < alvoFaiscas(); i++) faiscas.push(criarFaisca(agora, sortear(colunas), sortear(linhas)));
      if (mouse.x !== null && Math.random() < 0.12) {
        const coluna = Math.round((mouse.x + (Math.random() - 0.5) * RAIO_MOUSE * 1.4 - PASSO / 2) / PASSO);
        const linha = Math.round((mouse.y + (Math.random() - 0.5) * RAIO_MOUSE * 1.4 - PASSO / 2) / PASSO);
        if (coluna >= 0 && coluna < colunas && linha >= 0 && linha < linhas) faiscas.push(criarFaisca(agora, coluna, linha));
      }
      desenhar(agora);
      quadro = requestAnimationFrame(animar);
    }

    function iniciar() {
      if (!quadro && !document.hidden) quadro = requestAnimationFrame(animar);
    }
    function parar() {
      cancelAnimationFrame(quadro);
      quadro = 0;
    }

    function desenharParado() {
      // Movimento reduzido: um retrato fixo do campo, sem animação.
      faiscas = Array.from({ length: alvoFaiscas() }, () => ({ ...criarFaisca(0, sortear(colunas), sortear(linhas)), inicio: 0, duracao: 2 }));
      desenhar(1);
    }

    // Pontos claros no modo escuro e escuros no modo claro; refaz tudo quando o tema muda.
    function aplicarTema() {
      const atual = getComputedStyle(document.documentElement);
      cores.splice(0, 3, ...["--pixel-r", "--pixel-g", "--pixel-b"].map(nome => atual.getPropertyValue(nome).trim() || "#ffffff"));
      medir();
      if (reduzir) desenharParado();
    }
    const observadorTema = new MutationObserver(aplicarTema);
    observadorTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    medir();
    const aoRedimensionar = () => { medir(); if (reduzir) desenharParado(); };
    window.addEventListener("resize", aoRedimensionar);
    if (reduzir) {
      desenharParado();
      return () => { observadorTema.disconnect(); window.removeEventListener("resize", aoRedimensionar); };
    }

    const agora = performance.now();
    faiscas = Array.from({ length: alvoFaiscas() }, () => criarFaisca(agora, sortear(colunas), sortear(linhas), true));
    const aoMover = evento => { if (evento.pointerType === "mouse") { mouse.x = evento.clientX; mouse.y = evento.clientY; } };
    const aoSair = evento => { if (!evento.relatedTarget) { mouse.x = null; mouse.y = null; } };
    const aoMudarVisibilidade = () => (document.hidden ? parar() : iniciar());
    window.addEventListener("pointermove", aoMover, { passive: true });
    document.addEventListener("pointerout", aoSair);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    emitirRef.current = emitir;
    iniciar();
    return () => {
      observadorTema.disconnect();
      parar();
      emitirRef.current = null;
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("pointermove", aoMover);
      document.removeEventListener("pointerout", aoSair);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, [reduzir]);

  return <canvas ref={canvasRef} className="pixel-field" aria-hidden="true" />;
}
