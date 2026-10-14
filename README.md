# Isaac · Portfólio

Frontend em React e Vite, com visual escuro, destaques em branco e a Cube AI para responder perguntas sobre Isaac.

## Rodar localmente

```sh
npm install
npm run dev
```

O chat usa o backend Spring Boot em `http://localhost:8080/api/chat`. Para outra URL, copie `.env.example` para `.env.local` e ajuste `VITE_CHAT_API_URL`. Variáveis `VITE_` são públicas.

Contrato: `POST /api/chat`, com `{ "message": "pergunta", "conversationId": "uuid" }`, retornando `{ "answer": "resposta em Markdown" }`. Os chips enviam suas perguntas diretamente. Enter envia e Shift+Enter cria uma linha. As conversas ficam na memória da aba, com UUID próprio, e o envio mantém o timeout de 60 segundos.

## Estrutura e estilos

- `src/index.css`: tokens de cores, tipografia, espaçamentos, raios, sombras e movimento.
- `src/components/Navigation.*`: menu fixo com blur, indicação de seção ativa e menu mobile.
- `src/components/Hero.*`: apresentação, CTAs e GIF.
- `src/components/Sobre.jsx`: apresentação pessoal e tecnologias.
- `src/components/CubePreview.jsx`: exemplo demonstrativo; não faz requisições nem entra no histórico real.
- `src/components/Icon.jsx`: ícones da biblioteca Lucide.
- `src/hooks/`: preferência de movimento e entradas com IntersectionObserver.
- `src/App.jsx`: integração das seções e fluxo original do chat.
- `src/App.css`: layouts das seções, chat e histórico.

Inter e JetBrains Mono são servidas localmente pelo bundle, sem chamadas a serviços de fontes. Os layouts usam uma coluna em telas de 375px e duas nas seções principais em 768px e 1280px. O menu vira hambúrguer abaixo de 768px.

## Movimento e mídia

O GIF do hero tem dimensões declaradas, prioridade alta e decodificação assíncrona. O CSS reduz as cores RGB a tons de cinza. Com `prefers-reduced-motion`, um poster PNG substitui o GIF e a digitação e as entradas ficam estáticas.

Melhoria recomendada: converter `player-one.gif` para WebM e MP4, mantendo o poster como fallback. Comparar os arquivos convertidos antes de substituir; não foi adicionado um conversor pesado ao projeto.

## Verificar

```sh
npm run lint
npm run build
```
