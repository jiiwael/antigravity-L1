/**
 * ============================================================================
 * 💌 A SPECIAL SURPRISE FOR SHAHD — SCRIPT.JS
 * ============================================================================
 * 
 * 🌐 GITHUB PAGES & FORMSPREE SETUP:
 * ----------------------------------------------------------------------------
 * This website runs 100% statically in the browser (compatible with GitHub Pages).
 * No server or backend needed.
 * 
 * The final selections:
 *  - answer: "YES"
 *  - selected_date: [actual chosen date, e.g. "September 14, 2026"]
 *  - meeting_place: [actual chosen place, e.g. "at your place 🏠"]
 * 
 * Are submitted via a normal HTML form POST to:
 * https://formspree.io/f/mbgjqqyv
 * 
 * Form submissions use AJAX/fetch with `Accept: application/json` so Shahd
 * never sees a blank Formspree page and instead receives the cute celebration screen!
 * ============================================================================
 */

/* ============================================================================
 * STATE MANAGEMENT
 * ============================================================================ */
const state = {
  selectedAnswer: "Yes",
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
/* ============================================================================
 * PAGE 3 & FORMSPREE SUBMISSION (GitHub Pages Compatible)
 * ============================================================================ */
const meetupForm = document.getElementById('meetup-form');
const formErrorBanner = document.getElementById('form-error-banner');
const btnSubmitText = document.getElementById('btn-submit-text');

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

    // Enable submit button and clear any previous error banner
    confirmPlaceBtn.disabled = false;
    if (formErrorBanner) {
      formErrorBanner.style.display = 'none';
    }
  });
});

meetupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!state.selectedDate || !state.selectedPlace) return;

  // Populate dynamic selected values into the HTML form inputs
  const inputAnswer = document.getElementById('form-input-answer');
  const inputDate = document.getElementById('form-input-date');
  const inputPlace = document.getElementById('form-input-place');

  if (inputAnswer) inputAnswer.value = "YES";
  if (inputDate) inputDate.value = state.selectedDate;
  if (inputPlace) inputPlace.value = state.selectedPlace;

  // Set loading state on button
  confirmPlaceBtn.disabled = true;
  if (btnSubmitText) {
    btnSubmitText.textContent = "Sending... 💌";
  }
  if (formErrorBanner) {
    formErrorBanner.style.display = 'none';
  }

  const formData = new FormData(meetupForm);

  try {
    // Submit using normal HTML form POST via Fetch to Formspree endpoint
    const response = await fetch(meetupForm.action, {
      method: meetupForm.method,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      // 1. Populate final cute confirmation message with the ACTUAL selected values
      finalDateText.textContent = `I'll see you on ${state.selectedDate}!`;
      finalPlaceText.textContent = `Let's meet ${state.selectedPlace}`;

      // 2. Smoothly transition to the celebration screen (no blank Formspree page!)
      goToStep(stepFinal);

      // 3. Trigger celebration confetti
      startConfetti();

      // 4. Save to localStorage as a client-side backup
      try {
        localStorage.setItem('shahd_date_invitation', JSON.stringify({
          answer: "YES",
          selectedDate: state.selectedDate,
          meetingPlace: state.selectedPlace,
          submittedAt: new Date().toISOString()
        }));
      } catch (err) {
        console.warn("localStorage note:", err);
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
  } catch (error) {
    console.error("Formspree submission error:", error);

    // Gracefully show error banner and allow Shahd to try again
    if (formErrorBanner) {
      formErrorBanner.style.display = 'block';
    }
    if (btnSubmitText) {
      btnSubmitText.textContent = "Try Again ❤️";
    }
    confirmPlaceBtn.disabled = false;
  }
});

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
