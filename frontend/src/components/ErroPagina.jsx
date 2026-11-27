import { useEffect } from "react";
import { ArrowUpRight, RotateCw } from "lucide-react";
import Pixels from "./Pixels";
import PixelField from "./PixelField";
import GlifoPixel from "./GlifoPixel";
import "./ErroPagina.css";

const ANO = new Date().getFullYear();

const ERROS = {
  404: {
    titulo: "Página não encontrada",
    manchete: <>Esta página<br />saiu do mapa.</>,
    texto: "O endereço que você abriu não existe por aqui. Talvez o link esteja errado ou a página tenha mudado de lugar.",
    comando: caminho => `GET ${caminho}`,
    status: "404 · página não encontrada",
    dica: "sugestão: voltar ao início",
  },
  500: {
    titulo: "Erro inesperado",
    manchete: <>Algo quebrou<br />por aqui.</>,
    texto: "Um erro inesperado interrompeu a página. Recarregar costuma resolver. Se continuar, o problema é meu, não seu.",
    comando: () => "render(portfolio)",
    status: "500 · erro inesperado",
    dica: "sugestão: recarregar a página",
  },
};

export default function ErroPagina({ codigo = 404 }) {
  const erro = ERROS[codigo] || ERROS[404];
  const caminho = decodeURI(window.location.pathname);

  useEffect(() => {
    const anterior = document.title;
    document.title = `${erro.titulo} · Isaac`;
    return () => { document.title = anterior; };
  }, [erro.titulo]);

  return (
    <div className="erro-pagina">
      <PixelField />
      <header className="erro-topo">
        <a href="/" className="erro-marca"><Pixels />Isaac de Castro Silva</a>
        <span className="rotulo">Erro {codigo}</span>
      </header>

      <main className="erro-corpo" id="conteudo">
        <div className="erro-copy">
          <p className="rotulo erro-rotulo"><Pixels animado />Sinal perdido</p>
          <h1>{erro.manchete}</h1>
          <p className="erro-texto">{erro.texto}</p>

          <div className="erro-terminal" role="note" aria-label="Detalhes do erro">
            <p><span className="erro-prompt">&gt;</span> {erro.comando(caminho)}</p>
            <p className="erro-status">{erro.status}</p>
            <p><span className="erro-prompt">&gt;</span> {erro.dica}<span className="erro-cursor" aria-hidden="true" /></p>
          </div>

          <div className="hero-acoes">
            {codigo === 500
              ? <button type="button" className="botao-primario" onClick={() => window.location.reload()}>Recarregar página<RotateCw size={18} aria-hidden="true" /></button>
              : <a href="/" className="botao-primario">Voltar ao início<ArrowUpRight size={18} aria-hidden="true" /></a>}
            {codigo === 500
              ? <a href="/" className="botao-texto">Voltar ao início</a>
              : <a href="/#theodor-ai" className="botao-texto">Perguntar ao Theodor</a>}
          </div>
        </div>

        <div className="erro-arte">
          <GlifoPixel texto={String(codigo)} />
        </div>
      </main>

      <footer className="erro-rodape">
        <span>Isaac de Castro Silva · {ANO}</span>
        <span>status {codigo}</span>
      </footer>
    </div>
  );
}
