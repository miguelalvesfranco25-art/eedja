# EEDJA — Plataforma de estudos com IA da E.E. Dr. José Augusto

EEDJA é um app de estudos para o Ensino Fundamental II e o Ensino Médio. O aluno fotografa o
caderno, envia um PDF ou cola um texto; a IA organiza um guia de estudos e um quiz de 5 perguntas;
o app guarda o histórico e mostra o desempenho por matéria.

Identidade visual (verde e dourado) extraída diretamente da logo oficial da escola.

## Como rodar

```bash
npm install     # instala react, react-dom, react-icons, esbuild, typescript, playwright
npm run build   # gera dist/ (HTML + JS + CSS otimizados)
npm start       # sobe o servidor em http://localhost:8787
```

Durante o desenvolvimento, `npm run dev` builda em modo observação e já sobe o servidor junto.

`npm run typecheck` e `npm run lint` rodam as verificações de tipo. `npm run test:e2e` roda o
teste de ponta a ponta (Playwright) cobrindo cadastro → captura → quiz → resultado → desempenho →
perfil — ele espera o servidor já rodando em modo `mock` (padrão).

## Arquitetura de IA: real ou simulada, sem custo nenhum

O app tem **dois provedores de IA intercambiáveis**, escolhidos pela variável `AI_PROVIDER` no
arquivo `.env`:

- **`mock`** (padrão): conteúdo de demonstração, gerado localmente, sem chamar nenhuma API e sem
  custo algum. Serve para navegar pelo app, testar o fluxo e mostrar para a escola antes mesmo de
  ter uma chave de IA configurada. Toda tela que usa esse modo mostra um aviso amarelo deixando
  isso claro — o app nunca finge que um conteúdo de exemplo é uma análise real do material do
  aluno.
- **`gemini`**: IA real, usando a API gratuita do Google Gemini (Google AI Studio). **Não tem
  custo** dentro da cota gratuita — diferente da API da Anthropic, o Gemini não pede cartão de
  crédito para gerar uma chave.

A troca entre os dois é só uma linha no `.env` — nenhum código precisa mudar.

### Como ativar a IA real (Gemini), passo a passo

1. Acesse **https://aistudio.google.com/apikey** e faça login com uma conta Google.
2. Clique em **"Create API key"** (pode escolher ou criar um projeto do Google Cloud — não pede
   cartão).
3. Copie a chave gerada. Uma chave real do Gemini **sempre começa com `AIzaSy`** e tem uns 39
   caracteres.
4. Abra o arquivo `.env` na raiz do projeto e preencha:
   ```
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...a_sua_chave_aqui...
   ```
5. Reinicie o servidor (`npm start` ou `npm run dev`).

### Sobre a chave que já está no `.env`

O `.env` já está configurado com `AI_PROVIDER=gemini` e com a chave que você enviou
(`AQ.Ab8RN6...`). Para ser transparente: essa chave **não está no formato padrão** de uma chave do
Gemini Developer API (que começa com `AIzaSy`), então é possível que ela seja de outra área do
Google ou tenha sido copiada incompleta. Ela foi deixada configurada assim mesmo porque este
projeto foi construído num ambiente de desenvolvimento em nuvem que **não tem acesso à internet do
Gemini** (só a API da Anthropic é liberada lá, usada apenas para testes internos durante a
construção do app) — ou seja, não foi possível testar essa chave de ponta a ponta antes da
entrega.

Isso significa que o primeiro teste de verdade só acontece quando o app roda num computador com
internet normal. Dois cenários:

- **A chave funciona**: ótimo, a IA real já está ativa, sem nenhum passo extra.
- **A chave não funciona**: o Google devolve um erro bem claro (algo como `API key not valid`), que
  aparece na tela de captura como um aviso — o app nunca trava nem finge que gerou algo. Nesse
  caso, é só seguir os 5 passos acima para gerar uma chave nova em aistudio.google.com/apikey e
  colar no lugar da atual.

Em qualquer um dos dois cenários, o app continua 100% funcional em modo simulado enquanto isso não
for resolvido — nada fica bloqueado.

### Por que não usar a API da Anthropic (Claude) em produção?

Foi pedido explicitamente para não gastar nada com cobranças. A API da Anthropic pede cartão de
crédito mesmo para o nível de entrada; a do Gemini, não. Por isso o Gemini é o provedor de produção
e a Anthropic não é usada no app entregue (ela só foi usada internamente, durante a construção,
para testar trechos de código nesta sandbox, já que é a única API de IA que esse ambiente de
desenvolvimento conseguia alcançar).

## Estrutura do projeto

```
src/
  pages/        Landing, Onboarding, Dashboard, Subjects, Capture, StudyGuide,
                Quiz, QuizResult, Performance, Profile, NotFound
  components/   componentes de UI reutilizáveis (botões, cards, modal, etc.) e
                o layout (barra lateral no desktop, menu inferior no celular)
  lib/          roteador próprio, storage (LocalStorage), estatísticas, geração
                de id, cliente de IA do navegador
  data/         lista de todas as matérias por etapa de ensino (BNCC)
  types/        tipos do domínio (perfil do aluno, material de estudo, quiz...)
  styles/       design system em CSS puro, com as cores oficiais da escola

server/
  index.mjs     servidor HTTP (estático + SPA fallback + rota /api/analyze)
  ai/
    provider.mjs  escolhe entre mock e gemini, conforme o .env
    mock.mjs       conteúdo de demonstração, sem custo e sem rede
    gemini.mjs      integração real com a API do Gemini
```

Todos os dados do aluno (perfil, resumos gerados, histórico de quizzes) ficam salvos só no
LocalStorage do navegador de cada aluno — nada é enviado para um servidor central além da própria
chamada de geração de conteúdo.

## O que já funciona hoje

- Cadastro do aluno (nome, etapa de ensino, ano/série) — do 6º ano do Fundamental II à 3ª série
  do Médio.
- Todas as matérias de cada etapa, seguindo a BNCC (até Filosofia, Sociologia e Ensino Religioso).
- Captura por foto, PDF ou texto colado.
- Geração de guia de estudos (resumo, pontos-chave, seções) e quiz de 5 perguntas.
- Histórico de tentativas de quiz e acompanhamento de notas por matéria.
- Design com as cores e identidade da escola, responsivo (celular e desktop).

## O que fica para depois (de propósito)

Conforme conversado, isso **não foi construído agora** — mas o app já tem os encaixes prontos para
quando a escola enviar os dados:

- **Boletim oficial**: a tela "Minhas notas" já tem um espaço reservado explicando que o boletim
  oficial vai aparecer ali assim que a escola integrar os dados.
- **Alunos em destaque, imagens da escola, etc.**: ainda não há painel administrativo para isso —
  é só me mandar os dados/imagens quando a escola os passar, e esse recurso entra como um próximo
  prompt, sem precisar reconstruir nada do que já existe.

## Como publicar na internet de graça (sem comprar domínio)

Hoje o app só roda no computador onde você deu `npm start` (em `http://localhost:8787`, só nessa
máquina). Para qualquer aluno ou professor acessar de qualquer lugar, pelo celular ou computador
deles, o app precisa estar hospedado em algum serviço que fique no ar 24h e dê um endereço próprio
— sem precisar comprar nada.

O serviço recomendado é o **Render** (render.com): tem um plano gratuito de verdade, **não pede
cartão de crédito** para criar conta nem para usar o plano grátis, e dá um endereço gratuito do
tipo `https://eedja.onrender.com` — sem precisar comprar domínio. O único "custo" é que, se o app
ficar 15 minutos sem ninguém acessar, ele "dorme" e demora uns 30-60 segundos para acordar no
próximo acesso — perfeitamente aceitável para o uso de uma escola. Como todos os dados do aluno
ficam no navegador de cada um (LocalStorage) e não no servidor, esse "dormir e acordar" nunca
apaga o progresso de ninguém.

### Passo a passo

**1. Colocar o projeto no GitHub** (o Render só publica a partir de um repositório Git)

A pasta `~/Desktop/eedja` já está preparada como um repositório Git local (isso já foi feito por
mim — `git init`, `git add` e o primeiro commit já existem). Falta só criar o repositório lá no
GitHub e enviar o que já está pronto.

Crie uma conta grátis em **https://github.com** (se ainda não tiver) e, já logado, clique em
**"New repository"**, dê o nome `eedja`, deixe como **Public** ou **Private** (os dois funcionam no
plano grátis do Render) e **não** marque nenhuma opção de criar README/.gitignore (o projeto já tem
os seus). Depois de criado, o GitHub mostra os comandos para ligar o projeto local a ele — abra o
Terminal do seu Mac e rode:

```bash
cd ~/Desktop/eedja
git remote add origin https://github.com/SEU-USUARIO/eedja.git
git branch -M main
git push -u origin main
```

**2. Criar o Web Service no Render**

1. Crie uma conta grátis em **https://render.com** (pode entrar direto com a conta do GitHub, é mais
   rápido) — não pede cartão.
2. No painel, clique em **"New +" → "Web Service"**.
3. Escolha o repositório `eedja` que você acabou de subir (o Render pede permissão para ver seus
   repositórios do GitHub — autorize).
4. Confirme os campos (o Render costuma detectar sozinho, mas confira):
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
5. Em **"Environment Variables"**, adicione (isso substitui o `.env`, que não vai para o GitHub de
   propósito, por segurança):
   - `AI_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = a sua chave do Gemini
6. Clique em **"Create Web Service"**. O primeiro deploy demora alguns minutos — o Render mostra o
   log em tempo real.

Ao final, o Render dá um endereço fixo e gratuito, parecido com `https://eedja.onrender.com`. Esse
é o link que pode ser compartilhado com qualquer aluno ou professor — basta internet, não precisa
instalar nada.

Há também um arquivo `render.yaml` já incluído no projeto: se preferir, no passo 2 o Render
detecta esse arquivo automaticamente e preenche sozinho o Build/Start Command (a chave do Gemini
ainda precisa ser colada manualmente no painel, por segurança — ela nunca vai para o GitHub).

### Um detalhe importante sobre a chave do Gemini

Esta sandbox de desenvolvimento nunca teve acesso à internet do Gemini para testar a chave que foi
enviada. O Render tem internet normal — então o deploy no Render também vai ser, finalmente, o
primeiro teste real dessa chave. Se o Google devolver erro (`API key not valid` nos logs do
Render), é só gerar uma chave nova em **aistudio.google.com/apikey** e atualizar a variável
`GEMINI_API_KEY` no painel do Render (não precisa de novo deploy manual: o Render reinicia o app
sozinho quando uma variável de ambiente é alterada).

## Testes

- `npm run typecheck` — TypeScript em modo estrito, sem erros.
- `npm run lint` — typecheck + checagem de que não há texto de placeholder (`TODO`, `FIXME`) em
  código que deveria estar pronto.
- `npm run test:e2e` — Playwright, cobrindo o fluxo completo de um aluno novo até o desempenho,
  em modo `mock` (determinístico, sem depender de rede).
