import Pixels from "./Pixels";

// Tecnologias agrupadas por tipo, cada grupo numa das cores do site.
const GRUPOS = [
  { titulo: "Linguagens", cor: "var(--pixel-r)", itens: ["Java", "ColdFusion"] },
  { titulo: "Frameworks", cor: "var(--pixel-g)", itens: ["Spring Boot", "React"] },
  { titulo: "Banco de dados", cor: "var(--pixel-b)", itens: ["SQL Server"] },
  { titulo: "Ferramentas", cor: "var(--texto)", itens: ["IntelliJ IDEA", "Visual Studio"] },
];

// Resumo em formato de arquivo JSON: [chave, valor, tipo do valor].
const RESUMO = [
  ["nome", '"Isaac de Castro"', "texto"],
  ["idade", "19", "valor"],
  ["cidade", '"Barueri, SP"', "texto"],
  ["foco", '["back-end", "APIs", "automação"]', "texto"],
  ["aprendendo", "true", "valor"],
];

export default function Sobre ({ children }) {
  return <section className="sobre-secao secao" id="sobre" aria-labelledby="sobre-titulo" data-reveal>
    <div className="secao-topo"><p className="rotulo"><Pixels />Sobre mim</p></div>
    <div className="xadrez" aria-hidden="true" />
    <div className="sobre-painel">
      <div className="sobre-intro">
        <h2 id="sobre-titulo">Mais sobre mim<br />por trás do código.</h2>
        <p className="sobre-nota">Aprendendo, construindo e evoluindo constantemente.</p>
        <figure className="sobre-cartao" aria-label="Resumo sobre Isaac">
          <figcaption><Pixels />isaac.json</figcaption>
          <pre><code>
            {"{\n"}
            {RESUMO.map(([chave, valor, tipo], indice) => <span key={chave}>
              {"  "}<span className="json-chave">"{chave}"</span>{": "}<span className={`json-${tipo}`}>{valor}</span>{indice < RESUMO.length - 1 ? "," : ""}{"\n"}
            </span>)}
            {"}"}<span className="json-cursor" aria-hidden="true" />
          </code></pre>
        </figure>
      </div>
      <div className="sobre-conteudo">
        {children}
        <p className="sobre-complemento">Olá! Eu me chamo Isaac, tenho 19 anos e moro em Barueri, SP. O que você está vendo é o meu portfólio: construí ele para facilitar o acesso às minhas experiências, projetos, habilidades e até curiosidades sobre mim, tudo isso em <span className="destaque" style={{ "--cor": "var(--pixel-r)" }}>React</span>, <span className="destaque" style={{ "--cor": "var(--pixel-g)" }}>Java</span> e <span className="destaque" style={{ "--cor": "var(--pixel-b)" }}>Spring Boot</span>. Espero que você curta e me conheça!</p>
        <h3 className="tecnologias-titulo">Minhas linguagens e ferramentas</h3>
        <div className="tecnologias-grupos">
          {GRUPOS.map(({ titulo, cor, itens }) => <div key={titulo} className="tecnologias-grupo" style={{ "--cor": cor }}>
            <h4>{titulo}</h4>
            <ul>{itens.map(item => <li key={item}>{item}</li>)}</ul>
          </div>)}
        </div>
      </div>
    </div>
    <div className="xadrez" aria-hidden="true" />
  </section>;
}
