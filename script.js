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
  gsap.from('.hero__line i', { yPercent: 120, duration: 1.2, stagger: .11, ease: 'power4.out' });
  gsap.from('.hero__image', { clipPath: 'polygon(50% 50%,50% 50%,50% 50%,50% 50%)', scale: .92, duration: 1.45, ease: 'power4.out' }, .1);
  gsap.from('.hero__eyebrow,.hero__intro,.hero__coords,.hero__scroll', { opacity: 0, y: 18, duration: .8, stagger: .08, ease: 'power2.out' }, .45);
}

function initMenu() {
  const menu = $('#menu');
  const open = $('.topbar__menu');
  const close = $('.menu__close');
  if (!menu || !open) return;
  const set = (state) => {
    menu.classList.toggle('is-open', state);
    document.body.classList.toggle('menu-open', state);
    open.setAttribute('aria-expanded', String(state));
    menu.setAttribute('aria-hidden', String(!state));
    if (state) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
  };
  open.addEventListener('click', () => set(true));
  close?.addEventListener('click', () => set(false));
  $$('.menu a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
}

function initTreatments() {
  const items = $$('.treatment-item');
  const photos = $$('.treatments__photo');
  items.forEach(item => {
    const button = $('button', item);
    button?.addEventListener('click', () => {
      items.forEach(el => {
        const active = el === item;
        el.classList.toggle('is-active', active);
        $('button', el)?.setAttribute('aria-expanded', String(active));
      });
      const key = item.dataset.photo;
      photos.forEach(photo => photo.classList.toggle('is-visible', photo.classList.contains(`treatments__photo--${key}`)));
    });
  });
}

function initFaq() {
  const details = $$('.faq details');
  details.forEach(el => el.addEventListener('toggle', () => {
    if (!el.open) return;
    details.forEach(other => { if (other !== el) other.open = false; });
  }));
}

function initCursor() {
  if (coarse || reduced) return;
  const cursor = $('.cursor');
  if (!cursor || !window.gsap) return;
  const gsap = window.gsap;
  const xTo = gsap.quickTo(cursor, 'x', { duration: .3, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: .3, ease: 'power3' });
  window.addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); });
  $$('.image-warp').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-on');
      $('.cursor span').textContent = el.dataset.cursor || 'ver';
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - .5;
      const dy = (e.clientY - r.top) / r.height - .5;
      gsap.to($('img', el), { xPercent: dx * 2.5, yPercent: dy * 2.5, scale: 1.06, duration: .65, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to($('img', el), { xPercent: 0, yPercent: 0, scale: 1, duration: .8, ease: 'power3.out' }));
  });
}

function initMagnetic() {
  if (coarse || reduced || !window.gsap) return;
  const gsap = window.gsap;
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * .08, y: dy * .15, duration: .35, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.35)' }));
  });
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

  const topbar = $('.topbar');
  const label = $('#scene-label');
  $$('.scene').forEach(scene => {
    ScrollTrigger.create({
      trigger: scene,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setScene(scene),
      onEnterBack: () => setScene(scene)
    });
  });
  function setScene(scene) {
    if (label) label.textContent = scene.dataset.scene || '';
    const dark = ['dark','ink','olive'].includes(scene.dataset.tone);
    topbar?.classList.toggle('is-dark', dark);
    document.body.dataset.tone = scene.dataset.tone || '';
  }
}

function initWebGL() {
  if (reduced || !window.THREE) return;
  const THREE = window.THREE;
  const canvas = $('#webgl');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.25 : 1.7));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 100);
  camera.position.set(0, 0, 7.6);

  const group = new THREE.Group();
  scene.add(group);

  const detail = coarse ? 3 : 4;
  const geo = new THREE.IcosahedronGeometry(1.55, detail);
  const base = geo.attributes.position.array.slice();
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#b87977'),
    roughness: .28,
    metalness: .02,
    transmission: .13,
    thickness: 1.3,
    transparent: true,
    opacity: .48,
    clearcoat: .7,
    clearcoatRoughness: .32
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(.2, -.5, .1);
  group.add(mesh);

  const ringMat = new THREE.MeshBasicMaterial({ color: '#5f1f2b', transparent: true, opacity: .12, wireframe: true });
  const ring = new THREE.Mesh(new THREE.TorusKnotGeometry(2.05, .012, coarse ? 90 : 160, 8, 2, 5), ringMat);
  group.add(ring);

  const pointsGeo = new THREE.BufferGeometry();
  const count = coarse ? 65 : 130;
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.4 + Math.random() * 2.2;
    const a = Math.random() * Math.PI * 2;
    const b = (Math.random() - .5) * Math.PI;
    pts[i*3] = Math.cos(a) * Math.cos(b) * r;
    pts[i*3+1] = Math.sin(b) * r;
    pts[i*3+2] = Math.sin(a) * Math.cos(b) * r;
  }
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const points = new THREE.Points(pointsGeo, new THREE.PointsMaterial({ color: '#5f1f2b', size: .018, transparent: true, opacity: .32 }));
  group.add(points);

  const key = new THREE.PointLight('#f5d5c4', 18, 20); key.position.set(3, 3, 5); scene.add(key);
  const fill = new THREE.PointLight('#d7df85', 9, 15); fill.position.set(-4, -2, 3); scene.add(fill);
  scene.add(new THREE.AmbientLight('#ffffff', 1.2));

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!coarse) window.addEventListener('pointermove', e => {
    mouse.tx = (e.clientX / innerWidth - .5) * 2;
    mouse.ty = -(e.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  const tones = {
    warm: { color: '#b87977', opacity: .48, x: .82, y: -.08, z: 0, scale: 1.0 },
    dark: { color: '#d5c98d', opacity: .26, x: .92, y: .02, z: -.2, scale: .82 },
    cream: { color: '#7d3140', opacity: .2, x: .03, y: .05, z: -.3, scale: 1.25 },
    rose: { color: '#5f1f2b', opacity: .25, x: .72, y: .05, z: -.3, scale: .92 },
    ink: { color: '#d7df85', opacity: .32, x: -.72, y: .05, z: -.25, scale: 1.05 },
    olive: { color: '#e5d7bd', opacity: .26, x: .83, y: -.02, z: -.25, scale: .78 },
    paper: { color: '#9b5a61', opacity: .19, x: -.78, y: .02, z: -.35, scale: .85 },
    contact: { color: '#f1d4b9', opacity: .26, x: .3, y: .1, z: -.2, scale: 1.3 }
  };
  let current = { ...tones.warm, colorObj: new THREE.Color(tones.warm.color) };

  const clock = new THREE.Clock();
  let lastTone = 'warm';
  let frame = 0;
  function animate() {
    const t = clock.getElapsedTime();
    frame += 1;
    mouse.x += (mouse.tx - mouse.x) * .04;
    mouse.y += (mouse.ty - mouse.y) * .04;

    const tone = document.body.dataset.tone || 'warm';
    if (tone !== lastTone && tones[tone]) lastTone = tone;
    const target = tones[lastTone] || tones.warm;
    current.x += (target.x - current.x) * .035;
    current.y += (target.y - current.y) * .035;
    current.z += (target.z - current.z) * .035;
    current.scale += (target.scale - current.scale) * .035;
    current.opacity += (target.opacity - current.opacity) * .035;
    current.colorObj.lerp(new THREE.Color(target.color), .03);

    group.position.x = current.x * 2.7 + mouse.x * .18;
    group.position.y = current.y * 2.1 + mouse.y * .14;
    group.position.z = current.z;
    group.scale.setScalar(current.scale);
    group.rotation.x += ((mouse.y * .16 + t * .03) - group.rotation.x) * .025;
    group.rotation.y += ((mouse.x * .22 + t * .055) - group.rotation.y) * .025;
    mat.color.copy(current.colorObj);
    mat.opacity = current.opacity;
    ring.material.opacity = current.opacity * .42;

    const pos = geo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = base[i], oy = base[i+1], oz = base[i+2];
      const len = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
      const wave = 1 + Math.sin(oy * 2.7 + t * 1.15) * .035 + Math.sin(ox * 3.4 - t * .8) * .024;
      pos[i] = ox / len * 1.55 * wave;
      pos[i+1] = oy / len * 1.55 * wave;
      pos[i+2] = oz / len * 1.55 * wave;
    }
    geo.attributes.position.needsUpdate = true;
    if (!coarse || frame % 2 === 0) geo.computeVertexNormals();
    ring.rotation.z = t * .035;
    ring.rotation.y = -t * .025;
    points.rotation.y = t * .018;

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.25 : 1.7));
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
  initScroll();
  initWebGL();
};

if (document.readyState === 'complete') start();
else window.addEventListener('load', start, { once: true });
