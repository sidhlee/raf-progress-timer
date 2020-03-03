DURATION = 5000;

// Animation state
const state = {
  rafId: null,
  start: null,
  progress: 0,
  paused: false,
  playing: false,
  stopped: false
};

// Progress bar
const barOuter = document.querySelector("#progress-bar");
const barInner = document.querySelector("#progress-bar-inner");
const barWidth = +getComputedStyle(barOuter).width.slice(0, -2);

// Controls
const playBtn = document.querySelector("#play");
const pauseBtn = document.querySelector("#pause");
const stopBtn = document.querySelector("#stop");
playBtn.onclick = handlePlay;
pauseBtn.onclick = handlePause;
stopBtn.onclick = handleStop;

// Time display
const minuteDisplay = document.querySelector("#remaining .minute");
const msDisplay = document.querySelector("#remaining .ms");

// Click handlers
function handlePlay() {
  if (state.playing) return;
  state.playing = true;
  play();
}

function handlePause() {
  // you can't pause after stopped.
  if (state.stopped) return;
  pause();
  state.paused = true;
  state.playing = false;
}

function handleStop() {
  pause();
  state.playing = false;
  state.stopped = true;
  state.paused = false; // stop btn cancels paused state.
  updateDOM(0); // updateDOM to its initial state.
}

/* === Low level animation API ====================== */
function play() {
  const step = timestamp => {
    // if played for the first time since the page load
    // or (re)played after the progress reached its end
    // or if played after stopped
    if (!state.start || state.progress >= 1 || state.stopped) {
      state.start = timestamp;
      state.stopped = false;
    }
    // if played after paused
    if (state.paused) {
      state.start = timestamp - state.progress * DURATION;
      state.paused = false;
    }
    // calc progress based on time delta
    state.progress = Math.min(
      (timestamp - state.start) / DURATION,
      1
    );
    // update DOM
    updateDOM(state.progress);

    // only request next repaint if still progressing
    if (state.progress < 1) {
      state.rafId = requestAnimationFrame(step);
    } else {
      // if progress is done, set playing to false
      // (otherwise we can't restart)
      state.playing = false;
    }
  };
  state.rafId = requestAnimationFrame(step);
}

function pause() {
  cancelAnimationFrame(state.rafId);
}

function updateRemainingTime(progress) {
  const second = getRemainingSecond(progress)
    .toString()
    .padStart(2, "0");
  const ms = Math.floor(getRemainingMs(progress) / 10)
    .toString()
    .padStart(2, "0");

  minuteDisplay.textContent = second;
  msDisplay.textContent = ms;
}

function getRemainingSecond(progress) {
  return Math.floor((DURATION - DURATION * progress) / 1000) % 60;
}

function getRemainingMs(progress) {
  return (DURATION - DURATION * progress) % 1000; // only ms part
}

function updateDOM(progress) {
  barInner.style.width = progress * barWidth + "px";
  updateRemainingTime(progress);
}
