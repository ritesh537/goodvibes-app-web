// ensure DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Footer year update
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

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
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const root = document.getElementById(id);
    if (!root) return console.warn(`[slider] container #${id} not found`);
    const track = root.querySelector('.slider-track');
    const dotsWrap = root.querySelector('.slider-dots');

    // build slides dynamically
    slides.forEach((s, idx) => {
      const el = document.createElement('article');
      el.className = 'slide';
      el.innerHTML = `
        ${s.img ? `<figure class="slide-media"><img src="${s.img}" alt="${s.imgAlt ?? s.title}" loading="lazy"></figure>` : ''}
        <div class="slide-copy">
          ${s.kicker ? `<div class="kicker">${s.kicker}</div>` : ''}
          <h4>${s.title}</h4>
          ${s.text ? `<p>${s.text}</p>` : ''}
          ${s.link ? `<a class="btn" href="${s.link}" target="_blank" rel="noopener noreferrer">${s.linkText ?? 'Open link'}</a>` : ''}
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

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function restart() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(next, intervalMs);
    }

    // Auto-advance
    restart();

    // Pause on hover (desktop)
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);

    // Swipe support (mobile)
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
        track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`;
      }, { passive: true });

      root.addEventListener('touchend', () => {
        touching = false;
        const threshold = 50;
        if (delta > threshold) prev();
        else if (delta < -threshold) next();
        else goTo(index);
        delta = 0;
      });
    }

    // Optional arrow buttons
    const prevBtn = root.querySelector('.prev');
    const nextBtn = root.querySelector('.next');
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    return { next, prev, goTo, destroy: () => clearInterval(timer) };
  }

  /* ---------------------------------
     Slider: MyFinanceDiary Updates
  ----------------------------------- */
  const updatesSlides = [
    {
      kicker: "Now Live",
      title: "MyFinanceDiary is available on Google Play",
      text: "Start tracking expenses, SIPs and your journey to financial freedom today.",
      badge: "Android",
      img: "assets/img/Feature_Graphic_1024x500.jpg", // update if hosted elsewhere
      imgAlt: "MyFinanceDiary feature graphic",
      link: "https://play.google.com/store/apps/details?id=com.goodvibes.myfinancediary",
      linkText: "Open on Google Play"
    },
    {
      kicker: "In Progress",
      title: "iOS version coming soon",
      text: "Development underway. Stay tuned for updates.",
      badge: "iOS"
    }
  ];

  createSlider('updates-slider', updatesSlides, { intervalMs: 4000, swipe: true, loop: true });
});
