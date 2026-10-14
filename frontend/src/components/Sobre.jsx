const TECNOLOGIAS = ["Java", "Spring Boot", "React", "SQL Server", "Python"];

export default function Sobre({ children }) {
  return <section className="sobre-secao secao" id="sobre" aria-labelledby="sobre-titulo" data-reveal>
    <div className="sobre-intro"><p className="eyebrow">01 / SOBRE MIM</p><h2 id="sobre-titulo">A pessoa<br />por trás do código.</h2><p className="sobre-nota">Aprender, construir e seguir evoluindo.</p></div>
    <div className="sobre-conteudo">{children}<p className="sobre-complemento">Este é meu espaço para compartilhar projetos e experiências. Quer conhecer melhor minha trajetória? A Cube AI te ajuda a explorar.</p><h3 className="tecnologias-titulo">TECNOLOGIAS DO MEU DIA A DIA</h3><ul className="tecnologias-lista" aria-label="Tecnologias"><li className="sr-only">Minhas tecnologias:</li>{TECNOLOGIAS.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}</ul></div>
  </section>;
}
