const TECNOLOGIAS = ["Java", "Spring Boot","Intellij IDEA", "React","Visual Studio", "SQL Server","ColdFusion"];

export default function Sobre ({ children }) {
  return <section className="sobre-secao secao" id="sobre" aria-labelledby="sobre-titulo" data-reveal>
    <div className="sobre-painel">
    <div className="sobre-intro"><p className="eyebrow"></p><h2 id="sobre-titulo">Mais sobre mim<br />por trás do código.</h2><p className="sobre-nota">Aprendendo, construindo e evoluindo constantemente.</p></div>
    <div className="sobre-conteudo">{children}<p className="sobre-complemento">Olá usuário, eu me chamo Isaac! Tenho 19 anos e moro em Barueri SP e o que você está vendo é meu portfolio, eu construi ele para facilitar o acesso às minhas experiências, projetos, habilidades e até curiosidades sobre mim, tudo isso em React, Java & SpringBoot.  Espero que você curta e me conheça!</p><h3 className="tecnologias-titulo">Minhas Linguagens e Ferramentas:</h3><ul className="tecnologias-lista" aria-label="Tecnologias"><li className="sr-only">Minhas tecnologias:</li>{TECNOLOGIAS.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}</ul></div>
    </div>
  </section>;
}
