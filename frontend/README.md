# Isaac · Portfólio

Frontend em React e Vite, com visual escuro, destaque em `#FF936F` e o Theodor AI para responder perguntas sobre Isaac.

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
- `src/components/TheodorPreview.*`: prévia interativa com exemplos sobre perfil, projetos e tecnologias. O visitante pode levar uma pergunta ao campo do chat para editar e enviar; a prévia não chama a API nem cria mensagens no histórico.
- `src/components/Icon.jsx`: ícones da biblioteca Lucide.
- `src/hooks/`: preferência de movimento e entradas com IntersectionObserver.
- `src/App.jsx`: integração das seções e fluxo original do chat.
- `src/App.css`: layouts das seções, chat e histórico.

Inter e JetBrains Mono são servidas localmente pelo bundle, sem chamadas a serviços de fontes. Os layouts usam uma coluna em telas de 375px e duas nas seções principais em 768px e 1280px. O menu vira hambúrguer abaixo de 768px.

## Movimento e mídia

O hero exibe nome, cargo e localização de Isaac à esquerda e `public/hero-eye.gif` à direita, com os botões “Falar com a minha IA” e “Sobre mim” abaixo dele. No celular, os textos aparecem antes do GIF e dos botões, em blocos centralizados. A imagem tem dimensões declaradas, prioridade alta e decodificação assíncrona. Com `prefers-reduced-motion`, `public/hero-eye-poster.png` substitui o GIF.

O GIF é servido localmente e preserva suas cores originais; o poster usa seu primeiro quadro.

## Verificar

```sh
npm run lint
npm run build
```
