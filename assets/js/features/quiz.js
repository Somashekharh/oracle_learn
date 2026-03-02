import { QUIZ_QUESTIONS } from "../data/quiz-data.js";

const progressEl = document.getElementById("quiz-progress");
const questionEl = document.getElementById("quiz-question");
const optionsEl = document.getElementById("quiz-options");
const feedbackEl = document.getElementById("quiz-feedback");
const scoreEl = document.getElementById("quiz-score");
const nextBtn = document.getElementById("quiz-next");
const resetBtn = document.getElementById("quiz-reset");

let index = 0;
let score = 0;
let answered = false;
let completed = false;

function renderQuiz() {
  if (!progressEl || !questionEl || !optionsEl || !feedbackEl || !scoreEl) {
    return;
  }

  if (completed) {
    progressEl.textContent = `Completed ${QUIZ_QUESTIONS.length} questions`;
    questionEl.textContent = "Quiz complete";
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "Review explanations by retaking the quiz.";
    scoreEl.textContent = `Final Score: ${score} / ${QUIZ_QUESTIONS.length}`;
    return;
  }

  const question = QUIZ_QUESTIONS[index];
  progressEl.textContent = `Question ${index + 1} of ${QUIZ_QUESTIONS.length} • ${question.level}`;
  questionEl.textContent = question.question;
  scoreEl.textContent = `Score: ${score}`;
  feedbackEl.textContent = answered ? feedbackEl.textContent : "";

  optionsEl.innerHTML = question.options
    .map(
      (option, optionIndex) => `
      <button class="quiz-option" type="button" data-option-index="${optionIndex}">
        ${option}
      </button>
    `
    )
    .join("");
}

function markAnswers(selectedIndex) {
  const question = QUIZ_QUESTIONS[index];
  const optionButtons = Array.from(optionsEl.querySelectorAll(".quiz-option"));
  optionButtons.forEach((button) => {
    const optionIndex = Number(button.getAttribute("data-option-index"));
    if (optionIndex === question.answerIndex) {
      button.classList.add("correct");
    }
    if (optionIndex === selectedIndex && optionIndex !== question.answerIndex) {
      button.classList.add("incorrect");
    }
    button.disabled = true;
  });
}

optionsEl?.addEventListener("click", (event) => {
  if (answered || completed) {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.matches("[data-option-index]")) {
    return;
  }

  const selectedIndex = Number(target.getAttribute("data-option-index"));
  const question = QUIZ_QUESTIONS[index];
  const isCorrect = selectedIndex === question.answerIndex;

  if (isCorrect) {
    score += 1;
  }

  answered = true;
  markAnswers(selectedIndex);
  feedbackEl.textContent = `${isCorrect ? "Correct" : "Incorrect"}. ${question.explanation}`;
  scoreEl.textContent = `Score: ${score}`;
});

nextBtn?.addEventListener("click", () => {
  if (!completed && !answered) {
    feedbackEl.textContent = "Select an answer before moving to the next question.";
    return;
  }

  if (index >= QUIZ_QUESTIONS.length - 1) {
    completed = true;
    renderQuiz();
    return;
  }

  index += 1;
  answered = false;
  feedbackEl.textContent = "";
  renderQuiz();
});

resetBtn?.addEventListener("click", () => {
  index = 0;
  score = 0;
  answered = false;
  completed = false;
  feedbackEl.textContent = "";
  renderQuiz();
});

if (progressEl && questionEl && optionsEl) {
  renderQuiz();
}
