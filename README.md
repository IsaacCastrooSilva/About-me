# PortfolioAI — backend

API Java 21 com Spring Boot, Maven, JPA e banco H2 local.

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
Use **Ctrl+C** para parar. `testar` executa os testes de persistência;
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
