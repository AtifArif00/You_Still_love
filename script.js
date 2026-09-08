/* =========================================================
   CONFIG — edit these to personalize the site
========================================================= */
const HER_NAME = "Love";      // Reserved for personalization if you want to use it in text
const HIS_NAME = "Atif";      // Used automatically inside the question text below

/* =========================================================
   QUESTION DATA
   Each question defines:
     text      -> the question shown
     behavior  -> which NO-button mechanic to use (see BEHAVIORS below)
     texts     -> the short sequence of teasing labels for THIS question only.
                  Once the sequence is exhausted, the NO button surrenders
                  and turns into a real YES button.
========================================================= */
const QUESTIONS = [
  {
    text: "Do you still love me? ❤️",
    behavior: "move",
    texts: ["NO 😏", "Nice try! 😂", "You can't escape! 🙈"]
  },
  {
    text: `Do you miss ${HIS_NAME} so much that you want to hug him and kiss him? 🥺❤️`,
    behavior: "threeHover",
    texts: ["Are you sure? 😏", "Think again 😂", "Okay... we both know the answer ❤️"]
  },
  {
    text: `Do you still think about ${HIS_NAME} even when you pretend you don't? 👀❤️`,
    behavior: "disappear",
    texts: ["NO 🙈", "NO 😏", "Where'd it go? 😅"]
  },
  {
    text: "Does your heart still smile a little whenever Atif's name appears? 😊❤️",
    behavior: "angryAnime",
    texts: ["😡", "Why are you trying to hurt my feelings?! 😤", "ATIF IS WATCHING 👀😡"]
  },
  {
    text: "Do you secretly wish Atif was beside you right now? 🥺",
    behavior: "shrink",
    texts: ["NO 🙈", "NO 😏", "no", "😏"]
  },
  {
    text: "Do you still care about Atif more than your ego allows you to admit? 😏❤️",
    behavior: "terminology",
    texts: ["Maybe? 🤔", "Let me think...", "I refuse to answer 😂", "My ego says NO 😏"]
  },
  {
    text: "Have you really forgotten all those moments with Atif? 👀",
    behavior: "runAway",
    texts: ["Catch me if you can! 😂", "Nope, still running! 🏃‍♀️", "Almost... but no! 😆"]
  },
  {
    text: "Do you still love Atif just as much as you did before? ❤️",
    behavior: "emotional",
    texts: ["NO? 🥺", "After everything? 😭", "My heart is broken 💔"]
  },
  {
    text: "Is your 'I don't care' attitude just your ego trying to hide your feelings? 😂❤️",
    behavior: "egoHeart",
    texts: ["Ego: NO 😏", "Heart: YES ❤️", "Ego is fighting for its life 😂"]
  },
  {
    text: `Will you finally admit that you still love ${HIS_NAME}, you haven't forgotten him, and you still want him in your life? ❤️🥺`,
    behavior: "finalBoss",
    texts: [
      "NO 😏",
      "Are you REALLY sure? 👀",
      "Your ego is still fighting? 😂",
      "Heart detected: ❤️",
      "Resistance level: 1%"
    ]
  }
];

/* =========================================================
   STATE
========================================================= */
const state = {
  currentIndex: 0,
  totalNoAttempts: 0,
  noAttempts: 0,
  morphed: false,
  lastCornerIndex: -1,
  lastTriggerTime: 0
};

/* =========================================================
   DOM REFERENCES
========================================================= */
const questionCard = document.getElementById("questionCard");
const finalCard = document.getElementById("finalCard");
const questionText = document.getElementById("questionText");
const buttonArea = document.getElementById("buttonArea");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const progressLabel = document.getElementById("progressLabel");
const heartBurstContainer = document.getElementById("heartBurstContainer");
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
const replayBtn = document.getElementById("replayBtn");
const finalSubtitle = document.getElementById("finalSubtitle");

/* =========================================================
   RENDER QUESTION
========================================================= */
function renderQuestion() {
  const q = QUESTIONS[state.currentIndex];

  // Reset all per-question interaction state
  state.noAttempts = 0;
  state.morphed = false;
  state.lastCornerIndex = -1;

  resetNoButton();

  questionText.textContent = q.text;
  questionText.classList.remove("glow-pop");
  void questionText.offsetWidth; // restart animation
  questionText.classList.add("glow-pop");

  updateProgress();
}

function resetNoButton() {
  noBtn.className = "btn btn-no";
  noBtn.style.cssText = "";
  noBtn.disabled = false;
  noBtn.textContent = "NO 😏";
}

function updateProgress() {
  const total = QUESTIONS.length;
  const current = state.currentIndex + 1;
  progressLabel.textContent = `Question ${current} / ${total} ❤️`;
}

/* =========================================================
   SHARED HELPERS FOR THE ROAMING MECHANICS
========================================================= */
function getButtonSize() {
  const r = noBtn.getBoundingClientRect();
  return { w: r.width || 120, h: r.height || 52 };
}

function rectsOverlap(x, y, w, h, rect, margin) {
  return !(
    x + w < rect.left - margin ||
    x > rect.right + margin ||
    y + h < rect.top - margin ||
    y > rect.bottom + margin
  );
}

function randomViewportPosition() {
  const { w, h } = getButtonSize();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 14;
  const cardRect = questionCard.getBoundingClientRect();

  let x, y, tries = 0;
  do {
    x = pad + Math.random() * Math.max(1, vw - w - pad * 2);
    y = pad + Math.random() * Math.max(1, vh - h - pad * 2);
    tries++;
  } while (rectsOverlap(x, y, w, h, cardRect, 12) && tries < 8);

  return { x, y };
}

function cornerPosition(index) {
  const { w, h } = getButtonSize();
  const pad = 22;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const corners = [
    { x: pad, y: pad },
    { x: vw - w - pad, y: pad },
    { x: pad, y: vh - h - pad },
    { x: vw - w - pad, y: vh - h - pad }
  ];
  return corners[index % corners.length];
}

function placeFixed(x, y) {
  noBtn.classList.add("roaming");
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

function popText(label) {
  noBtn.textContent = label;
  noBtn.classList.remove("text-pop");
  void noBtn.offsetWidth;
  noBtn.classList.add("text-pop");
}

/* =========================================================
   BEHAVIOR MECHANICS — one distinct trick per question
========================================================= */
const BEHAVIORS = {
  // Q1 — moves to a random spot anywhere on the visible page
  move(label) {
    const pos = randomViewportPosition();
    placeFixed(pos.x, pos.y);
    noBtn.textContent = label;
  },

  // Q2 — only reacts on hover, a plain text swap, capped at 3 attempts
  threeHover(label) {
    popText(label);
  },

  // Q3 — vanishes for a beat, then reappears somewhere new
  disappear(label) {
    noBtn.classList.add("btn-fading");
    setTimeout(() => {
      const pos = randomViewportPosition();
      placeFixed(pos.x, pos.y);
      noBtn.textContent = label;
      noBtn.classList.remove("btn-fading");
      noBtn.classList.add("btn-fading-in");
      setTimeout(() => noBtn.classList.remove("btn-fading-in"), 320);
    }, 650);
  },

  // Q4 — exaggerated, cute "anime rage" reaction
  angryAnime(label) {
    noBtn.textContent = label;
    noBtn.classList.remove("btn-shake");
    void noBtn.offsetWidth;
    noBtn.classList.add("btn-shake");
  },

  // Q5 — shrinks a little more with every attempt
  shrink(label, attempt) {
    noBtn.textContent = label;
    const scale = Math.max(0.4, 1 - attempt * 0.16);
    noBtn.style.transform = `scale(${scale})`;
  },

  // Q6 — stays put, just keeps changing its mind
  terminology(label) {
    popText(label);
  },

  // Q7 — bigger, more dramatic jumps corner to corner
  runAway(label) {
    let next = Math.floor(Math.random() * 4);
    if (next === state.lastCornerIndex) next = (next + 1) % 4;
    state.lastCornerIndex = next;
    const pos = cornerPosition(next);
    placeFixed(pos.x, pos.y);
    noBtn.textContent = label;
  },

  // Q8 — no movement, just increasingly emotional pleading
  emotional(label) {
    popText(label);
  },

  // Q9 — ego vs. heart, color-coded
  egoHeart(label, attempt) {
    popText(label);
    noBtn.classList.remove("ego-tone", "heart-tone");
    noBtn.classList.add(attempt % 2 === 1 ? "ego-tone" : "heart-tone");
  },

  // Q10 — the final boss: dramatic text + a nervous little jitter
  finalBoss(label) {
    popText(label);
    noBtn.classList.remove("boss-jitter");
    void noBtn.offsetWidth;
    noBtn.classList.add("boss-jitter");
  }
};

/* =========================================================
   NO BUTTON — TRIGGER + SURRENDER
========================================================= */
function triggerNoInteraction() {
  if (state.morphed) return;

  const now = Date.now();
  if (now - state.lastTriggerTime < 150) return; // avoid double-firing (hover + click, etc.)
  state.lastTriggerTime = now;

  const q = QUESTIONS[state.currentIndex];
  state.noAttempts++;
  state.totalNoAttempts++;

  const idx = Math.min(state.noAttempts - 1, q.texts.length - 1);
  const label = q.texts[idx];
  const isLast = state.noAttempts >= q.texts.length;

  const fn = BEHAVIORS[q.behavior] || BEHAVIORS.terminology;
  fn(label, state.noAttempts);

  if (isLast) {
    state.morphed = true;
    setTimeout(morphIntoYes, 650);
  }
}

function morphIntoYes() {
  noBtn.className = "btn btn-yes pulse-yes";
  noBtn.style.cssText = "";
  noBtn.textContent = "YES ❤️";
}

/* Desktop: react on hover. Mobile: react on touch before the tap registers. */
noBtn.addEventListener("mouseenter", () => {
  if (!state.morphed) triggerNoInteraction();
});

noBtn.addEventListener(
  "touchstart",
  (e) => {
    if (!state.morphed) {
      e.preventDefault();
      triggerNoInteraction();
    }
  },
  { passive: false }
);

// Safety net: if it somehow gets clicked before morphing, treat it as another attempt.
noBtn.addEventListener("click", (e) => {
  if (!state.morphed) {
    e.preventDefault();
    triggerNoInteraction();
    return;
  }
  handleYes();
});

/* =========================================================
   YES BUTTON
========================================================= */
yesBtn.addEventListener("click", handleYes);

function handleYes() {
  const rect = (state.morphed ? noBtn : yesBtn).getBoundingClientRect();
  spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

  questionCard.style.animation = "none";
  void questionCard.offsetWidth;
  questionCard.style.animation = "cardIn 0.35s ease";

  setTimeout(() => {
    if (state.currentIndex < QUESTIONS.length - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      showFinalScreen();
    }
  }, 260);
}

/* =========================================================
   HEART / CONFETTI BURST
========================================================= */
function spawnHeartBurst(x, y) {
  const symbols = ["❤️", "💖", "💕", "💗", "✨", "💘"];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "burst-heart";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 140;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 40;
    const rot = (Math.random() * 360 - 180) + "deg";

    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.setProperty("--dx", dx + "px");
    el.style.setProperty("--dy", dy + "px");
    el.style.setProperty("--rot", rot);
    el.style.animationDuration = 0.8 + Math.random() * 0.6 + "s";

    heartBurstContainer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

/* =========================================================
   FINAL SCREEN
========================================================= */
function showFinalScreen() {
  questionCard.hidden = true;
  finalCard.hidden = false;
  finalSubtitle.textContent = `You still love ${HIS_NAME}.`;

  spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
  setTimeout(() => spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 3), 300);
}

replayBtn.addEventListener("click", () => {
  state.currentIndex = 0;
  state.totalNoAttempts = 0;
  finalCard.hidden = true;
  questionCard.hidden = false;
  renderQuestion();
});

/* =========================================================
   FLOATING BACKGROUND HEARTS
========================================================= */
function spawnBackgroundHeart() {
  const container = document.getElementById("floatingHearts");
  const el = document.createElement("div");
  const isParticle = Math.random() < 0.35;

  el.className = "floating-heart" + (isParticle ? " particle" : "");
  if (!isParticle) {
    const hearts = ["❤️", "💗", "💖", "💕"];
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.fontSize = 14 + Math.random() * 18 + "px";
  }

  el.style.left = Math.random() * 100 + "vw";
  const duration = 9 + Math.random() * 10;
  el.style.animationDuration = duration + "s";
  el.style.animationDelay = (Math.random() * 2) + "s";

  container.appendChild(el);
  setTimeout(() => el.remove(), (duration + 2) * 1000);
}

setInterval(spawnBackgroundHeart, 500);
for (let i = 0; i < 12; i++) setTimeout(spawnBackgroundHeart, i * 150);

/* =========================================================
   MUSIC TOGGLE (optional — see README notes)
========================================================= */
let musicPlaying = false;

musicToggle.addEventListener("click", () => {
  if (!musicPlaying) {
    bgMusic.play()
      .then(() => {
        musicPlaying = true;
        musicToggle.textContent = "🔊";
        musicToggle.classList.add("playing");
      })
      .catch(() => {
        // No audio file present, or autoplay/permission blocked — fail silently.
        musicToggle.textContent = "🔇";
      });
  } else {
    bgMusic.pause();
    musicPlaying = false;
    musicToggle.textContent = "🎵";
    musicToggle.classList.remove("playing");
  }
});

/* =========================================================
   INIT
========================================================= */
renderQuestion();
