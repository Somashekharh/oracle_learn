import { ARCHITECTURE_NODES } from "../data/architecture-data.js";

const nodeMap = new Map(ARCHITECTURE_NODES.map((node) => [node.id, node]));
const interactiveNodes = Array.from(document.querySelectorAll("[data-node]"));
const flowAwareNodes = Array.from(document.querySelectorAll("[data-flow-members]"));
const flowButtons = Array.from(document.querySelectorAll("[data-arch-flow]"));
const flowLines = Array.from(document.querySelectorAll(".diagram-flow-line"));
const flowParticles = Array.from(document.querySelectorAll(".flow-particle"));

const stage = document.getElementById("diagram-stage");
const canvas = document.getElementById("diagram-canvas");
const svg = canvas?.querySelector("svg");

const titleEl = document.getElementById("node-title");
const descriptionEl = document.getElementById("node-description");
const importanceEl = document.getElementById("node-importance");
const failureEl = document.getElementById("node-failure");
const commandEl = document.getElementById("node-command");
const outputEl = document.getElementById("node-output");
const scenarioEl = document.getElementById("node-scenario");
const flowDescEl = document.getElementById("arch-flow-desc");

const expandBtn = document.getElementById("diagram-expand");
const zoomInBtn = document.getElementById("diagram-zoom-in");
const zoomOutBtn = document.getElementById("diagram-zoom-out");
const resetBtn = document.getElementById("diagram-reset");
const walkBtn = document.getElementById("arch-flow-walk");
const stopBtn = document.getElementById("arch-flow-stop");

const FLOW_DESCRIPTIONS = {
  all: "All layers visible. Choose a flow mode to focus on one Oracle execution path.",
  query: "Query Path: client request -> listener -> dedicated server -> parse/cache -> buffer/datafile read -> result.",
  dml: "DML + Commit: data block changes -> undo + redo generation -> LGWR flush -> DBWn/CKPT persistence.",
  checkpoint: "Checkpoint Path: CKPT + DBWn synchronization of buffer changes into datafiles and control files.",
  recovery: "Recovery Path: redo chain (online + archived) plus SMON/RECO for crash/media/distributed recovery.",
  shared: "Shared Server Path: listener -> dispatcher -> shared server -> shared pool/large pool execution model."
};

const FLOW_SEQUENCES = {
  query: [
    "client_process",
    "listener",
    "dedicated_server",
    "shared_pool",
    "library_cache",
    "dictionary_cache",
    "buffer_cache",
    "datafiles",
    "result_cache"
  ],
  dml: [
    "client_process",
    "listener",
    "dedicated_server",
    "buffer_cache",
    "undo_tablespace",
    "redo_buffer",
    "lgwr",
    "online_redo",
    "ckpt",
    "dbwn",
    "datafiles",
    "control_files"
  ],
  checkpoint: ["buffer_cache", "dbwn", "ckpt", "datafiles", "control_files", "online_redo"],
  recovery: ["smon", "online_redo", "arcn", "archived_redo", "reco", "control_files", "datafiles", "undo_tablespace"],
  shared: ["client_process", "listener", "dispatcher", "shared_server", "large_pool", "shared_pool", "buffer_cache"]
};

let activeNodeId = "instance";
let activeFlow = "all";
let zoomLevel = 1;
let walkTimer = null;
let walkIndex = 0;

function parseFlowTags(raw) {
  return (raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function flowMatch(element, flowName) {
  if (flowName === "all") {
    return true;
  }
  const tags = parseFlowTags(element.getAttribute("data-flows") || element.getAttribute("data-flow-members") || "");
  return tags.includes(flowName) || tags.includes("all");
}

function updatePanel(node) {
  if (!node || !titleEl || !descriptionEl || !importanceEl || !failureEl || !commandEl || !outputEl || !scenarioEl) {
    return;
  }

  titleEl.textContent = node.label;
  descriptionEl.textContent = node.description;
  importanceEl.textContent = node.importance;
  failureEl.textContent = node.failureImpact;
  commandEl.textContent = node.checkCommand;
  outputEl.textContent = node.outputExample;
  scenarioEl.textContent = node.practicalScenario;
}

function applyActiveNode(nodeId) {
  if (!nodeMap.has(nodeId)) {
    return;
  }

  activeNodeId = nodeId;
  interactiveNodes.forEach((node) => {
    const isMatch = node.getAttribute("data-node") === nodeId;
    node.classList.toggle("is-active", isMatch);
  });
  updatePanel(nodeMap.get(nodeId));
}

function stopWalkthrough() {
  if (walkTimer) {
    window.clearInterval(walkTimer);
    walkTimer = null;
  }
  walkIndex = 0;
}

function applyFlowMode(flowName) {
  activeFlow = flowName;
  flowButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-arch-flow") === flowName);
  });

  flowLines.forEach((line) => {
    line.classList.toggle("is-hidden", !flowMatch(line, flowName));
  });

  flowParticles.forEach((particle) => {
    particle.classList.toggle("is-hidden", !flowMatch(particle, flowName));
  });

  flowAwareNodes.forEach((node) => {
    node.classList.toggle("is-dim", !flowMatch(node, flowName));
  });

  if (flowDescEl) {
    flowDescEl.textContent = FLOW_DESCRIPTIONS[flowName] || FLOW_DESCRIPTIONS.all;
  }

  stopWalkthrough();
}

function startWalkthrough() {
  const sequence = FLOW_SEQUENCES[activeFlow === "all" ? "query" : activeFlow];
  if (!sequence || !sequence.length) {
    return;
  }

  stopWalkthrough();
  const step = () => {
    const nodeId = sequence[walkIndex % sequence.length];
    applyActiveNode(nodeId);
    walkIndex += 1;
  };

  step();
  walkTimer = window.setInterval(step, 1250);
}

function applyZoom() {
  if (!svg) {
    return;
  }
  svg.style.transform = `scale(${zoomLevel})`;
  svg.style.transformOrigin = "center";
}

interactiveNodes.forEach((nodeEl) => {
  const nodeId = nodeEl.getAttribute("data-node");
  if (!nodeId || !nodeMap.has(nodeId)) {
    return;
  }

  const activate = () => {
    stopWalkthrough();
    applyActiveNode(nodeId);
  };

  nodeEl.addEventListener("mouseenter", activate);
  nodeEl.addEventListener("focus", activate);
  nodeEl.addEventListener("click", activate);
  nodeEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  });
});

flowButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const flow = button.getAttribute("data-arch-flow") || "all";
    applyFlowMode(flow);
  });
});

walkBtn?.addEventListener("click", startWalkthrough);
stopBtn?.addEventListener("click", stopWalkthrough);

expandBtn?.addEventListener("click", () => {
  if (!stage) {
    return;
  }

  const willExpand = !stage.classList.contains("is-expanded");
  stage.classList.toggle("is-expanded", willExpand);
  expandBtn.classList.toggle("is-active", willExpand);
  expandBtn.textContent = willExpand ? "Collapse" : "Expand";
  expandBtn.setAttribute("aria-pressed", String(willExpand));
});

zoomInBtn?.addEventListener("click", () => {
  zoomLevel = Math.min(1.85, zoomLevel + 0.1);
  applyZoom();
});

zoomOutBtn?.addEventListener("click", () => {
  zoomLevel = Math.max(0.65, zoomLevel - 0.1);
  applyZoom();
});

resetBtn?.addEventListener("click", () => {
  zoomLevel = 1;
  applyZoom();
  applyFlowMode("all");
  applyActiveNode("instance");
});

applyZoom();
applyFlowMode("all");
applyActiveNode(activeNodeId);
