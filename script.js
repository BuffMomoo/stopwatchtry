let timer = null;
let running = false;
let mode = "stopwatch";
let startedAt = 0;
let elapsedBeforeStart = 0;
let countdownTotal = 0;
let lapNumber = 0;

const display = document.getElementById("display");
const laps = document.getElementById("laps");
const lapCount = document.getElementById("lapCount");
const statusText = document.getElementById("status");
const progress = document.getElementById("progress");
const cdInput = document.getElementById("cdInput");
const modeInput = document.getElementById("mode");

const circumference = 2 * Math.PI * 100;
progress.style.strokeDasharray = circumference;

function formatTime(ms) {
    const totalCentiseconds = Math.max(0, Math.floor(ms / 10));
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function getCountdownMs() {
    const minutes = Number(document.getElementById("min").value) || 0;
    const seconds = Number(document.getElementById("sec").value) || 0;
    return Math.max(0, (minutes * 60 + Math.min(seconds, 59)) * 1000);
}

function currentElapsed() {
    return running ? elapsedBeforeStart + (Date.now() - startedAt) : elapsedBeforeStart;
}

function updateDisplay() {
    const elapsed = currentElapsed();
    const remaining = mode === "countdown" ? Math.max(0, countdownTotal - elapsed) : elapsed;
    display.textContent = formatTime(remaining);

    if (mode === "countdown" && countdownTotal > 0) {
        const ratio = remaining / countdownTotal;
        progress.style.strokeDashoffset = circumference * (1 - ratio);
        progress.style.stroke = remaining <= 10000 ? "var(--red)" : "var(--cyan)";
    } else {
        const ratio = (elapsed % 60000) / 60000;
        progress.style.strokeDashoffset = circumference * (1 - ratio);
        progress.style.stroke = "var(--cyan)";
    }

    if (mode === "countdown" && running && remaining <= 0) {
        pause();
        elapsedBeforeStart = countdownTotal;
        statusText.textContent = "DONE";
    }
}

function start() {
    if (running) return;

    if (mode === "countdown" && countdownTotal === 0 && elapsedBeforeStart === 0) {
        countdownTotal = getCountdownMs();
        if (countdownTotal === 0) return;
    }

    running = true;
    startedAt = Date.now();
    statusText.textContent = "RUNNING";
    timer = setInterval(updateDisplay, 20);
    updateDisplay();
}

function pause() {
    if (!running) return;

    elapsedBeforeStart = currentElapsed();
    running = false;
    clearInterval(timer);
    statusText.textContent = "PAUSED";
    updateDisplay();
}

function reset() {
    clearInterval(timer);
    running = false;
    elapsedBeforeStart = 0;
    countdownTotal = mode === "countdown" ? getCountdownMs() : 0;
    lapNumber = 0;
    laps.innerHTML = "";
    lapCount.textContent = "0 saved";
    statusText.textContent = "READY";
    updateDisplay();
}

function lap() {
    if (!running) return;

    lapNumber += 1;
    const elapsed = currentElapsed();
    const lapTime = mode === "countdown" ? countdownTotal - elapsed : elapsed;
    const item = document.createElement("div");
    item.className = "lap-item";
    item.innerHTML = `<span>#${String(lapNumber).padStart(2, "0")}</span><span>${formatTime(lapTime)}</span>`;
    laps.prepend(item);
    lapCount.textContent = `${lapNumber} saved`;
}

function changeMode() {
    mode = modeInput.value;
    cdInput.classList.toggle("show", mode === "countdown");
    reset();
}

document.getElementById("min").addEventListener("input", reset);
document.getElementById("sec").addEventListener("input", reset);
updateDisplay();
