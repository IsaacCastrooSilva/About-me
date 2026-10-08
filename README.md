# Isaac · Portfólio IA

Frontend em React e Vite para conhecer o Isaac por meio de uma conversa. Visual em modo escuro com destaque em verde-sálvia, com sugestões de perguntas e layout responsivo.

## Rodar localmente

Na pasta `portfolio-ai-frontend`, execute:

```sh
npm install
npm run dev
```

O backend Spring Boot precisa estar rodando em `http://localhost:8080`, com CORS permitindo a origem do frontend. O backend não faz parte deste workspace.

Para usar outra URL, copie `.env.example` para `.env.local`, ajuste `VITE_CHAT_API_URL` e reinicie o Vite. Variáveis `VITE_` são públicas: não coloque chaves de API nelas.

Contrato preservado: `POST /api/chat`, recebendo `{ "message": "pergunta", "conversationId": "uuid" }` e retornando `{ "answer": "resposta em Markdown" }`.

## Personalizar

- `src/index.css`: cores principais nas variáveis de `:root`, especialmente `--destaque`, `--fundo` e `--lateral`.
- `src/App.css`: espaçamentos, tipografia, mensagens e regras de responsividade.
- `src/App.jsx`: textos de apresentação e perguntas no array `sugestoes`.
- `index.html` e `public/favicon.svg`: título, descrição e ícone da aba.

## Conversas

Enter envia; Shift+Enter insere uma nova linha. As sugestões enviam a pergunta diretamente ao backend. Durante uma resposta, o envio e a troca de conversa ficam bloqueados para manter o contexto correto.

Cada conversa tem um UUID próprio. O histórico existe somente na memória da aba e é reiniciado ao recarregar a página; isso também inicia um contexto novo na API. Não há respostas fictícias no frontend. Em caso de falha ou espera superior a 60 segundos, a pergunta volta ao campo para permitir outra tentativa.

## Verificar

```sh
npm run lint
npm run build
```
