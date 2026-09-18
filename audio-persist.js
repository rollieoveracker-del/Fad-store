// ============================================
// Persistent background audio across page navigations.
// Include this script (plain <script>, no type="module" needed) near the
// end of <body> on every page. It will reuse an existing #bg-audio element
// if the page has one (index.html does), or create one automatically if not
// (product.html, cart.html, success.html).
// ============================================
(function () {
  const STORAGE_KEY = "fad_audio_state";
  const TRACK_SRC = "music.mp3";

  function getAudioEl() {
    let audio = document.getElementById("bg-audio");
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "bg-audio";
      audio.loop = true;
      audio.preload = "auto";
      const source = document.createElement("source");
      source.src = TRACK_SRC;
      source.type = "audio/mpeg";
      audio.appendChild(source);
      document.body.appendChild(audio);
    }
    return audio;
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function saveState(audio, playing) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        playing: playing,
        time: audio.currentTime || 0,
        ts: Date.now()
      }));
    } catch (e) {}
  }

  function init() {
    const audio = getAudioEl();
    const state = readState();
    let started = false;

    // Pick up roughly where the previous page left off, so navigating
    // between pages feels like the track kept playing instead of restarting.
    function tryResume() {
      if (!state || !state.playing) return;

      const elapsedSec = (Date.now() - state.ts) / 1000;
      const targetTime = state.time + elapsedSec;

      const applyTimeAndPlay = () => {
        if (audio.duration && isFinite(audio.duration)) {
          audio.currentTime = targetTime % audio.duration;
        } else {
          audio.currentTime = state.time;
        }
        audio.play().then(() => { started = true; }).catch(() => {
          // Autoplay blocked — the click/touch fallback below will catch it.
        });
      };

      if (audio.readyState >= 1) {
        applyTimeAndPlay();
      } else {
        audio.addEventListener("loadedmetadata", applyTimeAndPlay, { once: true });
      }
    }

    tryResume();

    // Fallback for whenever autoplay is blocked: start on the next tap/click
    // anywhere on the page, same as before.
    function startOnInteraction() {
      if (started) return;
      audio.play().then(() => {
        started = true;
        document.removeEventListener("touchstart", startOnInteraction);
        document.removeEventListener("click", startOnInteraction);
      }).catch(() => {});
    }
    document.addEventListener("touchstart", startOnInteraction);
    document.addEventListener("click", startOnInteraction);

    // Keep localStorage in sync continuously so the *next* page can resume
    // from the right spot, whichever page that ends up being.
    audio.addEventListener("play", () => saveState(audio, true));
    audio.addEventListener("pause", () => saveState(audio, false));
    audio.addEventListener("timeupdate", () => saveState(audio, !audio.paused));
    window.addEventListener("beforeunload", () => saveState(audio, !audio.paused));

    // Exposed so a page can nudge playback from inside a click handler
    // (e.g. "Add to cart" or "Checkout") as an extra safety net.
    window.__fadAudio = audio;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
