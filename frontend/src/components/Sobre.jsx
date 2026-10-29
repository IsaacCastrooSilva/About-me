const TECNOLOGIAS = ["Java", "Spring Boot", "React", "SQL Server","ColdFusion"];

export default function Sobre ({ children }) {
  return <section className="sobre-secao secao" id="sobre" aria-labelledby="sobre-titulo" data-reveal>
    <div className="sobre-intro"><p className="eyebrow"></p><h2 id="sobre-titulo">Mais sobre mim<br />por trás do código.</h2><p className="sobre-nota">Aprendendo, construindo e evoluindo constantemente.</p></div>
    <div className="sobre-conteudo">{children}<p className="sobre-complemento">Este é o meu lugar para compartilhar projetos e experiências. Quer me conhecer melhor? A IA que eu criei pode te ajudar.</p><h3 className="tecnologias-titulo">Minhas Tecnologias:</h3><ul className="tecnologias-lista" aria-label="Tecnologias"><li className="sr-only">Minhas tecnologias:</li>{TECNOLOGIAS.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}</ul></div>
  </section>;
}
