import { useEffect, useState } from "react";

export default function useReducedMotion() {
  const [reduzir, setReduzir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizar = () => setReduzir(preferencia.matches);
    preferencia.addEventListener("change", atualizar);
    return () => preferencia.removeEventListener("change", atualizar);
  }, []);
  return reduzir;
}
