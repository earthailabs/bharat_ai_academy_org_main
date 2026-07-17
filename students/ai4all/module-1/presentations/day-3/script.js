/**
 * Bharat AI Academy — Presentation Engine
 * Navigation · Dark/Light · Fullscreen · Timer · Speaker Notes
 * Works fully offline.
 */
(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const bar = document.getElementById("progress-fill");
  const counter = document.getElementById("slide-count");
  const sectionLabel = document.getElementById("section-label");
  const notesPanel = document.getElementById("notes-panel");
  const notesText = document.getElementById("notes-text");
  const helpOverlay = document.getElementById("help-overlay");
  const timerEl = document.getElementById("timer");
  const root = document.documentElement;

  let index = 0;
  let notesOpen = false;
  let timerSeconds = 0;
  let timerRunning = false;
  let timerId = null;
  let touchX = 0;
  let wheelLock = false;

  const total = slides.length;

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  function updateNotes() {
    const slide = slides[index];
    const notes = slide.getAttribute("data-notes") || "No speaker notes for this slide.";
    notesText.textContent = notes;
  }

  function goTo(n, dir) {
    if (n < 0 || n >= total || n === index) return;
    const prev = slides[index];
    prev.classList.remove("active");
    if (dir === "next") prev.classList.add("exit-left");
    if (dir === "prev") prev.classList.add("exit-right");
    setTimeout(function () {
      prev.classList.remove("exit-left", "exit-right");
    }, 400);

    index = n;
    slides[index].classList.add("active");
    bar.style.width = ((index + 1) / total) * 100 + "%";
    counter.textContent = (index + 1) + " / " + total;
    sectionLabel.textContent = slides[index].getAttribute("data-section") || "";
    updateNotes();
    history.replaceState(null, "", "#slide-" + (index + 1));
  }

  function next() { goTo(index + 1, "next"); }
  function prev() { goTo(index - 1, "prev"); }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.() ||
        document.documentElement.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  }

  function toggleTheme() {
    root.classList.toggle("light");
    localStorage.setItem("baa-theme", root.classList.contains("light") ? "light" : "dark");
  }

  function toggleNotes() {
    notesOpen = !notesOpen;
    notesPanel.classList.toggle("open", notesOpen);
  }

  function toggleHelp(force) {
    const open = force !== undefined ? force : !helpOverlay.classList.contains("open");
    helpOverlay.classList.toggle("open", open);
  }

  function toggleTimer() {
    if (timerRunning) {
      clearInterval(timerId);
      timerRunning = false;
      timerEl.style.opacity = "0.5";
    } else {
      timerRunning = true;
      timerEl.style.opacity = "1";
      timerId = setInterval(function () {
        timerSeconds += 1;
        timerEl.textContent = formatTime(timerSeconds);
      }, 1000);
    }
  }

  function resetTimer() {
    clearInterval(timerId);
    timerRunning = false;
    timerSeconds = 0;
    timerEl.textContent = "00:00";
    timerEl.style.opacity = "0.5";
  }

  /* Keyboard */
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;

    switch (e.key) {
      case "ArrowRight":
      case " ":
      case "PageDown":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        goTo(0, "prev");
        break;
      case "End":
        e.preventDefault();
        goTo(total - 1, "next");
        break;
      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "n":
      case "N":
        e.preventDefault();
        toggleNotes();
        break;
      case "d":
      case "D":
        e.preventDefault();
        toggleTheme();
        break;
      case "t":
      case "T":
        e.preventDefault();
        if (e.shiftKey) resetTimer();
        else toggleTimer();
        break;
      case "?":
        e.preventDefault();
        toggleHelp();
        break;
      case "Escape":
        toggleHelp(false);
        if (notesOpen) toggleNotes();
        break;
      default:
        break;
    }
  });

  /* Mouse wheel */
  document.addEventListener(
    "wheel",
    function (e) {
      if (wheelLock) return;
      if (Math.abs(e.deltaY) < 30) return;
      wheelLock = true;
      if (e.deltaY > 0) next();
      else prev();
      setTimeout(function () { wheelLock = false; }, 450);
    },
    { passive: true }
  );

  /* Touch */
  document.addEventListener(
    "touchstart",
    function (e) { touchX = e.touches[0].clientX; },
    { passive: true }
  );
  document.addEventListener("touchend", function (e) {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) next();
      else prev();
    }
  });

  /* Buttons */
  document.getElementById("btn-fullscreen")?.addEventListener("click", toggleFullscreen);
  document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);
  document.getElementById("btn-notes")?.addEventListener("click", toggleNotes);
  document.getElementById("btn-help")?.addEventListener("click", function () { toggleHelp(); });
  document.getElementById("btn-timer")?.addEventListener("click", toggleTimer);
  helpOverlay?.addEventListener("click", function (e) {
    if (e.target === helpOverlay) toggleHelp(false);
  });

  /* Theme restore */
  if (localStorage.getItem("baa-theme") === "light") {
    root.classList.add("light");
  }

  /* Hash */
  const match = location.hash.match(/#slide-(\d+)/);
  const start = match ? Math.max(0, Math.min(total - 1, parseInt(match[1], 10) - 1)) : 0;
  index = -1;
  goTo(start, "next");

  /* Expose for debugging */
  window.BAAPresentation = { next: next, prev: prev, goTo: goTo, total: total };
})();
