import { Component } from "react";
import ErroPagina from "./ErroPagina";

// Se algum componente quebrar durante a renderização, mostra a página 500
// em vez de uma tela em branco.
export default class LimiteErro extends Component {
  state = { quebrou: false };

  static getDerivedStateFromError() {
    return { quebrou: true };
  }

  componentDidCatch(erro, info) {
    console.error("Erro na interface:", erro, info?.componentStack);
  }

  render() {
    return this.state.quebrou ? <ErroPagina codigo={500} /> : this.props.children;
  }
}
