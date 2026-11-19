const WAIT_SECONDS = 6;     // pause after each answer
const QUESTION_SECONDS = 15; // time allowed per question
const PASS_MARK = 5;        // correct answers needed to see "111"

const QUESTIONS = [
  {
    q: "An ATM reads your card, checks your PIN, dispenses cash, and records the transaction. Which stage of the input → process → output → storage cycle is 'recording the transaction'?",
    choices: ["Storage", "Input", "Process", "Output"],
    answer: 0
  },
  {
    q: "Which component loses its contents when the computer is powered off?",
    choices: ["SSD", "RAM", "USB flash drive", "Hard disk drive"],
    answer: 1
  },
  {
    q: "Which list contains ONLY output devices?",
    choices: [
      "Monitor, speaker, printer",
      "Monitor, microphone, printer",
      "Mouse, speaker, scanner",
      "Keyboard, monitor, printer"
    ],
    answer: 0
  },
  {
    q: "What is the main job of a bus in a computer system?",
    choices: [
      "Manage user accounts",
      "Carry data between components such as the CPU, RAM, and I/O devices",
      "Render graphics for the display",
      "Store files permanently"
    ],
    answer: 1
  },
  {
    q: "In Windows CMD, which command creates a new folder named homework?",
    choices: ["mkdir homework", "move homework", "cd homework", "dir homework"],
    answer: 0
  },
  {
    q: "A cybersecurity lab needs full control over the system, open-source tools, and the ability to script and automate tasks from the command line. Which OS is the best fit, and why?",
    choices: [
      "Windows: it has no security features to interfere with testing",
      "Any OS is equally suitable, so there is no real difference",
      "Linux: open source, highly customizable, and strong CLI and scripting support",
      "macOS: it is the only OS with a command line"
    ],
    answer: 2
  },
  {
    q: "A video editor's PC works with 4K footage. You cut its RAM in half to save money. Where will the bottleneck most likely appear?",
    choices: [
      "Timeline playback and rendering will stutter because large footage can't be held in memory, forcing slow swapping to storage",
      "Nothing, because RAM only matters for web browsing",
      "The CPU will permanently lose its clock speed",
      "The monitor will stop displaying colors correctly"
    ],
    answer: 0
  }
];

const CORRECT_REPLIES = [
  "Not impressed.",
  "Not impressed. A coin flip could do that.",
  "Not impressed. Don't get comfortable.",
  "Not impressed. Lucky guess?",
  "Not impressed. Keep going. I'm waiting.",
  "Not impressed. That was the easy one."
];

const WRONG_REPLIES = [
  "Wrong. Did you even open the textbook?",
  "Wrong. I'd say try harder, but I doubt it would help.",
  "Wrong. And you call yourself a detective?",
  "Wrong. Embarrassing. Truly.",
  "Wrong. I'm laughing. You can't hear it, but I am.",
  "Wrong. Your partner is going to hear about this.",
  "Wrong. Maybe stick to parking tickets.",
  "Wrong. Is it the pressure, or are you always like this?"
];

const TIMEOUT_REPLIES = [
  "Too slow. Did you fall asleep?",
  "Time's up. Thinking is hard, isn't it?",
  "Nothing? Not even a guess? Pathetic.",
  "Tick tock. The clock does not care about your feelings."
];

const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let index = 0;
let score = 0;
let answered = false;
let waitTimer = null;
let questionTimer = null;
let deadline = 0;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function loadQuestion() {
  const item = QUESTIONS[index];
  answered = false;

  $("counter").textContent = `${index + 1} / ${QUESTIONS.length}`;
  $("question").textContent = item.q;
  $("reply").textContent = "";
  $("reply").className = "reply";
  $("wait").textContent = "";

  const box = $("choices");
  box.innerHTML = "";

  // Shuffle the options each time, but remember which one is correct
  const options = item.choices.map((text, i) => ({ text, correct: i === item.answer }));
  shuffle(options).forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = opt.text;
    btn.dataset.correct = opt.correct ? "1" : "0";
    btn.addEventListener("click", () => choose(btn, opt.correct));
    box.appendChild(btn);
  });

  startQuestionTimer();
}

function startQuestionTimer() {
  deadline = Date.now() + QUESTION_SECONDS * 1000;
  $("timer").classList.remove("low");
  renderTimer(QUESTION_SECONDS);

  questionTimer = setInterval(() => {
    const left = (deadline - Date.now()) / 1000;
    if (left <= 0) {
      clearInterval(questionTimer);
      renderTimer(0);
      timeout();
    } else {
      renderTimer(left);
    }
  }, 100);
}

function renderTimer(seconds) {
  $("timer").textContent = seconds.toFixed(1);
  $("timer").classList.toggle("low", seconds <= 3);
}

function lockChoices() {
  answered = true;
  clearInterval(questionTimer);
  document.querySelectorAll(".choice").forEach((b) => {
    b.disabled = true;
    if (b.dataset.correct === "1") b.classList.add("correct");
  });
}

function choose(btn, isCorrect) {
  if (answered) return;
  const left = Math.max(0, (deadline - Date.now()) / 1000);
  lockChoices();

  if (isCorrect) {
    score++;
    $("reply").textContent =
      `${pick(CORRECT_REPLIES)} (You still had ${left.toFixed(1)} seconds left.)`;
    $("reply").classList.add("good");
  } else {
    btn.classList.add("wrong");
    $("reply").textContent = pick(WRONG_REPLIES);
    $("reply").classList.add("bad");
  }

  startWait();
}

function timeout() {
  if (answered) return;
  lockChoices();
  $("reply").textContent = pick(TIMEOUT_REPLIES);
  $("reply").classList.add("bad");
  startWait();
}

function startWait() {
  let left = WAIT_SECONDS;
  const isLast = index === QUESTIONS.length - 1;
  const label = () => (isLast ? `it ends in ${left}...` : `next question in ${left}...`);
  $("wait").textContent = label();

  waitTimer = setInterval(() => {
    left--;
    if (left > 0) {
      $("wait").textContent = label();
    } else {
      clearInterval(waitTimer);
      next();
    }
  }, 1000);
}

function next() {
  index++;
  if (index >= QUESTIONS.length) {
    blackout();
  } else {
    loadQuestion();
  }
}

function blackout() {
  const passed = score >= PASS_MARK;
  const num = $("number");
  num.textContent = passed ? "0111" : "and you call yourself SCIENCE detectives";
  num.classList.toggle("small", !passed);
  document.body.style.cursor = "none";
  $("blackout").classList.add("on");

  // The number finishes fading in after ~4.8s (see style.css),
  // then stays on screen for 7 seconds before the tab closes.
  setTimeout(closeSite, 4800 + 7000);
}

function closeSite() {
  // Works only if this tab was opened by a script (e.g. window.open from another page).
  window.close();

  // Fallback: if the browser refused, blank the tab so nothing is left on screen.
  setTimeout(() => {
    location.replace("about:blank");
  }, 300);
}

$("startBtn").addEventListener("click", () => {
  showScreen("quiz");
  loadQuestion();
});
