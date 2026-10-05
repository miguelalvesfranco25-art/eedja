// Provedor de IA SIMULADO — usado quando AI_PROVIDER não está definido como
// "gemini" (ou quando não há GEMINI_API_KEY configurada). Não faz nenhuma
// chamada de rede, não tem custo e serve para testar o fluxo inteiro do app
// agora mesmo. O conteúdo é sempre rotulado como demonstração — nunca deve
// ser confundido com uma análise real da foto/PDF enviado.

function buildKeyPoints(topic) {
  return [
    `Definição central de "${topic}" e por que esse assunto aparece na matéria.`,
    "Como esse conteúdo se conecta com o que já foi estudado antes.",
    "Um exemplo prático para fixar a ideia principal.",
    "Um erro comum que os alunos cometem sobre esse tema.",
  ];
}

export async function generateMock({ subjectName, topic, sourceType }) {
  const effectiveTopic = topic && topic.trim() ? topic.trim() : subjectName;

  const studyGuide = {
    title: effectiveTopic,
    overview:
      `Este é um resumo de demonstração sobre "${effectiveTopic}" (${subjectName}). ` +
      "O app está rodando em modo simulado — sem uma chave de IA real conectada, não é possível " +
      "ler o conteúdo do material enviado. Assim que uma chave do Gemini for configurada, este " +
      "resumo passa a ser gerado de verdade a partir da foto, PDF ou texto que você enviar.",
    keyPoints: buildKeyPoints(effectiveTopic),
    sections: [
      {
        heading: "Resumo do conteúdo enviado",
        content:
          `Em uma versão com IA real, aqui apareceria a explicação elaborada a partir do ${
            sourceType === "photo" ? "conteúdo da foto" : sourceType === "pdf" ? "conteúdo do PDF" : "texto"
          } que você enviou sobre "${effectiveTopic}". Por enquanto, este é um texto de exemplo para você navegar pelo app.`,
      },
      {
        heading: "Conceitos importantes",
        content:
          "Aqui a IA normalmente destacaria os 3 a 5 conceitos mais importantes do material, explicados " +
          "de forma simples, com exemplos do dia a dia quando possível.",
      },
      {
        heading: "Como isso costuma cair na prova",
        content:
          "Aqui apareceriam dicas de como esse conteúdo costuma ser cobrado em avaliações, junto com " +
          "sugestões de como revisar antes da prova.",
      },
    ],
  };

  const quiz = {
    questions: Array.from({ length: 5 }).map((_, i) => ({
      question: `Questão de exemplo ${i + 1} sobre "${effectiveTopic}" (modo demonstração).`,
      options: [
        "Alternativa correta de exemplo",
        "Alternativa incorreta de exemplo A",
        "Alternativa incorreta de exemplo B",
        "Alternativa incorreta de exemplo C",
      ],
      correctIndex: 0,
      explanation:
        "Em modo simulado todas as questões têm a primeira alternativa marcada como correta. " +
        "Com uma chave de IA real conectada, as perguntas e respostas são geradas a partir do conteúdo de verdade.",
    })),
  };

  return { studyGuide, quiz };
}
