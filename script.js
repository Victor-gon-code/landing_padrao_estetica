const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

const preloader = $('.preloader');
const preloadBar = $('.preloader__track i');
const preloadNumber = $('.preloader__meta b');

function boot() {
  let p = 0;
  const tick = () => {
    p += Math.max(2, (100 - p) * 0.18);
    if (p > 99) p = 100;
    if (preloadBar) preloadBar.style.width = `${p}%`;
    if (preloadNumber) preloadNumber.textContent = String(Math.round(p)).padStart(2, '0');
    if (p < 100) requestAnimationFrame(tick);
    else setTimeout(() => {
      preloader?.classList.add('is-done');
      animateHero();
    }, 220);
  };
  requestAnimationFrame(tick);
}

function animateHero() {
  if (!window.gsap || reduced) return;
  const gsap = window.gsap;
  gsap.from('.hero__line i', {
    yPercent: 120,
    duration: 1.2,
    stagger: .11,
    ease: 'power4.out'
  });
  gsap.from('.hero__image', {
    clipPath: 'polygon(50% 50%,50% 50%,50% 50%,50% 50%)',
    scale: .92,
    duration: 1.45,
    delay: .1,
    ease: 'power4.out'
  });
  gsap.from('.hero__eyebrow,.hero__intro,.hero__coords,.hero__scroll', {
    opacity: 0,
    y: 18,
    duration: .8,
    delay: .45,
    stagger: .08,
    ease: 'power2.out'
  });
}

function initMenu() {
  const menu = $('#menu');
  const open = $('.topbar__menu');
  const close = $('.menu__close');
  if (!menu || !open) return;

  let returnFocus = null;
  const focusableSelector = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

  const set = (state) => {
    menu.classList.toggle('is-open', state);
    document.body.classList.toggle('menu-open', state);
    open.setAttribute('aria-expanded', String(state));
    menu.setAttribute('aria-hidden', String(!state));

    if (state) {
      returnFocus = document.activeElement;
      menu.removeAttribute('inert');
      requestAnimationFrame(() => close?.focus());
    } else {
      menu.setAttribute('inert', '');
      if (returnFocus instanceof HTMLElement) returnFocus.focus();
    }
  };

  open.addEventListener('click', () => set(true));
  close?.addEventListener('click', () => set(false));
  $$('.menu a').forEach(a => a.addEventListener('click', () => set(false)));

  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = $$(focusableSelector, menu).filter(el => !el.hasAttribute('inert'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) set(false);
  });
}

function initTreatments() {
  const items = $$('.treatment-item');
  const photos = $$('.treatments__photo');

  const setActive = (selected) => {
    items.forEach(item => {
      const active = item === selected;
      item.classList.toggle('is-active', active);
      $('button', item)?.setAttribute('aria-expanded', String(active));
      $('.treatment-item__body', item)?.setAttribute('aria-hidden', String(!active));
    });

    const key = selected?.dataset.photo;
    photos.forEach(photo => {
      photo.classList.toggle('is-visible', Boolean(key) && photo.classList.contains(`treatments__photo--${key}`));
    });
  };

  items.forEach(item => {
    $('button', item)?.addEventListener('click', () => setActive(item));
  });

  const initial = items.find(item => item.classList.contains('is-active')) || items[0];
  if (initial) setActive(initial);
}

function initFaq() {
  const details = $$('.faq details');
  details.forEach(el => el.addEventListener('toggle', () => {
    if (!el.open) return;
    details.forEach(other => { if (other !== el) other.open = false; });
  }));
}

function initCursor() {
  if (coarse || reduced || !window.gsap) return;

  const cursor = $('.cursor');
  const cursorLabel = $('.cursor span');
  if (!cursor || !cursorLabel) return;

  const gsap = window.gsap;
  const cursorX = gsap.quickTo(cursor, 'x', { duration: .3, ease: 'power3' });
  const cursorY = gsap.quickTo(cursor, 'y', { duration: .3, ease: 'power3' });

  window.addEventListener('mousemove', e => {
    cursorX(e.clientX);
    cursorY(e.clientY);
  }, { passive: true });

  $$('.image-warp').forEach(el => {
    const img = $('img', el);
    const canWarpImage = Boolean(img) && (el.classList.contains('hero__image') || el.classList.contains('gallery__shot'));
    const baseScale = el.classList.contains('hero__image') ? 1.07 : 1;
    const imageX = canWarpImage ? gsap.quickTo(img, 'xPercent', { duration: .45, ease: 'power3' }) : null;
    const imageY = canWarpImage ? gsap.quickTo(img, 'yPercent', { duration: .45, ease: 'power3' }) : null;

    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-on');
      cursorLabel.textContent = el.dataset.cursor || 'ver';
      if (canWarpImage) gsap.to(img, { scale: baseScale + .035, duration: .55, ease: 'power3.out', overwrite: 'auto' });
    });

    el.addEventListener('mousemove', e => {
      if (!canWarpImage) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - .5;
      const dy = (e.clientY - rect.top) / rect.height - .5;
      imageX(dx * 2.4);
      imageY(dy * 2.4);
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-on');
      if (!canWarpImage) return;
      imageX(0);
      imageY(0);
      gsap.to(img, { scale: baseScale, duration: .7, ease: 'power3.out', overwrite: 'auto' });
    });
  });

  window.addEventListener('blur', () => cursor.classList.remove('is-on'));
}

function initMagnetic() {
  if (coarse || reduced || !window.gsap) return;
  const gsap = window.gsap;

  $$('.magnetic').forEach(el => {
    const moveX = gsap.quickTo(el, 'x', { duration: .32, ease: 'power3' });
    const moveY = gsap.quickTo(el, 'y', { duration: .32, ease: 'power3' });

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      moveX((e.clientX - (rect.left + rect.width / 2)) * .08);
      moveY((e.clientY - (rect.top + rect.height / 2)) * .15);
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}

function initSceneTone() {
  const topbar = $('.topbar');
  const label = $('#scene-label');
  const scenes = $$('.scene');
  if (!scenes.length) return;

  const setScene = (scene) => {
    if (!scene) return;
    if (label) label.textContent = scene.dataset.scene || '';
    const tone = scene.dataset.tone || 'warm';
    const dark = ['dark', 'ink', 'olive'].includes(tone);
    topbar?.classList.toggle('is-dark', dark);
    document.body.dataset.tone = tone;
  };

  const pickCurrent = () => {
    const probe = innerHeight * .45;
    const active = scenes.find(scene => {
      const rect = scene.getBoundingClientRect();
      return rect.top <= probe && rect.bottom >= probe;
    });
    setScene(active || scenes[0]);
  };

  pickCurrent();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      if (visible[0]) setScene(visible[0].target);
    }, { rootMargin: '-44% 0px -44% 0px', threshold: 0 });

    scenes.forEach(scene => observer.observe(scene));
  } else {
    window.addEventListener('scroll', pickCurrent, { passive: true });
  }

  window.addEventListener('resize', pickCurrent, { passive: true });
}

function initScroll() {
  if (!window.gsap || !window.ScrollTrigger || reduced) return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  $$('.reveal').filter(el => !el.closest('.hero')).forEach((el) => {
    gsap.from(el, {
      y: 44,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.to('.observation__scanner', { rotation: 80, scale: 1.13, ease: 'none', scrollTrigger: { trigger: '.observation', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.observation__media img', { yPercent: -7, ease: 'none', scrollTrigger: { trigger: '.observation', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  const statementWords = $$('.statement__type span');
  statementWords.forEach((el, i) => gsap.fromTo(el,
    { xPercent: i === 1 ? 12 : (i === 2 ? -12 : -8) },
    { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
  ));

  gsap.to('.lab__grid', { backgroundPosition: '18vw 12vw', ease: 'none', scrollTrigger: { trigger: '.lab', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  gsap.to('.gallery__shot--a', { y: -110, rotation: 2.5, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.gallery__shot--b', { y: -190, rotation: -2, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.gallery__shot--c', { y: -260, rotation: 3, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  gsap.to('.place__curtain--a', { xPercent: -101, ease: 'power2.inOut', scrollTrigger: { trigger: '.place', start: 'top 70%', end: 'top 10%', scrub: .8 } });
  gsap.to('.place__curtain--b', { xPercent: 101, ease: 'power2.inOut', scrollTrigger: { trigger: '.place', start: 'top 70%', end: 'top 10%', scrub: .8 } });
  gsap.to('.place__image img', { scale: 1.11, yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.place', start: 'top bottom', end: 'bottom top', scrub: 1 } });


  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

function initWebGL() {
  if (reduced || !window.THREE) return;
  const THREE = window.THREE;
  const canvas = $('#webgl');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !coarse,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.15 : 1.55));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, innerWidth / innerHeight, .1, 100);
  camera.position.set(0, 0, 8.8);

  const skin = new THREE.Group();
  scene.add(skin);

  function createSkinLayer(width, height, cols, rows, color, opacity, phase) {
    const vertices = [];
    const indices = [];
    const base = [];

    for (let y = 0; y <= rows; y++) {
      const v = y / rows;
      const taper = .58 + Math.sin(v * Math.PI) * .42;
      for (let x = 0; x <= cols; x++) {
        const u = x / cols;
        const px = (u - .5) * width * taper;
        const py = (v - .5) * height;
        const pz =
          Math.sin(v * Math.PI * 1.7 + phase) * .18 +
          Math.sin(u * Math.PI * 2.2 + phase * .7) * .1;
        vertices.push(px, py, pz);
        base.push(px, py, pz);
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const a = y * (cols + 1) + x;
        const b = a + 1;
        const c = a + cols + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity,
      roughness: .54,
      metalness: 0,
      transmission: .08,
      thickness: .65,
      clearcoat: .16,
      clearcoatRoughness: .72,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      base: new Float32Array(base),
      phase
    };
    return mesh;
  }

  const back = createSkinLayer(3.9, 5.6, coarse ? 18 : 28, coarse ? 24 : 38, '#d9b2a7', .2, .4);
  const middle = createSkinLayer(3.45, 5.15, coarse ? 18 : 28, coarse ? 24 : 38, '#b66e73', .24, 1.7);
  const front = createSkinLayer(3.1, 4.75, coarse ? 18 : 28, coarse ? 24 : 38, '#7e3342', .2, 2.9);

  back.position.set(-.34, .08, -.55);
  middle.position.set(.12, -.02, -.16);
  front.position.set(.42, -.06, .2);
  back.rotation.z = -.25;
  middle.rotation.z = .08;
  front.rotation.z = .31;
  back.rotation.y = -.26;
  middle.rotation.y = .14;
  front.rotation.y = -.12;

  [back, middle, front].forEach(layer => {
    layer.userData.homeY = layer.position.y;
    layer.userData.homeRotZ = layer.rotation.z;
  });

  skin.add(back, middle, front);

  const key = new THREE.DirectionalLight('#fff2e6', 2.3);
  key.position.set(3, 4, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#f1b8ae', 1.05);
  fill.position.set(-4, -1, 3);
  scene.add(fill);
  scene.add(new THREE.AmbientLight('#ffffff', .85));

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!coarse) {
    window.addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / innerWidth - .5) * 2;
      mouse.ty = -(e.clientY / innerHeight - .5) * 2;
    }, { passive: true });
  }

  const tones = {
    warm:    { a:'#d9b2a7', b:'#b66e73', c:'#7e3342', opacity:.23, x:.78, y:-.04, scale:1.02 },
    dark:    { a:'#e9d7c4', b:'#bda98e', c:'#9a746b', opacity:.14, x:.86, y:.03, scale:.9 },
    cream:   { a:'#dfb9ae', b:'#b76f74', c:'#7c3442', opacity:.13, x:.08, y:.04, scale:1.16 },
    rose:    { a:'#f0c7ba', b:'#a95b66', c:'#642634', opacity:.14, x:.72, y:.04, scale:.94 },
    ink:     { a:'#dfe3b0', b:'#b7b987', c:'#787c5b', opacity:.15, x:-.7, y:.05, scale:1.03 },
    olive:   { a:'#eadcc9', b:'#c8b69e', c:'#8f7e6b', opacity:.13, x:.8, y:-.02, scale:.87 },
    paper:   { a:'#e0b7ad', b:'#ad676e', c:'#793744', opacity:.12, x:-.72, y:.02, scale:.91 },
    contact: { a:'#f1d5c7', b:'#c58d87', c:'#8a4b55', opacity:.16, x:.28, y:.08, scale:1.12 }
  };

  Object.values(tones).forEach(tone => {
    tone.colors = [new THREE.Color(tone.a), new THREE.Color(tone.b), new THREE.Color(tone.c)];
  });

  let lastTone = 'warm';
  const current = {
    x: tones.warm.x,
    y: tones.warm.y,
    scale: tones.warm.scale,
    opacity: tones.warm.opacity,
    colors: tones.warm.colors.map(color => color.clone())
  };

  const layers = [back, middle, front];
  const clock = new THREE.Clock();
  let frame = 0;
  let placementX = 3;
  let viewportScale = 1;

  const updateViewportTuning = () => {
    if (innerWidth <= 640) {
      placementX = 1.45;
      viewportScale = .82;
    } else if (innerWidth <= 980) {
      placementX = 2.05;
      viewportScale = .9;
    } else {
      placementX = 3;
      viewportScale = 1;
    }
  };
  updateViewportTuning();

  function animate() {
    const t = clock.getElapsedTime();
    frame += 1;

    mouse.x += (mouse.tx - mouse.x) * .035;
    mouse.y += (mouse.ty - mouse.y) * .035;

    const tone = document.body.dataset.tone || 'warm';
    if (tones[tone]) lastTone = tone;
    const target = tones[lastTone];

    current.x += (target.x - current.x) * .03;
    current.y += (target.y - current.y) * .03;
    current.scale += (target.scale - current.scale) * .03;
    current.opacity += (target.opacity - current.opacity) * .03;

    current.colors[0].lerp(target.colors[0], .025);
    current.colors[1].lerp(target.colors[1], .025);
    current.colors[2].lerp(target.colors[2], .025);

    skin.position.x = current.x * placementX + mouse.x * .14;
    skin.position.y = current.y * 2.2 + mouse.y * .1;
    skin.scale.setScalar(current.scale * viewportScale);
    skin.rotation.x += ((mouse.y * .055) - skin.rotation.x) * .025;
    skin.rotation.y += ((mouse.x * .08) - skin.rotation.y) * .025;

    layers.forEach((layer, layerIndex) => {
      const pos = layer.geometry.attributes.position.array;
      const base = layer.userData.base;
      const phase = layer.userData.phase;

      for (let i = 0; i < pos.length; i += 3) {
        const bx = base[i];
        const by = base[i + 1];
        const bz = base[i + 2];
        const vertical = by * .95;
        const horizontal = bx * 1.25;

        pos[i] = bx + Math.sin(vertical + t * .45 + phase) * (.035 + layerIndex * .012);
        pos[i + 1] = by + Math.cos(horizontal * .7 - t * .32 + phase) * .025;
        pos[i + 2] = bz
          + Math.sin(vertical * 1.35 + t * .55 + phase) * (.12 + layerIndex * .025)
          + Math.cos(horizontal + t * .38 + phase) * .07;
      }

      layer.geometry.attributes.position.needsUpdate = true;
      if (!coarse && frame % 6 === 0) layer.geometry.computeVertexNormals();
      layer.material.color.copy(current.colors[layerIndex]);
      layer.material.opacity = current.opacity * (layerIndex === 1 ? 1 : .82);
      layer.rotation.z = layer.userData.homeRotZ + Math.sin(t * .16 + phase) * .025;
      layer.position.y = layer.userData.homeY + Math.sin(t * .22 + phase) * .035;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.15 : 1.55));
      updateViewportTuning();
    }, 100);
  });
}

const start = () => {
  boot();
  initMenu();
  initTreatments();
  initFaq();
  initCursor();
  initMagnetic();
  initSceneTone();
  initScroll();
  initWebGL();
};

if (document.readyState === 'complete') start();
else window.addEventListener('load', start, { once: true });
