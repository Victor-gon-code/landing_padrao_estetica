(() => {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 900px)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const lowPower = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);


  // ---------- organic chapter seams ----------
  const bridgeShapes = {
    a: {
      start: 'M0 92 C165 72 250 118 430 86 C610 52 740 104 900 74 C1035 48 1120 65 1200 58',
      end:   'M0 56 C170 28 300 104 470 60 C635 18 760 86 930 42 C1045 20 1130 46 1200 34'
    },
    b: {
      start: 'M0 68 C120 42 270 54 390 92 C555 145 660 58 820 76 C1000 96 1090 38 1200 66',
      end:   'M0 38 C130 14 280 30 415 68 C565 108 690 28 845 52 C1000 76 1100 18 1200 42'
    },
    c: {
      start: 'M0 104 C190 118 290 44 455 62 C635 82 710 132 885 92 C1045 55 1110 88 1200 76',
      end:   'M0 64 C185 82 310 18 480 38 C650 58 745 94 900 58 C1045 24 1130 52 1200 44'
    }
  };

  const bridgeSpecs = [
    { selector: '.hero',      color: '#111216', line: 'rgba(243,239,230,.32)', variant: 'a', edge: 'bottom' },
    { selector: '.scan',      color: '#ead7dc', line: 'rgba(216,238,114,.32)', variant: 'b', edge: 'bottom' },
    { selector: '.thesis',    color: '#121319', line: 'rgba(239,115,92,.32)',  variant: 'c', edge: 'bottom' },
    { selector: '.ritual',    color: '#d8ee72', line: 'rgba(23,20,25,.22)',   variant: 'b', edge: 'top' },
    { selector: '.ritual',    color: '#15161a', line: 'rgba(170,185,231,.3)',  variant: 'a', edge: 'bottom' },
    { selector: '.room',      color: '#ead7dc', line: 'rgba(216,238,114,.28)', variant: 'c', edge: 'bottom' },
    { selector: '.questions', color: '#d8ee72', line: 'rgba(239,115,92,.3)',  variant: 'b', edge: 'bottom' }
  ];

  function makeBridge(spec) {
    const host = qs(spec.selector);
    if (!host || host.querySelector(`.scene-bridge--${spec.edge}`)) return;

    const shape = bridgeShapes[spec.variant];
    const bridge = document.createElement('div');
    bridge.className = `scene-bridge scene-bridge--${spec.edge}`;
    bridge.style.setProperty('--bridge-color', spec.color);
    bridge.style.setProperty('--bridge-line', spec.line);
    bridge.dataset.pathStart = shape.start;
    bridge.dataset.pathEnd = shape.end;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1200 160');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    const fill = document.createElementNS(svgNS, 'path');
    fill.classList.add('scene-bridge__fill');
    fill.setAttribute('d', `${shape.start} L1200 160 L0 160 Z`);

    const hairline = document.createElementNS(svgNS, 'path');
    hairline.classList.add('scene-bridge__hairline');
    hairline.setAttribute('d', shape.start);

    svg.append(fill, hairline);
    bridge.append(svg);
    host.append(bridge);
  }

  bridgeSpecs.forEach(makeBridge);

  // ---------- loader ----------
  const boot = qs('.boot');
  const bootBar = qs('.boot__line i');
  const bootNumber = qs('.boot__meta b');
  let progress = 0;
  const loaderTimer = setInterval(() => {
    progress = Math.min(progress + Math.max(2, Math.random() * 9), 94);
    bootBar.style.width = `${progress}%`;
    bootNumber.textContent = String(Math.round(progress)).padStart(2, '0');
  }, 85);

  let bootFinished = false;
  function finishBoot() {
    if (bootFinished) return;
    bootFinished = true;
    clearInterval(loaderTimer);
    bootBar.style.width = '100%';
    bootNumber.textContent = '100';
    setTimeout(() => {
      if (window.gsap && !reduceMotion) {
        gsap.to(boot, { yPercent: -100, duration: .9, ease: 'power4.inOut', onComplete: () => boot.remove() });
      } else {
        boot.style.display = 'none';
      }
    }, 180);
  }
  addEventListener('load', finishBoot, { once: true });
  setTimeout(finishBoot, 2600);

  // ---------- site map ----------
  const mapToggle = qs('.map-toggle');
  const mapClose = qs('.map-close');
  const siteMap = qs('.site-map');
  function setMap(open) {
    document.body.classList.toggle('map-open', open);
    mapToggle.setAttribute('aria-expanded', String(open));
    siteMap.setAttribute('aria-hidden', String(!open));
    if (!open && scrollY < 84) qs('.chrome')?.classList.remove('is-hidden');
  }
  mapToggle?.addEventListener('click', () => setMap(!document.body.classList.contains('map-open')));
  mapClose?.addEventListener('click', () => setMap(false));
  qsa('.site-map a').forEach(a => a.addEventListener('click', () => setMap(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMap(false); });

  // ---------- fixed header behavior ----------
  const chrome = qs('.chrome');
  let lastScrollY = scrollY;
  let headerTicking = false;

  function updateChrome() {
    const current = scrollY;
    if (document.body.classList.contains('map-open')) {
      chrome?.classList.add('is-hidden');
    } else if (current < 84) {
      chrome?.classList.remove('is-hidden');
    } else if (current > lastScrollY + 7) {
      chrome?.classList.add('is-hidden');
    } else if (current < lastScrollY - 7) {
      chrome?.classList.remove('is-hidden');
    }
    lastScrollY = current;
    headerTicking = false;
  }

  addEventListener('scroll', () => {
    if (!headerTicking) {
      requestAnimationFrame(updateChrome);
      headerTicking = true;
    }
  }, { passive: true });

  // ---------- section label ----------
  const sceneName = qs('#scene-name');
  const sceneObserver = new IntersectionObserver((entries) => {
    const active = entries.filter(x => x.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (active) {
      if (sceneName) sceneName.textContent = active.target.dataset.scene || '';
      if (typeof setOrbState === 'function') setOrbState(active.target);
    }
  }, { threshold: [.2, .42, .62], rootMargin: '-14% 0px -24% 0px' });
  qsa('.scene').forEach(s => sceneObserver.observe(s));

  // ---------- scan lens ----------
  const scanMedia = qs('#scan-media');
  if (scanMedia && !reduceMotion && finePointer) {
    let tx = 64, ty = 48, x = tx, y = ty;
    const setTarget = e => {
      const r = scanMedia.getBoundingClientRect();
      tx = Math.max(8, Math.min(92, ((e.clientX - r.left) / r.width) * 100));
      ty = Math.max(10, Math.min(90, ((e.clientY - r.top) / r.height) * 100));
    };
    scanMedia.addEventListener('pointermove', setTarget, { passive: true });
    const animateLens = () => {
      x += (tx - x) * .09;
      y += (ty - y) * .09;
      scanMedia.style.setProperty('--x', `${x}%`);
      scanMedia.style.setProperty('--y', `${y}%`);
      requestAnimationFrame(animateLens);
    };
    animateLens();
  }

  // ---------- WebGL living matter ----------
  let renderer, scene, camera, mesh, material;
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  let renderEnabled = true;
  let webglReady = false;
  const canvas = qs('#skin-canvas');

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vWave;
    uniform float uTime;
    uniform float uMorph;

    void main() {
      vec3 p = position;
      float a = sin(p.x * 3.2 + uTime * .72);
      float b = sin(p.y * 3.8 - uTime * .58);
      float c = sin(p.z * 2.7 + uTime * .46);
      float wave = a * b * c;
      float ripple = sin(length(p.xy) * 7.0 - uTime * 1.15) * .22;
      float displace = (wave * .12 + ripple * .035) * uMorph;
      p += normal * displace;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vViewPosition = -mv.xyz;
      vNormal = normalize(normalMatrix * normal);
      vWave = wave;
      gl_Position = projectionMatrix * mv;
    }
  `;

  const fragmentShader = `
    precision highp float;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vWave;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uEdge;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);
      vec3 L = normalize(vec3(-.45, .8, 1.0));
      float light = dot(N, L) * .5 + .5;
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.2);
      float mixValue = smoothstep(-.9, .9, N.y + vWave * .24);
      vec3 color = mix(uColorA, uColorB, mixValue);
      color *= .68 + light * .47;
      color = mix(color, uEdge, fresnel * .48);
      gl_FragColor = vec4(color, .97);
    }
  `;

  function hexColor(hex) {
    return new THREE.Color(hex);
  }

  function initWebGL() {
    if (!canvas || !window.THREE) throw new Error('WebGL library unavailable');
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !lowPower,
      powerPreference: lowPower ? 'low-power' : 'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 100);
    camera.position.z = 5.1;

    const geometry = new THREE.IcosahedronGeometry(isMobile ? 1.28 : 1.52, lowPower ? 3 : 5);
    material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 1 },
        uColorA: { value: hexColor('#ff6d4a') },
        uColorB: { value: hexColor('#f5d7cc') },
        uEdge: { value: hexColor('#231b21') }
      },
      vertexShader,
      fragmentShader
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(isMobile ? .85 : 1.72, 0, 0);
    mesh.rotation.set(.35, -.65, -.12);
    scene.add(mesh);
    webglReady = true;
  }

  function resizeWebGL() {
    if (!renderer || !camera) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
    renderer.setSize(innerWidth, innerHeight, false);
  }

  function setOrbState(section, immediate = false) {
    if (!webglReady || !mesh || !material || !section) return;
    const colors = (section.dataset.orb || '#ff6d4a,#f5d7cc,#231b21').split(',');
    const x = Number(section.dataset.orbX || 0) * (isMobile ? .62 : 1.55);
    const y = Number(section.dataset.orbY || 0) * (isMobile ? .72 : 1);
    const scale = Number(section.dataset.orbScale || 1) * (isMobile ? .82 : 1);
    const duration = immediate || reduceMotion ? 0 : 1.15;

    if (window.gsap) {
      gsap.to(mesh.position, { x, y, duration, ease: 'power2.out', overwrite: true });
      gsap.to(mesh.scale, { x: scale, y: scale, z: scale, duration, ease: 'power2.out', overwrite: true });
      gsap.to(material.uniforms.uColorA.value, { r: hexColor(colors[0]).r, g: hexColor(colors[0]).g, b: hexColor(colors[0]).b, duration, overwrite: true });
      gsap.to(material.uniforms.uColorB.value, { r: hexColor(colors[1]).r, g: hexColor(colors[1]).g, b: hexColor(colors[1]).b, duration, overwrite: true });
      gsap.to(material.uniforms.uEdge.value, { r: hexColor(colors[2]).r, g: hexColor(colors[2]).g, b: hexColor(colors[2]).b, duration, overwrite: true });
    } else {
      mesh.position.set(x, y, 0);
      mesh.scale.setScalar(scale);
      material.uniforms.uColorA.value.set(colors[0]);
      material.uniforms.uColorB.value.set(colors[1]);
      material.uniforms.uEdge.value.set(colors[2]);
    }
  }

  try {
    initWebGL();
    setOrbState(qs('.hero'), true);
  } catch (err) {
    document.body.classList.add('no-webgl');
    console.warn('WebGL fallback active:', err);
  }

  addEventListener('resize', resizeWebGL, { passive: true });
  addEventListener('pointermove', e => {
    if (!webglReady || reduceMotion || !finePointer) return;
    targetX = (e.clientX / innerWidth - .5) * .32;
    targetY = (e.clientY / innerHeight - .5) * .22;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { renderEnabled = !document.hidden; });

  let lastFrame = 0;
  function render(now = 0) {
    requestAnimationFrame(render);
    if (!webglReady || !renderEnabled) return;
    const frameBudget = lowPower ? 33 : (reduceMotion ? 100 : 22);
    if (now - lastFrame < frameBudget) return;
    lastFrame = now;
    mouseX += (targetX - mouseX) * .045;
    mouseY += (targetY - mouseY) * .045;
    if (!reduceMotion) material.uniforms.uTime.value = now * .001;
    mesh.rotation.y += reduceMotion ? 0 : .0014;
    mesh.rotation.x += (mouseY - mesh.rotation.x * .02) * .003;
    mesh.rotation.z += (mouseX - mesh.rotation.z * .02) * .003;
    renderer.render(scene, camera);
  }
  render();

  // ---------- GSAP choreography ----------
  if (!window.gsap || !window.ScrollTrigger) {
    document.body.classList.add('no-motion-lib');
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    if (!reduceMotion) {
      gsap.from('.hero__line span', {
        yPercent: 115,
        rotate: 2,
        duration: 1.25,
        stagger: .11,
        ease: 'power4.out',
        delay: .5
      });
      gsap.from('.hero__portrait', { clipPath: 'polygon(47% 47%,53% 47%,53% 53%,47% 53%,47% 47%)', duration: 1.3, ease: 'power4.inOut', delay: .38 });
      gsap.from('.hero__signal,.hero__thought,.hero__start', { opacity: 0, y: 18, duration: .8, stagger: .08, delay: .75 });
    }

    if (!reduceMotion) {
      qsa('.scene-bridge').forEach((bridge, index) => {
        const host = bridge.parentElement;
        const fill = qs('.scene-bridge__fill', bridge);
        const hairline = qs('.scene-bridge__hairline', bridge);
        const endCurve = bridge.dataset.pathEnd;
        const isTop = bridge.classList.contains('scene-bridge--top');
        const triggerConfig = isTop
          ? { trigger: host, start: 'top 102%', end: 'top 36%', scrub: .9 }
          : { trigger: host, start: 'bottom 112%', end: 'bottom 46%', scrub: .9 };

        if (fill && hairline && endCurve) {
          gsap.to(fill, {
            attr: { d: `${endCurve} L1200 160 L0 160 Z` },
            ease: 'none',
            scrollTrigger: triggerConfig
          });
          gsap.to(hairline, {
            attr: { d: endCurve },
            ease: 'none',
            scrollTrigger: { ...triggerConfig }
          });
        }

        const svg = qs('svg', bridge);
        if (svg && !isTop) {
          gsap.fromTo(svg,
            { xPercent: index % 2 ? 0.7 : -0.7 },
            {
              xPercent: index % 2 ? -0.7 : 0.7,
              ease: 'none',
              scrollTrigger: { ...triggerConfig }
            }
          );
        }
      });
    }

    qsa('.scene[data-orb]').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 56%',
        end: 'bottom 44%',
        onEnter: () => setOrbState(section),
        onEnterBack: () => setOrbState(section)
      });
    });

    if (!reduceMotion) {
      gsap.to('.thesis-word--a', { xPercent: 12, ease: 'none', scrollTrigger: { trigger: '.thesis', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.thesis-word--b', { xPercent: -10, ease: 'none', scrollTrigger: { trigger: '.thesis', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.thesis-word--c', { xPercent: 7, ease: 'none', scrollTrigger: { trigger: '.thesis', start: 'top bottom', end: 'bottom top', scrub: 1 } });

      gsap.fromTo('.room__shutter--a', { xPercent: 0 }, { xPercent: -101, ease: 'none', scrollTrigger: { trigger: '.room', start: 'top 70%', end: 'top 18%', scrub: 1 } });
      gsap.fromTo('.room__shutter--b', { xPercent: 0 }, { xPercent: 101, ease: 'none', scrollTrigger: { trigger: '.room', start: 'top 70%', end: 'top 18%', scrub: 1 } });
      gsap.to('.room__image img', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.room', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    }

    mm.add('(max-width: 900px)', () => {
      if (reduceMotion) return;

      if (scanMedia) {
        gsap.fromTo(scanMedia,
          { '--x': '72%', '--y': '32%' },
          {
            '--x': '42%',
            '--y': '58%',
            ease: 'none',
            scrollTrigger: {
              trigger: '.scan',
              start: 'top 85%',
              end: 'bottom 20%',
              scrub: .8
            }
          }
        );
      }

      qsa('.protocol-panel--texture, .protocol-panel--structure, .protocol-panel--expression').forEach(panel => {
        const media = panel.querySelector('figure, .procedure-slot');
        const copy = panel.querySelector('.protocol-panel__text');
        if (media) {
          gsap.from(media, {
            y: 36,
            scale: .985,
            opacity: .72,
            scrollTrigger: {
              trigger: panel,
              start: 'top 78%',
              end: 'top 42%',
              scrub: .7
            }
          });
        }
        if (copy) {
          gsap.from(copy, {
            y: 26,
            opacity: .45,
            scrollTrigger: {
              trigger: copy,
              start: 'top 92%',
              end: 'top 66%',
              scrub: .55
            }
          });
        }
      });
    });

    mm.add('(min-width: 901px)', () => {
      if (reduceMotion) return;
      const track = qs('.protocol-track');
      const pin = qs('.protocols__pin');
      if (!track || !pin) return;
      const distance = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: self => pin.style.setProperty('--rail', `${(self.progress * 200) - 100}%`)
        }
      });
      return () => tween.kill();
    });

    qsa('.ritual__steps article').forEach((item, i) => {
      if (reduceMotion) return;
      gsap.from(item, {
        opacity: .22,
        y: 55,
        scrollTrigger: {
          trigger: item,
          start: 'top 82%',
          end: 'top 45%',
          scrub: .7
        }
      });
      gsap.to(item.querySelector('b'), {
        x: i % 2 ? 34 : -18,
        scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
      });
    });

    ScrollTrigger.addEventListener('refreshInit', resizeWebGL);
    addEventListener('load', () => requestAnimationFrame(() => ScrollTrigger.refresh()), { once: true });
  }

  // FAQ: keep only one open at a time on compact screens.
  if (isMobile) {
    const details = qsa('.questions details');
    details.forEach(d => d.addEventListener('toggle', () => {
      if (!d.open) return;
      details.forEach(other => { if (other !== d) other.open = false; });
    }));
  }
})();
