# About Me

Portfólio com o Theodor AI, um chat de inteligência artificial. O backend Java 21 com Spring
Boot, Maven, JPA e H2 fica na raiz; o frontend React/Vite fica em `frontend/`.

## Executar o projeto completo

Preencha as chaves somente no `.env` da raiz. No primeiro terminal PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend.ps1 iniciar
```

Em outro terminal, a partir da raiz, com Node.js/npm instalados:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Abra a URL exibida pelo Vite. O frontend usa por padrão
`http://localhost:8080/api/chat`. Para mudar o endereço, copie
`frontend/.env.example` para `frontend/.env` e ajuste `VITE_CHAT_API_URL`.
As chaves Gemini e Groq pertencem exclusivamente ao backend.

Para validar o frontend, execute `npm.cmd run build` e `npm.cmd run lint`
na pasta `frontend`.

## Usar no VS Code

1. Abra esta pasta, que contém este README, o `pom.xml` e o `src` principal.
   A subpasta `portfolioai/` contém outro projeto inicial com o mesmo nome;
   ela foi preservada e excluída da importação Java/Maven do workspace.
2. Use um JDK 21 e as extensões recomendadas: **Extension Pack for Java**
   e **Spring Boot Extension Pack**. Não precisa instalar Maven separadamente:
   o projeto inclui o Maven Wrapper.
3. O arquivo `.env` local já foi preparado. Em uma nova cópia do projeto,
   copie `.env.example` para `.env`. Preencha `GEMINI_API_KEY` e
   `GROQ_API_KEY` com suas chaves. Esse arquivo não deve ser versionado.
4. Aguarde a importação Java/Maven. Pressione **F5** e selecione
   **PortfolioAI - Backend**. Para executar sem depuração, use **Ctrl+F5**.
   Para parar a depuração, use **Shift+F5**.

A configuração F5 carrega `.env` e executa a aplicação a partir da raiz,
mantendo o banco H2 e o cache em `data/`. A porta padrão é `8080` e o endpoint
de chat é `POST /api/chat`. A inicialização pode chamar a API Gemini para
gerar embeddings que ainda não estejam no cache.

## Compilar e testar

Para usar pelo terminal PowerShell, na pasta principal:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend.ps1 iniciar
powershell -ExecutionPolicy Bypass -File .\backend.ps1 compilar
powershell -ExecutionPolicy Bypass -File .\backend.ps1 testar
powershell -ExecutionPolicy Bypass -File .\backend.ps1 empacotar
```

`iniciar` carrega as chaves de `.env` (ou usa as variáveis já definidas no
terminal) e verifica se foram preenchidas antes de executar o backend.
Use **Ctrl+C** para parar. `testar` executa os testes de persistência.

Execute apenas uma instância do backend por vez. O script verifica se a porta
ou o banco já estão em uso antes de iniciar. Para carregar mudanças na base
de conhecimento, pare a instância anterior com **Ctrl+C** (ou **Shift+F5**
no depurador do VS Code) e execute `iniciar` novamente.

`empacotar` gera o JAR sem executar testes. A opção `ExecutionPolicy Bypass`
vale apenas para esse processo, sem alterar a política do Windows.

- **Ctrl+Shift+B**: compilar.
- **Terminal > Run Task**: executar os testes de persistência ou gerar o JAR
  sem executar testes.
- No terminal PowerShell:

```powershell
.\mvnw.cmd compile
.\mvnw.cmd '-Dtest=ConversationPersistenceServiceTest,ConversationMemoryPersistenceServiceTest' test
.\mvnw.cmd -DskipTests package
```

O teste `PortfolioaiApplicationTests` carrega a aplicação inteira e pode acessar
serviços de IA e o banco configurado. Ele não faz parte da tarefa de persistência.
`mvnw.cmd test` executa a suíte inteira. O Maven e o Spring Boot não carregam
automaticamente o `.env` desta configuração de depuração: ao iniciar pelo
terminal, forneça as variáveis de ambiente na sessão.

## Publicar na web (gratuito)

Frontend no **Vercel**, backend no **Render** e, opcionalmente, banco
Postgres no **Neon** para guardar o histórico das conversas.

### 1. Backend no Render

1. Envie as alterações para o GitHub.
2. No Render, escolha **New > Blueprint** e selecione este repositório.
   O arquivo `render.yaml` cria o serviço com o `Dockerfile` da raiz.
3. Preencha as variáveis pedidas no painel:
   - `GEMINI_API_KEY` e `GROQ_API_KEY`: suas chaves.
   - `ALLOWED_ORIGINS`: o endereço do frontend, por exemplo
     `https://seusite.vercel.app` (vários endereços separados por vírgula).
     Se ainda não souber, preencha depois do passo 2 e faça um novo deploy.
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: veja o passo 3. Se ficarem
     vazias, o backend usa H2 em disco temporário, e o histórico é apagado
     a cada reinício.
4. Ao terminar, teste `https://<seu-servico>.onrender.com/api/health`;
   a resposta deve ser `ok`.

No plano gratuito, o serviço "dorme" após cerca de 15 minutos sem acesso.
A primeira pergunta depois disso pode levar até um minuto. Os embeddings
do Gemini são gerados de novo a cada inicialização.

### 2. Frontend no Vercel

1. No Vercel, escolha **Add New > Project** e importe o repositório.
2. Em **Root Directory**, selecione `frontend`. O Vercel detecta o Vite.
3. Em **Environment Variables**, adicione
   `VITE_CHAT_API_URL=https://<seu-servico>.onrender.com/api/chat`.
4. Faça o deploy. Se mudar essa variável depois, faça um novo deploy:
   o Vite fixa o valor durante o build.

### 3. Banco Postgres no Neon (opcional)

1. Crie um projeto gratuito no Neon e copie os dados de conexão.
2. No Render, defina:
   - `DB_URL=jdbc:postgresql://<host>/<banco>?sslmode=require`
     (o formato `postgresql://usuario:senha@...` do Neon não funciona
     diretamente; separe usuário e senha nas variáveis abaixo).
   - `DB_USERNAME` e `DB_PASSWORD`.
3. As tabelas são criadas automaticamente na primeira inicialização.

### Proteções da API

- Limite de 15 perguntas por minuto por IP e 120 no total
  (`CHAT_RATE_LIMIT_PER_MINUTE`, `CHAT_GLOBAL_RATE_LIMIT_PER_MINUTE`).
- Perguntas com no máximo 1000 caracteres (`CHAT_MAX_MESSAGE_LENGTH`).
- Lembre-se: tudo o que está em `src/main/resources/knowledge` pode ser
  revelado pela IA a qualquer visitante.

## Estrutura

- `src/main/java/com/isaac/portfolioai/controller`: endpoints HTTP.
- `dto`: objetos de entrada e saída da API.
- `service`: regras de negócio, integrações de IA e busca.
- `entity` e `repository`: persistência JPA.
- `model`: modelos internos de conhecimento e memória.
- `config`: configurações da aplicação, incluindo CORS.
- `src/main/resources/knowledge`: base de conhecimento em texto.
- `src/test/java`: testes existentes.
- `data`: banco H2 e cache locais; ignorados pelo Git.
- `.vscode`: configurações compartilháveis de execução e tarefas.

## Se o projeto não aparecer corretamente

Execute **Developer: Reload Window** pela paleta (**Ctrl+Shift+P**).
Se necessário, use **Java: Clean Java Language Server Workspace** para
reimportar o projeto. Em **Java: Configure Java Runtime**, confira o JDK 21.

Referência: [execução e depuração Java no VS Code](https://code.visualstudio.com/docs/java/java-debugging).
