let perguntasSelecionadas = [];

function iniciarQuiz() {
  const nome = document.getElementById("nome").value;
  const ra = document.getElementById("ra").value;
  const curso = document.getElementById("curso").value;
  const email = document.getElementById("email").value;

  if (!nome || !ra || !curso || !email) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // Oculta cadastro e mostra quiz
  document.getElementById("cadastro").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  // Salva dados do participante
  localStorage.setItem("participante", JSON.stringify({ nome, ra, curso, email }));

  // Pega perguntas do servidor
  fetch('/api/perguntas')
    .then(res => res.json())
    .then(perguntas => {
      perguntasSelecionadas = perguntas;
      const form = document.getElementById("quizForm");
      form.innerHTML = "";

      perguntas.forEach((pergunta, index) => {
        const bloco = document.createElement("div");
        bloco.classList.add("mb-4");

        const enunciado = document.createElement("p");
        enunciado.innerHTML = `<strong>${index + 1}. ${pergunta.pergunta}</strong>`;
        bloco.appendChild(enunciado);

        const opcoes = [pergunta.opcaoA, pergunta.opcaoB, pergunta.opcaoC, pergunta.opcaoD];

        opcoes.forEach((opcao, i) => {
          const id = `q${index}_op${i}`;
          const label = document.createElement("label");
          label.classList.add("d-block");
          label.innerHTML = `
            <input type="radio" name="q${index}" value="${String.fromCharCode(65 + i)}" id="${id}">

            ${opcao}
          `;
          bloco.appendChild(label);
        });

        form.appendChild(bloco);
      });
    })
    .catch(error => {
      alert("Erro ao carregar as perguntas. Tente novamente.");
      console.error("Erro ao buscar perguntas:", error);
    });
}

function enviarRespostas() {
  const respostas = [];
  const form = document.getElementById("quizForm");

  for (let i = 0; i < perguntasSelecionadas.length; i++) {
    const pergunta = perguntasSelecionadas[i];
    const marcada = form.querySelector(`input[name="q${i}"]:checked`);
    respostas.push({
      id: pergunta.id,
      resposta: marcada ? marcada.value : ""
    });
  }

  const participante = JSON.parse(localStorage.getItem("participante"));

  fetch("api/verificar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ respostas })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("pontuacao").textContent = `Você acertou ${data.pontuacao} de ${respostas.length} perguntas.`;
    })
    .catch(error => {
      alert("Erro ao enviar respostas. Tente novamente.");
      console.error("Erro ao verificar respostas:", error);
    });
}
