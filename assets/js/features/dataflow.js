import { DATAFLOW_STEPS_BY_OPERATION } from "../data/dataflow-data.js";

const operationButtons = Array.from(document.querySelectorAll("[data-operation]"));
const stageNodes = Array.from(document.querySelectorAll(".flow-node"));
const operationLabel = document.getElementById("flow-operation-label");
const stepCounter = document.getElementById("flow-step-counter");
const stepTitle = document.getElementById("flow-step-title");
const stepExplanation = document.getElementById("flow-step-explanation");
const commandHint = document.getElementById("flow-command-hint");
const watchpoint = document.getElementById("flow-watchpoint");
const risk = document.getElementById("flow-risk");
const progressEl = document.getElementById("flow-progress");

const prevBtn = document.getElementById("flow-prev");
const nextBtn = document.getElementById("flow-next");
const replayBtn = document.getElementById("flow-replay");

let activeOperation = "SELECT";
let activeIndex = 0;
let replayTimer = null;

function stopReplay() {
  if (replayTimer) {
    window.clearInterval(replayTimer);
    replayTimer = null;
  }
}

function stageHistoryForCurrentStep(steps, index) {
  const history = new Set();
  steps.slice(0, index + 1).forEach((step) => {
    step.animationTargetIds.forEach((id) => history.add(id));
  });
  return history;
}

function renderStep() {
  const steps = DATAFLOW_STEPS_BY_OPERATION[activeOperation] || [];
  if (!steps.length) {
    return;
  }

  const step = steps[activeIndex];
  if (!step) {
    return;
  }

  const history = stageHistoryForCurrentStep(steps, activeIndex);

  operationLabel.textContent = `Operation: ${activeOperation}`;
  stepCounter.textContent = `Step ${activeIndex + 1} of ${steps.length}`;
  stepTitle.textContent = step.stage.replaceAll("_", " ");
  stepExplanation.textContent = step.explanation;
  commandHint.textContent = step.commandHint;
  watchpoint.textContent = step.watchpoint;
  risk.textContent = step.failureRisk;
  if (progressEl) {
    progressEl.style.width = `${((activeIndex + 1) / steps.length) * 100}%`;
  }

  stageNodes.forEach((node) => {
    const stageId = node.getAttribute("data-stage") || "";
    const isCurrent = step.animationTargetIds.includes(stageId);
    const isVisited = history.has(stageId);
    node.classList.toggle("is-active", isCurrent);
    node.classList.toggle("is-trail", isVisited && !isCurrent);
  });
}

function setOperation(operationName) {
  if (!DATAFLOW_STEPS_BY_OPERATION[operationName]) {
    return;
  }

  activeOperation = operationName;
  activeIndex = 0;
  operationButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-operation") === operationName);
  });
  stopReplay();
  renderStep();
}

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const operation = button.getAttribute("data-operation");
    if (!operation) {
      return;
    }
    setOperation(operation);
  });
});

prevBtn?.addEventListener("click", () => {
  const steps = DATAFLOW_STEPS_BY_OPERATION[activeOperation] || [];
  if (!steps.length) {
    return;
  }

  activeIndex = (activeIndex - 1 + steps.length) % steps.length;
  stopReplay();
  renderStep();
});

nextBtn?.addEventListener("click", () => {
  const steps = DATAFLOW_STEPS_BY_OPERATION[activeOperation] || [];
  if (!steps.length) {
    return;
  }

  activeIndex = (activeIndex + 1) % steps.length;
  stopReplay();
  renderStep();
});

replayBtn?.addEventListener("click", () => {
  const steps = DATAFLOW_STEPS_BY_OPERATION[activeOperation] || [];
  if (!steps.length) {
    return;
  }

  stopReplay();
  activeIndex = 0;
  renderStep();

  replayTimer = window.setInterval(() => {
    if (activeIndex >= steps.length - 1) {
      stopReplay();
      return;
    }
    activeIndex += 1;
    renderStep();
  }, 1250);
});

renderStep();
