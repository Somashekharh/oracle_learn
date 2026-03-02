import { DATAFLOW_OPERATION_INFO, DATAFLOW_STEPS_BY_OPERATION } from "../data/dataflow-data.js";

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
const operationName = document.getElementById("flow-operation-name");
const operationGoal = document.getElementById("flow-goal");
const operationTxClass = document.getElementById("flow-tx-class");
const operationLockProfile = document.getElementById("flow-lock-profile");
const operationDurability = document.getElementById("flow-durability");
const operationDbaFocus = document.getElementById("flow-dba-focus");
const componentList = document.getElementById("flow-components");
const timeline = document.getElementById("flow-timeline");

const prevBtn = document.getElementById("flow-prev");
const nextBtn = document.getElementById("flow-next");
const autoPlayBtn = document.getElementById("flow-autoplay");
const stopBtn = document.getElementById("flow-stop");
const replayBtn = document.getElementById("flow-replay");
const speedSelect = document.getElementById("flow-speed");

let activeOperation = "SELECT";
let activeIndex = 0;
let autoPlayTimer = null;

function stopAutoPlay() {
  if (autoPlayTimer) {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}

function stageLabel(stageId) {
  return stageId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function operationSteps() {
  return DATAFLOW_STEPS_BY_OPERATION[activeOperation] || [];
}

function updateControlStates(steps) {
  if (prevBtn) {
    prevBtn.disabled = activeIndex <= 0;
  }
  if (nextBtn) {
    nextBtn.disabled = activeIndex >= steps.length - 1;
  }
}

function renderOperationMeta() {
  const meta = DATAFLOW_OPERATION_INFO[activeOperation];
  if (!meta) {
    return;
  }

  if (operationName) {
    operationName.textContent = meta.label;
  }
  if (operationGoal) {
    operationGoal.textContent = meta.goal;
  }
  if (operationTxClass) {
    operationTxClass.textContent = meta.transactionClass;
  }
  if (operationLockProfile) {
    operationLockProfile.textContent = meta.lockProfile;
  }
  if (operationDurability) {
    operationDurability.textContent = meta.durabilityRule;
  }
  if (operationDbaFocus) {
    operationDbaFocus.textContent = meta.dbaFocus;
  }
}

function renderTimeline(steps) {
  if (!timeline) {
    return;
  }

  timeline.innerHTML = steps
    .map((step, index) => {
      const isActive = index === activeIndex;
      return `<button class="flow-timeline-step ${isActive ? "is-active" : ""}" data-step-index="${index}" type="button" aria-pressed="${String(isActive)}">${index + 1}. ${stageLabel(step.stage)}</button>`;
    })
    .join("");
}

function stageCoverage(steps, index) {
  const currentCoverage = new Set();
  const fullCoverage = new Set();

  steps.forEach((step, stepIndex) => {
    step.animationTargetIds.forEach((id) => {
      fullCoverage.add(id);
      if (stepIndex <= index) {
        currentCoverage.add(id);
      }
    });
  });

  return { currentCoverage, fullCoverage };
}

function renderComponents(steps, index) {
  if (!componentList) {
    return;
  }

  const { currentCoverage, fullCoverage } = stageCoverage(steps, index);
  const entries = Array.from(fullCoverage);

  componentList.innerHTML = entries
    .map((stageId) => {
      const isVisited = currentCoverage.has(stageId);
      return `<span class="flow-component-chip ${isVisited ? "is-visited" : ""}">${stageLabel(stageId)}</span>`;
    })
    .join("");
}

function moveToStep(index) {
  const steps = operationSteps();
  if (!steps.length) {
    return;
  }

  const clamped = Math.max(0, Math.min(index, steps.length - 1));
  activeIndex = clamped;
  renderStep();
}

function stageHistoryForCurrentStep(steps, index) {
  const history = new Set();
  steps.slice(0, index + 1).forEach((step) => {
    step.animationTargetIds.forEach((id) => history.add(id));
  });
  return history;
}

function renderStep() {
  const steps = operationSteps();
  if (!steps.length) {
    return;
  }

  const step = steps[activeIndex];
  if (!step) {
    return;
  }

  const history = stageHistoryForCurrentStep(steps, activeIndex);

  const meta = DATAFLOW_OPERATION_INFO[activeOperation];
  operationLabel.textContent = `Operation: ${meta ? meta.label : activeOperation}`;
  stepCounter.textContent = `Step ${activeIndex + 1} of ${steps.length}`;
  stepTitle.textContent = stageLabel(step.stage);
  stepExplanation.textContent = step.explanation;
  commandHint.textContent = step.commandHint;
  watchpoint.textContent = step.watchpoint;
  risk.textContent = step.failureRisk;
  if (progressEl) {
    progressEl.style.width = `${((activeIndex + 1) / steps.length) * 100}%`;
  }

  renderOperationMeta();
  renderComponents(steps, activeIndex);
  renderTimeline(steps);
  updateControlStates(steps);

  stageNodes.forEach((node) => {
    const stageId = node.getAttribute("data-stage") || "";
    const isCurrent = step.animationTargetIds.includes(stageId);
    const isVisited = history.has(stageId);
    node.classList.toggle("is-active", isCurrent);
    node.classList.toggle("is-trail", isVisited && !isCurrent);
    node.setAttribute("aria-pressed", String(isCurrent));
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
  stopAutoPlay();
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
  const steps = operationSteps();
  if (!steps.length) {
    return;
  }

  stopAutoPlay();
  moveToStep(activeIndex - 1);
});

nextBtn?.addEventListener("click", () => {
  const steps = operationSteps();
  if (!steps.length) {
    return;
  }

  stopAutoPlay();
  moveToStep(activeIndex + 1);
});

function startAutoPlay() {
  const steps = operationSteps();
  if (!steps.length) {
    return;
  }

  stopAutoPlay();
  const interval = Number(speedSelect?.value || 1700);
  autoPlayTimer = window.setInterval(() => {
    if (activeIndex >= steps.length - 1) {
      stopAutoPlay();
      return;
    }
    moveToStep(activeIndex + 1);
  }, interval);
}

autoPlayBtn?.addEventListener("click", () => {
  const steps = operationSteps();
  if (!steps.length) {
    return;
  }

  if (activeIndex >= steps.length - 1) {
    moveToStep(0);
  }
  startAutoPlay();
});

stopBtn?.addEventListener("click", () => {
  stopAutoPlay();
});

replayBtn?.addEventListener("click", () => {
  stopAutoPlay();
  moveToStep(0);
});

timeline?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const button = target.closest("[data-step-index]");
  if (!(button instanceof HTMLElement)) {
    return;
  }

  const index = Number(button.getAttribute("data-step-index"));
  if (!Number.isInteger(index)) {
    return;
  }

  stopAutoPlay();
  moveToStep(index);
});

stageNodes.forEach((node) => {
  node.addEventListener("click", () => {
    const stageId = node.getAttribute("data-stage");
    if (!stageId) {
      return;
    }

    const steps = operationSteps();
    const targetIndex = steps.findIndex((step) => step.animationTargetIds.includes(stageId));
    if (targetIndex === -1) {
      return;
    }

    stopAutoPlay();
    moveToStep(targetIndex);
  });
});

window.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement) {
    const tag = target.tagName.toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") {
      return;
    }
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveToStep(activeIndex + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveToStep(activeIndex - 1);
  } else if (event.key === " ") {
    event.preventDefault();
    if (autoPlayTimer) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }
});

renderStep();
