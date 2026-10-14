const TECNOLOGIAS = ["Java", "Spring Boot", "React", "SQL Server", "ColdFusion", ];

export default function Sobre({ children }) {
  return <section className="sobre-secao secao" id="sobre" aria-labelledby="sobre-titulo" data-reveal>
    <div className="sobre-intro"><p className="eyebrow">SOBRE MIM</p><h2 id="sobre-titulo">Quem sou eu<br />por trás do código.</h2><p className="sobre-nota">Aprender, construir e seguir evoluindo com humildade.</p></div>
    <div className="sobre-conteudo">{children}<p className="sobre-complemento">Este é meu espaço para compartilhar projetos e experiências da minha carreira. Quer conhecer melhor minha trajetória? faça algumas perguntas para minha IA</p><h3 className="tecnologias-titulo">TECNOLOGIAS DO MEU DIA A DIA</h3><ul className="tecnologias-lista" aria-label="Tecnologias"><li className="sr-only">Minhas tecnologias:</li>{TECNOLOGIAS.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}</ul></div>
  </section>;
}
