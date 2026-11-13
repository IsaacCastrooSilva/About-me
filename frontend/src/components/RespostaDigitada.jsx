import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const INTERVALO = 30;        // ms entre passos
const DURACAO_MAXIMA = 4500; // respostas longas não demoram mais que isso

// Fecha negrito e código abertos no trecho parcial, para a marcação não piscar.
function fecharMarcacao(parcial) {
  let texto = parcial;
  if ((texto.match(/\*\*/g) || []).length % 2) texto += "**";
  if ((texto.match(/`/g) || []).length % 2) texto += "`";
  return texto;
}

// Revela a resposta aos poucos, como se estivesse sendo escrita.
// Clicar no texto mostra tudo de uma vez.
export default function RespostaDigitada({ texto, aoAvancar, aoTerminar }) {
  const pedacos = useMemo(() => texto.split(/(\s+)/), [texto]);
  const [visiveis, setVisiveis] = useState(0);
  const callbacks = useRef({ aoAvancar, aoTerminar });
  useEffect(() => { callbacks.current = { aoAvancar, aoTerminar }; });

  useEffect(() => {
    callbacks.current.aoAvancar?.();
    if (visiveis >= pedacos.length) { callbacks.current.aoTerminar?.(); return; }
    const porPasso = Math.max(2, Math.ceil(pedacos.length / (DURACAO_MAXIMA / INTERVALO)));
    const timer = setTimeout(() => setVisiveis(atual => Math.min(pedacos.length, atual + porPasso)), INTERVALO);
    return () => clearTimeout(timer);
  }, [visiveis, pedacos]);

  return <>
    <div className="sr-only">{texto}</div>
    <div className="markdown digitando" aria-hidden="true" onClick={() => setVisiveis(pedacos.length)} title="Clique para mostrar a resposta inteira">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{fecharMarcacao(pedacos.slice(0, visiveis).join(""))}</ReactMarkdown>
    </div>
  </>;
}
