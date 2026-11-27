import { useEffect, useState } from "react";
import Pixels from "./Pixels";
import "./AvisoConexao.css";

// Aviso em estilo terminal quando a internet cai. Some sozinho alguns
// segundos depois de a conexão voltar. `forcar` serve só para pré-visualização.
export default function AvisoConexao({ forcar = false }) {
  const [online, setOnline] = useState(() => !forcar && navigator.onLine);
  const [voltou, setVoltou] = useState(false);

  useEffect(() => {
    if (forcar) return;
    let timer = 0;
    const aoCair = () => { clearTimeout(timer); setVoltou(false); setOnline(false); };
    const aoVoltar = () => {
      setOnline(true);
      setVoltou(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVoltou(false), 3500);
    };
    window.addEventListener("offline", aoCair);
    window.addEventListener("online", aoVoltar);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("offline", aoCair);
      window.removeEventListener("online", aoVoltar);
    };
  }, [forcar]);

  const visivel = !online || voltou;

  return (
    <div className="aviso-conexao-area" role="status" aria-live="polite">
      {visivel && (
        <div className={"aviso-conexao" + (online ? " aviso-online" : "")}>
          <Pixels animado={!online} />
          <div>
            <p className="aviso-titulo"><span className="aviso-prompt">&gt;</span> {online ? "conexão restabelecida" : "sem conexão"}</p>
            <p className="aviso-texto">{online ? "Tudo certo de novo. O Theodor já pode responder." : "Você está offline. O site continua aqui, e o Theodor volta a responder quando a internet voltar."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
