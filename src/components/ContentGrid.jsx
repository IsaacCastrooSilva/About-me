import "./ContentGrid.css";

// Blocos vazios para receber o conteúdo e a identidade visual depois.
export default function ContentGrid() {
  return <section className="grade-conteudos" aria-label="Estrutura de conteúdos do portfólio">
    <div className="grade-destaques" role="group" aria-label="Um destaque principal e três secundários">
      <div className="bloco-conteudo bloco-principal" aria-hidden="true" />
      <div className="grade-lateral" aria-hidden="true">{Array.from({ length: 3 }, (_, indice) => <div className="bloco-conteudo bloco-quadrado" key={indice} />)}</div>
    </div>
    <div className="grade-recentes" role="group" aria-label="Seis espaços para conteúdos recentes">{Array.from({ length: 6 }, (_, indice) => <div className="bloco-conteudo bloco-miniatura" key={indice} aria-hidden="true" />)}</div>
    {Array.from({ length: 3 }, (_, linha) => <div className="grade-fileira" role="group" aria-label={`Fileira ${linha + 1} de conteúdos`} key={linha}>{Array.from({ length: 3 }, (_, coluna) => <div className="bloco-conteudo bloco-quadrado" key={coluna} aria-hidden="true" />)}</div>)}
  </section>;
}
