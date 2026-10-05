// Teste de ponta a ponta (Playwright) cobrindo o fluxo principal do EEDJA:
// cadastro -> escolher matéria -> capturar texto -> ler o resumo -> fazer o
// quiz -> ver o resultado -> conferir o desempenho -> editar o perfil.
//
// Pressupõe que o servidor (server/index.mjs) já está rodando em
// http://localhost:8787 com AI_PROVIDER=mock (padrão), para que o teste não
// dependa de rede nem de uma chave de IA real.
import { chromium } from "playwright";

const BASE_URL = process.env.EEDJA_BASE_URL || "http://localhost:8787";

function assert(condition, message) {
  if (!condition) throw new Error(`Falha no teste: ${message}`);
}

async function main() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  try {
    // 1. Landing
    await page.goto(BASE_URL);
    await page.waitForSelector("a:has-text('Começar agora')");
    console.log("[e2e] landing ok");

    // 2. Onboarding — passo 1: nome
    await page.click("a:has-text('Começar agora')");
    await page.waitForSelector("#student-name");
    await page.fill("#student-name", "Maria Teste");
    await page.locator("button:has-text('Continuar')").click();

    // passo 2: etapa de ensino (só restam Fundamental II e Ensino Médio)
    await page.waitForSelector(".choice-card");
    const levelCount = await page.locator(".choice-card").count();
    assert(levelCount === 2, `deveriam existir só 2 opções de etapa de ensino, encontrado: ${levelCount}`);
    await page.locator(".choice-card:has-text('Ensino Médio')").click();
    await page.waitForSelector(".choice-card.selected:has-text('Ensino Médio')");
    await page.locator("button:has-text('Continuar')").click();

    // passo 3: ano/série
    await page.waitForSelector(".choice-card:has-text('1ª série')");
    await page.locator(".choice-card:has-text('1ª série')").click();
    await page.waitForSelector(".choice-card.selected:has-text('1ª série')");
    await page.locator("button:has-text('Continuar')").click();

    // passo 4: confirmação
    await page.waitForSelector("text=Tudo certo?");
    await page.locator("button:has-text('Começar a estudar')").click();

    await page.waitForSelector("text=Olá, Maria", { timeout: 15000 });
    console.log("[e2e] onboarding ok, chegou no dashboard");

    // 3. Ir para Matérias e escolher uma
    await page.locator("a:has-text('Matérias')").first().click();
    await page.waitForSelector(".subject-grid");
    await page.locator(".subject-grid a:has-text('Matemática')").first().click();

    // 4. Captura via texto
    await page.waitForSelector("text=Nova captura");
    await page.locator(".capture-source-tab:has-text('Texto')").click();
    await page.fill("#topic", "Equações do 1º grau");
    await page.fill("#text-content", "Uma equação do 1º grau tem a forma ax + b = 0, com a diferente de zero.");
    await page.locator("button:has-text('Gerar guia de estudos')").click();

    await page.waitForSelector("a:has-text('Fazer o quiz')", { timeout: 20000 });
    console.log("[e2e] captura + geração do guia de estudos ok");

    // 5. Fazer o quiz (modo mock: toda resposta correta é a alternativa A)
    await page.locator("a:has-text('Fazer o quiz')").click();
    await page.waitForSelector(".quiz-question");
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector(".quiz-option");
      const options = await page.$$(".quiz-option");
      assert(options.length === 4, `quiz deveria ter 4 alternativas (pergunta ${i + 1})`);
      await options[0].click();
      await page.waitForSelector(".quiz-explanation");
      const nextLabel = i === 4 ? "Ver resultado" : "Próxima pergunta";
      await page.locator(`button:has-text('${nextLabel}')`).click();
    }

    // 6. Resultado
    await page.waitForSelector(".result-score-ring");
    const scoreText = await page.textContent(".result-score-ring");
    assert(scoreText?.includes("100%"), `pontuação esperada 100% (modo mock), recebido: ${scoreText}`);
    console.log("[e2e] quiz + resultado ok:", scoreText);

    // 7. Desempenho
    await page.locator("a:has-text('Minhas notas')").first().click();
    await page.waitForSelector(".subject-performance-row");
    console.log("[e2e] página de desempenho ok");

    // 8. Perfil — editar nome
    await page.locator("a:has-text('Perfil')").first().click();
    await page.waitForSelector("#profile-name");
    await page.fill("#profile-name", "Maria Teste Editada");
    await page.locator("button:has-text('Salvar alterações')").click();
    await page.waitForSelector("text=Dados atualizados.");
    console.log("[e2e] edição de perfil ok");

    // 9. Rota inexistente -> 404
    await page.goto(`${BASE_URL}/rota-que-nao-existe`);
    await page.waitForSelector("text=Página não encontrada");
    console.log("[e2e] 404 ok");

    assert(consoleErrors.length === 0, `erros de console encontrados: ${JSON.stringify(consoleErrors)}`);

    console.log("\n[e2e] TODOS OS TESTES PASSARAM");
  } catch (err) {
    console.error("[e2e] FALHOU. Erros de console coletados até agora:", JSON.stringify(consoleErrors, null, 2));
    console.error("[e2e] URL no momento da falha:", page.url());
    await page.screenshot({ path: "/tmp/e2e-failure.png" }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
