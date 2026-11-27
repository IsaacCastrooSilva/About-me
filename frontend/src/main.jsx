import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import './index.css'
import App from './App.jsx'
import ErroPagina from './components/ErroPagina.jsx'
import LimiteErro from './components/LimiteErro.jsx'

// O site tem uma única página: qualquer outro caminho é 404.
const caminho = window.location.pathname.replace(/\/+$/, '')
const paginaExiste = caminho === '' || caminho === '/index.html'

// Só em desenvolvimento: ?erro=404, ?erro=500 ou ?erro=offline mostra cada estado.
const previa = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('erro') : null

function Raiz() {
  if (previa === '404' || previa === '500') return <ErroPagina codigo={Number(previa)} />
  if (!paginaExiste) return <ErroPagina codigo={404} />
  return <App previaOffline={previa === 'offline'} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LimiteErro>
      <Raiz />
    </LimiteErro>
  </StrictMode>,
)
