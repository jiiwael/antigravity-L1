/**
 * ============================================================================
 * 💌 A SPECIAL SURPRISE FOR SHAHD — SCRIPT.JS
 * ============================================================================
 * 
 * 🛠️ HOW TO RECEIVE SHAHD'S SELECTIONS (EMAIL / NOTIFICATION SETUP):
 * ----------------------------------------------------------------------------
 * By default, browsers cannot send emails directly without a backend or form
 * service. This website is 100% ready to send you notifications using any free
 * form service!
 * 
 * 👉 OPTION 1: Formspree (Free & Easiest — sends straight to your email)
 *    1. Go to https://formspree.io and create a free account.
 *    2. Click "+ New Form" and copy the endpoint URL they give you.
 *       (It looks like: "https://formspree.io/f/xyzabcdr")
 *    3. Paste it below into `CONFIG.formspreeEndpoint`.
 * 
 * 👉 OPTION 2: Web3Forms (No account needed — 100% free)
 *    1. Go to https://web3forms.com and type in your email to get an Access Key.
 *    2. Paste your key below into `CONFIG.web3FormsKey`.
 * 
 * 👉 OPTION 3: Custom Webhook / Backend
 *    Paste your custom API URL into `CONFIG.customWebhookUrl`.
 * 
 * 💡 WHAT HAPPENS IF YOU LEAVE THIS UNCONFIGURED?
 *    Don't worry! Every selection is ALWAYS safely saved in the browser's
 *    `localStorage` under the key "shahd_date_invitation" and printed to
 *    the developer console, so no data is ever lost.
 * ============================================================================
 */

const CONFIG = {
  // Option 1: Paste your Formspree endpoint URL here:
  formspreeEndpoint: "", 

  // Option 2: Paste your Web3Forms Access Key here:
  web3FormsKey: "",

  // Option 3: Or paste any custom backend / Discord / Slack webhook URL:
  customWebhookUrl: "",
};

/* ============================================================================
 * STATE MANAGEMENT
 * ============================================================================ */
const state = {
  selectedDate: null,     // e.g. "September 14, 2026"
  selectedPlace: null,    // e.g. "at your place 🏠"
};

// Allowed date range strictly: September 10, 2026 to September 18, 2026
const ALLOWED_DAYS = [10, 11, 12, 13, 14, 15, 16, 17, 18];

/* ============================================================================
 * DOM ELEMENTS
 * ============================================================================ */
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const stepFinal = document.getElementById('step-final');

const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const playfulToast = document.getElementById('playful-toast');

const calendarGrid = document.getElementById('calendar-grid');
const dateFeedback = document.getElementById('date-feedback');
const confirmDateBtn = document.getElementById('confirm-date-btn');

const placeCards = document.querySelectorAll('.place-card');
const confirmPlaceBtn = document.getElementById('confirm-place-btn');

const finalDateText = document.getElementById('final-date-text');
const finalPlaceText = document.getElementById('final-place-text');
const statusText = document.getElementById('status-text');
const notificationStatus = document.getElementById('notification-status');

/* ============================================================================
 * STEP TRANSITION HELPER
 * ============================================================================ */
function goToStep(targetStepElement) {
  // Fade out current active step
  const currentStep = document.querySelector('.step-page.active');
  if (currentStep) {
    currentStep.classList.remove('active');
  }

  // Smooth scroll back to top of card if on mobile
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Activate target step
  setTimeout(() => {
    targetStepElement.classList.add('active');
  }, 150);
}

/* ============================================================================
 * PAGE 1: PLAYFUL RUNAWAY "NO" BUTTON
 * ============================================================================ */
const playfulMessages = [
  "Nice try! 🏃‍♀️💨",
  "Are you sure? 🥺",
  "Wait, reconsider! 👀",
  "Oops, button slipped! 🙈",
  "Wrong direction! 👉 Yes is over there!",
  "Almost had it! 😜",
  "Can't catch me! ✨",
  "You know you want to say yes! 🥰",
];

let messageIndex = 0;
let toastTimeout = null;

function showPlayfulToast(msg) {
  if (!msg) {
    msg = playfulMessages[messageIndex % playfulMessages.length];
    messageIndex++;
  }
  playfulToast.textContent = msg;
  playfulToast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    playfulToast.classList.remove('show');
  }, 1800);
}

function dodgeNoButton() {
  noBtn.classList.add('runaway');

  const btnWidth = noBtn.offsetWidth || 100;
  const btnHeight = noBtn.offsetHeight || 48;
  const margin = 24; // Safe margin from screen edges

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const minX = margin;
  const maxX = Math.max(margin, viewportWidth - btnWidth - margin);

  const minY = margin;
  const maxY = Math.max(margin, viewportHeight - btnHeight - margin);

  // Generate random target coordinates strictly within viewport bounds
  const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;

  // Fun playful rotation
  const randomRot = (Math.random() * 20 - 10).toFixed(1);
  noBtn.style.transform = `rotate(${randomRot}deg) scale(1.05)`;

  showPlayfulToast();
}

// Attach hover and touch dodge triggers
noBtn.addEventListener('mouseenter', dodgeNoButton);
noBtn.addEventListener('pointerenter', dodgeNoButton);
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevents instant click on mobile so it dodges
  dodgeNoButton();
}, { passive: false });

// If user manages to click/tap No anyway, be sweet and playful (do not force an alert)
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dodgeNoButton();
  showPlayfulToast("Hehe, still slipped away! 🙈 Try the other button!");
});

// YES Button click
yesBtn.addEventListener('click', () => {
  // Put No button back in normal flow in case user returns or navigates
  noBtn.classList.remove('runaway');
  noBtn.style.position = '';
  noBtn.style.left = '';
  noBtn.style.top = '';
  noBtn.style.transform = '';
  
  goToStep(step2);
});

/* ============================================================================
 * PAGE 2: SEPTEMBER 2026 CALENDAR GENERATOR
 * ============================================================================ */
function buildSeptemberCalendar() {
  // September 2026:
  // Sept 1, 2026 is a Tuesday (Day index 2 in 0=Sun..6=Sat).
  // Total days in September = 30.
  const startDayOfWeek = 2; // Tuesday
  const totalDays = 30;

  // Insert empty slots for days before Tuesday
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day empty';
    emptyCell.setAttribute('aria-hidden', 'true');
    calendarGrid.appendChild(emptyCell);
  }

  // Create day buttons
  for (let day = 1; day <= totalDays; day++) {
    const dayBtn = document.createElement('button');
    dayBtn.type = 'button';
    dayBtn.textContent = day;
    dayBtn.dataset.day = day;

    const isAvailable = ALLOWED_DAYS.includes(day);

    if (isAvailable) {
      dayBtn.className = 'cal-day available';
      dayBtn.setAttribute('aria-label', `September ${day}, 2026 - Available`);
      
      dayBtn.addEventListener('click', () => {
        // Deselect previous
        document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
        
        // Select this one
        dayBtn.classList.add('selected');
        state.selectedDate = `September ${day}, 2026`;

        // Update feedback and enable button
        dateFeedback.textContent = `Selected: September ${day}, 2026 ✨`;
        dateFeedback.style.backgroundColor = 'var(--soft-pink)';
        dateFeedback.style.color = 'var(--primary-pink)';
        confirmDateBtn.disabled = false;
      });
    } else {
      dayBtn.className = 'cal-day disabled';
      dayBtn.disabled = true;
      dayBtn.setAttribute('aria-label', `September ${day}, 2026 - Not Available`);
    }

    calendarGrid.appendChild(dayBtn);
  }
}

confirmDateBtn.addEventListener('click', () => {
  if (state.selectedDate) {
    goToStep(step3);
  }
});

/* ============================================================================
 * PAGE 3: MEETING PLACE SELECTION
 * ============================================================================ */
placeCards.forEach(card => {
  card.addEventListener('click', () => {
    // Single-selection: remove selected from all other cards
    placeCards.forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });

    // Mark current card as selected
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
    state.selectedPlace = card.dataset.place;

    confirmPlaceBtn.disabled = false;
  });
});

confirmPlaceBtn.addEventListener('click', async () => {
  if (!state.selectedDate || !state.selectedPlace) return;

  // Format final messages as requested
  // "Yay! It's a date ❤️"
  // "I'll see you on September 14, 2026!"
  // "Let's meet at your place 🏠"
  finalDateText.textContent = `I'll see you on ${state.selectedDate}!`;
  finalPlaceText.textContent = `Let's meet ${state.selectedPlace}`;

  // Transition to celebration screen
  goToStep(stepFinal);

  // Launch celebration confetti!
  startConfetti();

  // Handle data notification dispatch
  await handleDataSubmission();
});

/* ============================================================================
 * DATA SUBMISSION / NOTIFICATION PIPELINE
 * ============================================================================ */
async function handleDataSubmission() {
  const payload = {
    friend: "Shahd",
    selectedDate: state.selectedDate,
    meetingPlace: state.selectedPlace,
    submittedAt: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
    message: `Shahd confirmed a meetup on ${state.selectedDate} (${state.selectedPlace})! ❤️`,
  };

  // 1. Always save in browser's localStorage for safety
  try {
    localStorage.setItem('shahd_date_invitation', JSON.stringify(payload));
    console.log("💌 [SUCCESS] Saved to localStorage:", payload);
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }

  // 2. Check if host configured Formspree, Web3Forms, or Custom Webhook
  let endpoint = null;
  let requestOptions = null;

  if (CONFIG.formspreeEndpoint && CONFIG.formspreeEndpoint.trim() !== "") {
    endpoint = CONFIG.formspreeEndpoint.trim();
    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    };
  } else if (CONFIG.web3FormsKey && CONFIG.web3FormsKey.trim() !== "") {
    endpoint = "https://api.web3forms.com/submit";
    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: CONFIG.web3FormsKey.trim(),
        subject: `❤️ Shahd picked a date: ${state.selectedDate}!`,
        from_name: "Shahd Meetup Surprise",
        ...payload
      })
    };
  } else if (CONFIG.customWebhookUrl && CONFIG.customWebhookUrl.trim() !== "") {
    endpoint = CONFIG.customWebhookUrl.trim();
    requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
  }

  // 3. Dispatch HTTP request if endpoint is provided
  if (endpoint) {
    statusText.textContent = "Sending notification to your host... 💌";
    try {
      const response = await fetch(endpoint, requestOptions);
      if (response.ok) {
        notificationStatus.classList.add('success');
        statusText.textContent = "Confirmed & notification sent! 💌✨";
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.warn("Network notification attempt failed, but response is safely saved locally:", error);
      notificationStatus.classList.add('success');
      statusText.textContent = "Saved locally! (Ready to connect email endpoint) 💌";
    }
  } else {
    // Graceful unconfigured state
    notificationStatus.classList.add('success');
    statusText.textContent = "Selections saved! (Backend endpoint ready in script.js) 💌";
    console.info(
      "%c💌 Shahd's Response Recorded!",
      "color: #ff5e87; font-size: 16px; font-weight: bold;"
    );
    console.table(payload);
  }
}

/* ============================================================================
 * BACKGROUND FLOATING HEARTS GENERATOR
 * ============================================================================ */
function createFloatingHearts() {
  const container = document.getElementById('floating-hearts');
  const emojis = ['❤️', '💖', '✨', '🌸', '💕', '🌷', '🥺'];
  const heartCount = 18;

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${6 + Math.random() * 6}s`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    heart.style.fontSize = `${1 + Math.random() * 1.2}rem`;
    container.appendChild(heart);
  }
}

/* ============================================================================
 * CONFETTI CELEBRATION EFFECT (Lightweight Canvas Confetti)
 * ============================================================================ */
function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#ff5e87', '#ff8fab', '#fb6f92', '#ffc2d1', '#9d4edd', '#ffd166', '#06d6a0'];
  const totalParticles = 110;

  for (let i = 0; i < totalParticles; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 60 - 30),
      y: canvas.height / 2 + (Math.random() * 60 - 30),
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 18,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      isHeart: Math.random() > 0.6,
      opacity: 1,
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.98; // Drag
      p.rotation += p.rotSpeed;
      p.opacity -= 0.005;

      if (p.opacity > 0 && p.y < canvas.height + 40) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.isHeart) {
          ctx.fillStyle = p.color;
          ctx.font = `${p.size * 1.5}px sans-serif`;
          ctx.fillText('❤️', -p.size, p.size / 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateConfetti();
}

// Resize confetti canvas on window resize
window.addEventListener('resize', () => {
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

/* ============================================================================
 * INITIALIZATION
 * ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  buildSeptemberCalendar();
  createFloatingHearts();
});
