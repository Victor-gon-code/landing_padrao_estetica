const body = document.body;
const tones = document.querySelectorAll('.tone');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Background color becomes part of the narrative, not a section divider.
const toneObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) body.dataset.tone = visible.target.dataset.tone;
}, { threshold:[0.22,0.42,0.62], rootMargin:'-12% 0px -22% 0px' });
tones.forEach(section => toneObserver.observe(section));

// Reveal only where the typography benefits from it.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
}, { threshold:.45 });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// Menu.
const menuBtn = document.querySelector('.menu-trigger');
const menu = document.querySelector('.menu-panel');
function closeMenu(){
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden','true');
  menuBtn.setAttribute('aria-expanded','false');
  body.style.overflow='';
}
menuBtn.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  body.style.overflow = open ? 'hidden' : '';
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// Treatment rows change the giant background word — tactile without heavy effects.
const wordStage = document.querySelector('.word-stage span');
document.querySelectorAll('.treatment-row').forEach(row => {
  row.addEventListener('mouseenter', () => {
    wordStage.parentElement.classList.add('swap');
    setTimeout(() => {
      wordStage.textContent = row.dataset.word;
      wordStage.parentElement.classList.remove('swap');
    }, 110);
  });
  row.addEventListener('focus', () => wordStage.textContent = row.dataset.word);
});

if (!reduceMotion) {
  // Tiny parallax on media only; transforms are GPU-friendly.
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const updateParallax = () => {
    const vh = innerHeight;
    parallaxEls.forEach(wrap => {
      const rect = wrap.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const factor = Number(wrap.dataset.parallax || .05);
      const delta = (rect.top + rect.height/2 - vh/2) * factor;
      const img = wrap.querySelector('img');
      img.style.transform = `translate3d(0, ${delta}px, 0) scale(1.08)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, {passive:true});
  updateParallax();

  // Custom orbit follows pointer only on fine-pointer devices.
  if (matchMedia('(pointer:fine)').matches) {
    const cursor = document.querySelector('.cursor-orbit');
    addEventListener('pointermove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }, {passive:true});
    document.querySelectorAll('a,button,summary').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
  }
}
