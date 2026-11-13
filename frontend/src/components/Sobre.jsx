import Pixels from "./Pixels";

const TECNOLOGIAS = ["Java", "Spring Boot", "React", "SQL Server", "ColdFusion", "IntelliJ IDEA", "Visual Studio"];

export default function Sobre ({ children }) {
  return <section className="sobre-secao secao" id="sobre" aria-labelledby="sobre-titulo" data-reveal>
    <div className="secao-topo"><p className="rotulo"><Pixels />Sobre mim</p></div>
    <div className="xadrez" aria-hidden="true" />
    <div className="sobre-painel">
      <div className="sobre-intro"><h2 id="sobre-titulo">Mais sobre mim<br />por trás do código.</h2><p className="sobre-nota">Aprendendo, construindo e evoluindo constantemente.</p></div>
      <div className="sobre-conteudo">{children}<p className="sobre-complemento">Olá! Eu me chamo Isaac, tenho 19 anos e moro em Barueri, SP. O que você está vendo é o meu portfólio: construí ele para facilitar o acesso às minhas experiências, projetos, habilidades e até curiosidades sobre mim, tudo isso em React, Java e Spring Boot. Espero que você curta e me conheça!</p><h3 className="tecnologias-titulo">Minhas linguagens e ferramentas</h3><ul className="tecnologias-lista">{TECNOLOGIAS.map(tecnologia => <li key={tecnologia}>{tecnologia}</li>)}</ul></div>
    </div>
    <div className="xadrez" aria-hidden="true" />
  </section>;
}
