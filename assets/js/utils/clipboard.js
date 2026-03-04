export async function copyTextWithFallback(text, promptLabel = "Copy this text") {
  const value = String(text ?? "").trim();
  if (!value) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Continue to fallback methods.
    }
  }

  try {
    const temp = document.createElement("textarea");
    temp.value = value;
    temp.setAttribute("readonly", "true");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    const copied = document.execCommand("copy");
    temp.remove();
    if (copied) {
      return true;
    }
  } catch {
    // Continue to prompt fallback.
  }

  try {
    window.prompt(promptLabel, value);
  } catch {
    // Ignore prompt failures.
  }
  return false;
}

export function setTemporaryButtonLabel(
  button,
  copied,
  {
    successLabel = "Copied",
    failureLabel = "Copy manually",
    resetLabel,
    timeoutMs = 1100
  } = {}
) {
  if (!button) {
    return;
  }

  const original = resetLabel ?? button.textContent ?? "";
  button.textContent = copied ? successLabel : failureLabel;
  window.setTimeout(() => {
    button.textContent = original;
  }, timeoutMs);
}
