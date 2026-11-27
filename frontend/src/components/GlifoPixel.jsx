// Números desenhados em pixel art (grade 3x5), com as camadas vermelha e azul
// deslocadas, como a aberração cromática do olho do hero.
const DIGITOS = {
  "0": ["111", "101", "101", "101", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
};

// Alguns pixels "falham" e piscam nas três cores.
const FALHAS = new Set([2, 7, 15]);

function celulas(texto) {
  const lista = [];
  [...texto].forEach((digito, posicao) => {
    (DIGITOS[digito] || DIGITOS["0"]).forEach((linha, y) => {
      [...linha].forEach((bit, x) => {
        if (bit === "1") lista.push({ x: posicao * 4 + x, y });
      });
    });
  });
  return lista;
}

export default function GlifoPixel({ texto }) {
  const pixels = celulas(texto);
  const largura = texto.length * 4 - 1;
  const desenhar = (classe, comFalhas = false) => (
    <g className={classe}>
      {pixels.map((p, i) => (
        <rect key={i} x={p.x + 0.06} y={p.y + 0.06} width="0.88" height="0.88"
          className={comFalhas && FALHAS.has(i) ? `glifo-falha glifo-falha-${i % 3}` : undefined} />
      ))}
    </g>
  );

  return (
    <svg className="glifo" viewBox={`-0.5 -0.5 ${largura + 1} 6`} shapeRendering="crispEdges" aria-hidden="true">
      {desenhar("glifo-r")}
      {desenhar("glifo-b")}
      {desenhar("glifo-base", true)}
    </svg>
  );
}
