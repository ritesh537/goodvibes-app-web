// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

/**
 * Reusable slider
 * @param {string} id - container id
 * @param {Array<Object>} slides - slide items
 * @param {Object} opts - options { intervalMs, swipe, loop }
 */
function createSlider(id, slides, opts = {}) {
  const intervalMs = opts.intervalMs ?? 3500;
  const loop = opts.loop ?? true;
  const enableSwipe = opts.swipe ?? true;

  const root = document.getElementById(id);
  const track = root.querySelector('.slider-track');
  const dotsWrap = root.querySelector('.slider-dots');

  // Build slides
  slides.forEach((s, idx) => {
    const el = document.createElement('article');
    el.className = 'slide';
    el.innerHTML = `
      <div>
        ${s.kicker ? `<div class="kicker">${s.kicker}</div>` : ''}
        <h3>${s.title}</h3>
        ${s.text ? `<p>${s.text}</p>` : ''}
      </div>
      ${s.badge ? `<span class="badge">${s.badge}</span>` : ''}
    `;
    track.appendChild(el);

    const dot = document.createElement('button');
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.addEventListener('click', () => goTo(idx));
    dotsWrap.appendChild(dot);
  });

  let index = 0, timer = null;
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
    restart();
  }

  function next() {
    goTo(loop ? (index + 1) % slides.length : Math.min(index + 1, slides.length - 1));
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(next, intervalMs);
  }

  // Auto-advance
  restart();

  // Pause on hover (desktop)
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);

  // Swipe (touch)
  if (enableSwipe) {
    let startX = 0, delta = 0, touching = false;

    root.addEventListener('touchstart', e => {
      touching = true;
      startX = e.touches[0].clientX;
      clearInterval(timer);
    }, { passive: true });

    root.addEventListener('touchmove', e => {
      if (!touching) return;
      delta = e.touches[0].clientX - startX;
      // small drag visual feedback
      track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`;
    }, { passive: true });

    root.addEventListener('touchend', () => {
      touching = false;
      const threshold = 50; // px
      if (delta > threshold) goTo(index - 1);
      else if (delta < -threshold) goTo(index + 1);
      else goTo(index); // snap back
      delta = 0;
    });
  }

  return { next, goTo, destroy: () => clearInterval(timer) };
}

/* -------------------------
   Slider #1: Updates
   Add/modify slides by editing this array. Easy.
-------------------------- */
const updatesSlides = [
  {
    kicker: "Update",
    title: "My Finance Diary app is going live on Android soon",
    text: "Final checks in progress. Watch this space.",
    badge: "Android"
  },
  {
    kicker: "Progress",
    title: "iOS version is in progress",
    text: "Development underway. ETA to be shared.",
    badge: "iOS"
  }
];

createSlider('updates-slider', updatesSlides, { intervalMs: 4000, swipe: true, loop: true });

/* -------------------------
   Future slider #2 example (Roadmap)
   Uncomment the section in index.html and use this:

const roadmapSlides = [
  { kicker: "Q4", title: "Public beta", text: "Invite-based access starts.", badge: "Beta" },
  { kicker: "Q1", title: "Analytics Lite", text: "Opt-in private stats.", badge: "Feature" },
  { kicker: "Q2", title: "iPad Layout", text: "Adaptive UI for tablets.", badge: "UX" }
];
createSlider('roadmap-slider', roadmapSlides, { intervalMs: 5000 });

-------------------------- */
