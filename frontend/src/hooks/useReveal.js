import { useEffect } from "react";
import useReducedMotion from "./useReducedMotion";

export default function useReveal() {
  const reduzir = useReducedMotion();
  useEffect(() => {
    const elementos = [...document.querySelectorAll("[data-reveal]")];
    if (reduzir || !("IntersectionObserver" in window)) {
      elementos.forEach(elemento => elemento.classList.add("visivel"));
      return;
    }
    const observador = new IntersectionObserver(entradas => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12 });
    elementos.forEach(elemento => { elemento.classList.add("reveal-pronto"); observador.observe(elemento); });
    return () => observador.disconnect();
  }, [reduzir]);
}
