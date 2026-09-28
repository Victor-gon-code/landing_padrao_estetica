(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = matchMedia('(pointer: fine)');
  const mobileQuery = matchMedia('(max-width: 900px)');
  const hardwareLowPower =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  const prefersReducedMotion = () => motionQuery.matches;
  const isLowPower = () => mobileQuery.matches || Boolean(hardwareLowPower);

  /* ------------------------------------------------------------------------
     Flow-safe chapter transitions
     They live BETWEEN sections instead of inside them, so text is never
     covered by a decorative transition.
     ------------------------------------------------------------------------ */

  const seamShapes = {
    a: {
      start: 'M0 58 C160 38 280 74 430 53 C610 29 725 72 900 47 C1040 28 1125 45 1200 39',
      end:   'M0 42 C155 22 295 63 455 39 C625 15 760 59 920 33 C1050 17 1135 31 1200 27'
    },
    b: {
      start: 'M0 46 C125 27 255 34 390 61 C548 93 684 32 830 51 C990 72 1095 25 1200 45',
      end:   'M0 31 C145 13 275 26 410 49 C565 76 700 20 850 39 C1008 58 1105 15 1200 31'
    },
    c: {
      start: 'M0 63 C175 79 300 28 455 41 C620 54 735 88 885 60 C1038 31 1128 57 1200 50',
      end:   'M0 44 C170 58 312 17 476 29 C640 41 755 67 905 43 C1044 21 1135 39 1200 35'
    }
  };

  const seamSpecs = [
    { selector: '.hero',      from: '#f3efe6', to: '#111216', line: 'rgba(239,115,92,.38)', variant: 'a' },
    { selector: '.scan',      from: '#111216', to: '#ead7dc', line: 'rgba(216,238,114,.36)', variant: 'b' },
    { selector: '.thesis',    from: '#ead7dc', to: '#111216', line: 'rgba(239,115,92,.34)', variant: 'c' },
    { selector: '.protocols', from: '#d8ee72', to: '#f3efe6', line: 'rgba(23,20,25,.22)', variant: 'b' },
    { selector: '.ritual',    from: '#f3efe6', to: '#17181d', line: 'rgba(170,185,231,.34)', variant: 'a' },
    { selector: '.room',      from: '#17181d', to: '#ead7dc', line: 'rgba(216,238,114,.3)', variant: 'c' },
    { selector: '.questions', from: '#ead7dc', to: '#d8ee72', line: 'rgba(239,115,92,.32)', variant: 'b' }
  ];

  function buildSeam(spec) {
    const host = qs(spec.selector);
    if (!host || host.nextElementSibling?.classList.contains('chapter-seam')) return;

    const shape = seamShapes[spec.variant];
    const seam = document.createElement('div');
    seam.className = 'chapter-seam';
    seam.setAttribute('aria-hidden', 'true');
    seam.style.setProperty('--from', spec.from);
    seam.style.setProperty('--to', spec.to);
    seam.style.setProperty('--line', spec.line);
    seam.dataset.pathEnd = shape.end;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 1200 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    const fill = document.createElementNS(ns, 'path');
    fill.classList.add('chapter-seam__fill');
    fill.setAttribute('d', `${shape.start} L1200 100 L0 100 Z`);

    const line = document.createElementNS(ns, 'path');
    line.classList.add('chapter-seam__line');
    line.setAttribute('d', shape.start);

    svg.append(fill, line);
    seam.append(svg);
    host.insertAdjacentElement('afterend', seam);
  }

  seamSpecs.forEach(buildSeam);

  /* ------------------------------------------------------------------------
     Loader
     ------------------------------------------------------------------------ */

  const boot = qs('.boot');
  const bootBar = qs('.boot__line i');
  const bootNumber = qs('.boot__meta b');
  let bootFinished = false;
  let progress = 0;

  const loaderTimer = boot ? setInterval(() => {
    progress = Math.min(progress + Math.max(2, Math.random() * 9), 94);
    if (bootBar) bootBar.style.width = `${progress}%`;
    if (bootNumber) bootNumber.textContent = String(Math.round(progress)).padStart(2, '0');
  }, 85) : 0;

  function finishBoot() {
    if (bootFinished) return;
    bootFinished = true;
    if (loaderTimer) clearInterval(loaderTimer);
    if (!boot) return;

    if (bootBar) bootBar.style.width = '100%';
    if (bootNumber) bootNumber.textContent = '100';

    setTimeout(() => {
      if (window.gsap && !prefersReducedMotion()) {
        gsap.to(boot, {
          yPercent: -100,
          duration: .82,
          ease: 'power4.inOut',
          onComplete: () => boot.remove()
        });
      } else {
        boot.remove();
      }
    }, 140);
  }

  addEventListener('load', finishBoot, { once: true });
  setTimeout(finishBoot, 2400);

  /* ------------------------------------------------------------------------
     Menu / accessibility
     ------------------------------------------------------------------------ */

  const mapToggle = qs('.map-toggle');
  const mapClose = qs('.map-close');
  const siteMap = qs('.site-map');

  function setMap(open) {
    if (!siteMap || !mapToggle) return;

    if (open) {
      siteMap.inert = false;
      siteMap.setAttribute('aria-hidden', 'false');
      document.body.classList.add('map-open');
      mapToggle.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => mapClose?.focus({ preventScroll: true }));
      return;
    }

    if (siteMap.contains(document.activeElement)) {
      mapToggle.focus({ preventScroll: true });
    }

    document.body.classList.remove('map-open');
    mapToggle.setAttribute('aria-expanded', 'false');
    siteMap.setAttribute('aria-hidden', 'true');
    siteMap.inert = true;
  }

  mapToggle?.addEventListener('click', () => {
    setMap(!document.body.classList.contains('map-open'));
  });
  mapClose?.addEventListener('click', () => setMap(false));
  qsa('.site-map a').forEach(link => link.addEventListener('click', () => setMap(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape') setMap(false);
  });

  /* ------------------------------------------------------------------------
     Header behavior
     ------------------------------------------------------------------------ */

  const chrome = qs('.chrome');
  let lastScrollY = scrollY;
  let headerTicking = false;

  function updateChrome() {
    const current = scrollY;

    if (document.body.classList.contains('map-open')) {
      chrome?.classList.add('is-hidden');
    } else if (current < 72) {
      chrome?.classList.remove('is-hidden');
    } else if (current > lastScrollY + 8) {
      chrome?.classList.add('is-hidden');
    } else if (current < lastScrollY - 8) {
      chrome?.classList.remove('is-hidden');
    }

    lastScrollY = current;
    headerTicking = false;
  }

  addEventListener('scroll', () => {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(updateChrome);
  }, { passive: true });

  /* ------------------------------------------------------------------------
     Scene label
     ------------------------------------------------------------------------ */

  const sceneName = qs('#scene-name');
  const sceneSections = qsa('.scene');
  const sceneVisibility = new Map(sceneSections.map(section => [section, 0]));
  let activeScene = sceneSections[0] || null;

  function applyActiveScene() {
    let bestScene = activeScene;
    let bestRatio = -1;

    sceneVisibility.forEach((ratio, section) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestScene = section;
      }
    });

    if (!bestScene || bestRatio <= 0) return;
    if (bestScene === activeScene && sceneName?.textContent === (bestScene.dataset.scene || '')) return;

    activeScene = bestScene;
    if (sceneName) sceneName.textContent = bestScene.dataset.scene || '';
    setOrbState(bestScene);
  }

  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      sceneVisibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    });
    applyActiveScene();
  }, {
    threshold: [0, .2, .45, .7],
    rootMargin: '-16% 0px -30% 0px'
  });

  sceneSections.forEach(section => sceneObserver.observe(section));

  /* ------------------------------------------------------------------------
     Scan lens
     ------------------------------------------------------------------------ */

  const scan = qs('.scan');
  const scanMedia = qs('#scan-media');

  if (scan && scanMedia) {
    let targetX = 66;
    let targetY = 52;
    let currentX = targetX;
    let currentY = targetY;
    let lensFrame = 0;

    scanMedia.addEventListener('pointermove', event => {
      if (!finePointerQuery.matches || prefersReducedMotion()) return;

      const rect = scanMedia.getBoundingClientRect();
      targetX = Math.max(16, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100));
      targetY = Math.max(16, Math.min(84, ((event.clientY - rect.top) / rect.height) * 100));

      if (lensFrame) return;

      const tick = () => {
        currentX += (targetX - currentX) * .12;
        currentY += (targetY - currentY) * .12;
        scan.style.setProperty('--x', `${currentX}%`);
        scan.style.setProperty('--y', `${currentY}%`);

        if (Math.abs(targetX - currentX) > .08 || Math.abs(targetY - currentY) > .08) {
          lensFrame = requestAnimationFrame(tick);
        } else {
          lensFrame = 0;
        }
      };

      lensFrame = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     WebGL living form — always behind page content
     ------------------------------------------------------------------------ */

  let renderer;
  let scene;
  let camera;
  let mesh;
  let material;
  let webglReady = false;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let renderFrame = 0;
  let lastFrame = 0;

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

      gl_FragColor = vec4(color, .96);
    }
  `;

  function color(hex) {
    return new THREE.Color(hex);
  }

  function initWebGL() {
    if (!canvas || !window.THREE) throw new Error('Three.js unavailable');

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isLowPower(),
      powerPreference: isLowPower() ? 'low-power' : 'high-performance'
    });

    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isLowPower() ? 1.15 : 1.6));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 100);
    camera.position.z = 5.1;

    const geometry = new THREE.IcosahedronGeometry(
      mobileQuery.matches ? 1.18 : 1.48,
      isLowPower() ? 3 : 5
    );

    material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 1 },
        uColorA: { value: color('#ef735c') },
        uColorB: { value: color('#edc9bf') },
        uEdge: { value: color('#241c20') }
      },
      vertexShader,
      fragmentShader
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(mobileQuery.matches ? .72 : 1.55, .02, 0);
    mesh.rotation.set(.35, -.65, -.12);
    scene.add(mesh);

    webglReady = true;
  }

  function resizeWebGL() {
    if (!renderer || !camera) return;
    const width = Math.max(1, document.documentElement.clientWidth);
    const height = Math.max(1, innerHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isLowPower() ? 1.15 : 1.6));
    renderer.setSize(width, height, false);
  }

  function rebuildWebGLGeometry() {
    if (!mesh || !window.THREE) return;
    const next = new THREE.IcosahedronGeometry(
      mobileQuery.matches ? 1.18 : 1.48,
      isLowPower() ? 3 : 5
    );
    mesh.geometry?.dispose?.();
    mesh.geometry = next;
  }

  function setOrbState(section, immediate = false) {
    if (!webglReady || !mesh || !material || !section) return;

    const colors = (section.dataset.orb || '#ef735c,#edc9bf,#241c20').split(',');
    const mobile = mobileQuery.matches;
    const x = Number(section.dataset.orbX || 0) * (mobile ? .54 : 1.4);
    const y = Number(section.dataset.orbY || 0) * (mobile ? .66 : 1);
    const scale = Number(section.dataset.orbScale || 1) * (mobile ? .76 : .96);
    const duration = immediate || prefersReducedMotion() ? 0 : .95;

    if (window.gsap) {
      gsap.to(mesh.position, { x, y, duration, ease: 'power2.out', overwrite: true });
      gsap.to(mesh.scale, { x: scale, y: scale, z: scale, duration, ease: 'power2.out', overwrite: true });

      const a = color(colors[0]);
      const b = color(colors[1]);
      const edge = color(colors[2]);

      gsap.to(material.uniforms.uColorA.value, { r: a.r, g: a.g, b: a.b, duration, overwrite: true });
      gsap.to(material.uniforms.uColorB.value, { r: b.r, g: b.g, b: b.b, duration, overwrite: true });
      gsap.to(material.uniforms.uEdge.value, { r: edge.r, g: edge.g, b: edge.b, duration, overwrite: true });
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
  } catch (error) {
    document.body.classList.add('no-webgl');
    console.warn('WebGL fallback active:', error);
  }

  function startRenderLoop() {
    if (!webglReady || document.hidden || renderFrame) return;
    renderFrame = requestAnimationFrame(render);
  }

  function stopRenderLoop() {
    if (!renderFrame) return;
    cancelAnimationFrame(renderFrame);
    renderFrame = 0;
  }

  function render(now = 0) {
    renderFrame = 0;
    if (!webglReady || document.hidden) return;

    const frameBudget = isLowPower() ? 34 : (prefersReducedMotion() ? 100 : 22);
    if (now - lastFrame >= frameBudget) {
      lastFrame = now;

      pointerX += (targetPointerX - pointerX) * .05;
      pointerY += (targetPointerY - pointerY) * .05;

      if (!prefersReducedMotion()) {
        material.uniforms.uTime.value = now * .001;
        mesh.rotation.y += .0012;
      }

      const targetRotX = .35 + pointerY;
      const targetRotZ = -.12 + pointerX;
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * .045;
      mesh.rotation.z += (targetRotZ - mesh.rotation.z) * .045;

      renderer.render(scene, camera);
    }

    startRenderLoop();
  }

  addEventListener('resize', resizeWebGL, { passive: true });

  addEventListener('pointermove', event => {
    if (!webglReady || !finePointerQuery.matches || prefersReducedMotion()) return;
    targetPointerX = (event.clientX / Math.max(1, innerWidth) - .5) * .18;
    targetPointerY = (event.clientY / Math.max(1, innerHeight) - .5) * .12;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRenderLoop();
    else startRenderLoop();
  });

  mobileQuery.addEventListener?.('change', () => {
    rebuildWebGLGeometry();
    resizeWebGL();
    if (activeScene) setOrbState(activeScene, true);
  });

  startRenderLoop();

  /* ------------------------------------------------------------------------
     Native horizontal protocol scroll
     Vertical wheel/trackpad movement is converted into horizontal movement
     while the sticky stage stays fixed in the viewport.
     ------------------------------------------------------------------------ */

  const protocols = qs('.protocols');
  const protocolPin = qs('.protocols__pin');
  const protocolTrack = qs('.protocol-track');
  const protocolQuery = matchMedia('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

  let protocolState = {
    enabled: false,
    top: 0,
    distance: 0
  };
  let protocolScrollRaf = 0;
  let protocolMeasureRaf = 0;

  function clearHorizontalProtocols() {
    protocolState = { enabled: false, top: 0, distance: 0 };
    protocols?.classList.remove('is-horizontal');
    protocols?.style.removeProperty('--protocol-scroll-height');
    protocolTrack?.style.removeProperty('transform');
    protocolPin?.style.removeProperty('--rail');
  }

  function paintHorizontalProtocols() {
    protocolScrollRaf = 0;
    if (!protocolState.enabled || !protocolTrack || !protocolPin) return;

    const progress = protocolState.distance > 0
      ? Math.max(0, Math.min(1, (scrollY - protocolState.top) / protocolState.distance))
      : 0;

    const x = -protocolState.distance * progress;
    protocolTrack.style.transform = `translate3d(${x}px,0,0)`;
    protocolPin.style.setProperty('--rail', `${progress * 200 - 100}%`);
  }

  function measureHorizontalProtocols() {
    protocolMeasureRaf = 0;
    if (!protocols || !protocolTrack || !protocolPin) return;

    if (!protocolQuery.matches) {
      clearHorizontalProtocols();
      return;
    }

    protocols.classList.add('is-horizontal');

    // Read after the horizontal class is active. Measuring the actual sticky
    // viewport avoids 100vw/scrollbar rounding errors at panel boundaries.
    const viewportWidth = Math.max(1, protocolPin.clientWidth);
    const viewportHeight = Math.max(1, protocolPin.clientHeight || innerHeight);
    const distance = Math.max(0, protocolTrack.scrollWidth - viewportWidth);

    protocols.style.setProperty('--protocol-scroll-height', `${Math.ceil(viewportHeight + distance)}px`);

    protocolState = {
      enabled: distance > 1,
      top: protocols.getBoundingClientRect().top + scrollY,
      distance
    };

    if (protocolState.enabled) paintHorizontalProtocols();
    else clearHorizontalProtocols();
  }

  function queueHorizontalPaint() {
    if (!protocolState.enabled || protocolScrollRaf) return;
    protocolScrollRaf = requestAnimationFrame(paintHorizontalProtocols);
  }

  function queueHorizontalMeasure() {
    if (protocolMeasureRaf) return;
    protocolMeasureRaf = requestAnimationFrame(measureHorizontalProtocols);
  }

  addEventListener('scroll', queueHorizontalPaint, { passive: true });
  addEventListener('resize', queueHorizontalMeasure, { passive: true });
  addEventListener('orientationchange', () => setTimeout(queueHorizontalMeasure, 120), { passive: true });
  addEventListener('pageshow', queueHorizontalMeasure);
  protocolQuery.addEventListener?.('change', queueHorizontalMeasure);
  window.visualViewport?.addEventListener('resize', queueHorizontalMeasure, { passive: true });

  if ('ResizeObserver' in window && protocolPin && protocolTrack) {
    const protocolObserver = new ResizeObserver(() => queueHorizontalMeasure());
    protocolObserver.observe(protocolPin);
    protocolObserver.observe(protocolTrack);
  }

  measureHorizontalProtocols();

  /* ------------------------------------------------------------------------
     Scroll choreography
     ------------------------------------------------------------------------ */

  if (!window.gsap || !window.ScrollTrigger || typeof gsap.registerPlugin !== 'function') {
    document.body.classList.add('no-motion-lib');
  } else {
    document.body.classList.remove('no-motion-lib');
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    if (!prefersReducedMotion()) {
      gsap.from('.hero__line span', {
        opacity: 0,
        y: 28,
        duration: .9,
        stagger: .08,
        ease: 'power3.out',
        delay: .32
      });

      gsap.from('.hero__portrait', {
        clipPath: 'polygon(45% 46%,55% 46%,55% 54%,45% 54%)',
        duration: 1.08,
        ease: 'power4.inOut',
        delay: .26
      });

      gsap.from('.hero__signal,.hero__thought,.hero__start', {
        opacity: 0,
        y: 14,
        duration: .7,
        stagger: .07,
        ease: 'power2.out',
        delay: .62
      });

      qsa('.chapter-seam').forEach((seam, index) => {
        const fill = qs('.chapter-seam__fill', seam);
        const line = qs('.chapter-seam__line', seam);
        const svg = qs('svg', seam);
        const endCurve = seam.dataset.pathEnd;
        if (!fill || !line || !svg || !endCurve) return;

        const trigger = {
          trigger: seam,
          start: 'top 96%',
          end: 'bottom 28%',
          scrub: .7
        };

        gsap.to(fill, {
          attr: { d: `${endCurve} L1200 100 L0 100 Z` },
          ease: 'none',
          scrollTrigger: trigger
        });

        gsap.to(line, {
          attr: { d: endCurve },
          ease: 'none',
          scrollTrigger: { ...trigger }
        });

        gsap.fromTo(svg,
          { xPercent: index % 2 ? .45 : -.45 },
          {
            xPercent: index % 2 ? -.45 : .45,
            ease: 'none',
            scrollTrigger: { ...trigger }
          }
        );
      });
    }

    qsa('.scene[data-orb]').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setOrbState(section),
        onEnterBack: () => setOrbState(section)
      });
    });

    mm.add('(min-width: 901px)', () => {
      if (!prefersReducedMotion()) {
        gsap.to('.thesis-word--a', {
          xPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: '.thesis', start: 'top bottom', end: 'bottom top', scrub: 1 }
        });

        gsap.to('.thesis-word--b', {
          xPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: '.thesis', start: 'top bottom', end: 'bottom top', scrub: 1 }
        });

        gsap.to('.thesis-word--c', {
          xPercent: 3,
          ease: 'none',
          scrollTrigger: { trigger: '.thesis', start: 'top bottom', end: 'bottom top', scrub: 1 }
        });

        qsa('.ritual__steps article').forEach(article => {
          gsap.fromTo(article,
            { opacity: .76, y: 14 },
            {
              opacity: 1,
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: article,
                start: 'top 78%',
                end: 'top 48%',
                scrub: .55
              }
            }
          );
        });

        gsap.fromTo('.room__shutter--a',
          { xPercent: 0 },
          {
            xPercent: -101,
            ease: 'none',
            scrollTrigger: {
              trigger: '.room',
              start: 'top 78%',
              end: 'top 25%',
              scrub: .85
            }
          }
        );

        gsap.fromTo('.room__shutter--b',
          { xPercent: 0 },
          {
            xPercent: 101,
            ease: 'none',
            scrollTrigger: {
              trigger: '.room',
              start: 'top 78%',
              end: 'top 25%',
              scrub: .85
            }
          }
        );

        gsap.to('.room__image img', {
          scale: 1.09,
          ease: 'none',
          scrollTrigger: {
            trigger: '.room',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }
    });

    mm.add('(max-width: 900px)', () => {
      if (prefersReducedMotion()) return;

      if (scan) {
        gsap.fromTo(scan,
          { '--x': '72%', '--y': '34%' },
          {
            '--x': '58%',
            '--y': '44%',
            ease: 'none',
            scrollTrigger: {
              trigger: '.scan',
              start: 'top 82%',
              end: 'bottom 24%',
              scrub: .75
            }
          }
        );
      }

      qsa('.protocol-panel--texture, .protocol-panel--structure, .protocol-panel--expression').forEach(panel => {
        const media = panel.querySelector('figure, .procedure-slot');
        const copy = panel.querySelector('.protocol-panel__text');

        if (media) {
          gsap.from(media, {
            y: 26,
            opacity: .9,
            duration: .75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: media,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          });
        }

        if (copy) {
          gsap.from(copy, {
            y: 18,
            opacity: .84,
            duration: .65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: copy,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          });
        }
      });
    });

    let layoutRefreshFrame = 0;

    const refresh = () => {
      if (layoutRefreshFrame) return;
      layoutRefreshFrame = requestAnimationFrame(() => {
        layoutRefreshFrame = 0;
        measureHorizontalProtocols();
        ScrollTrigger.refresh(true);
        paintHorizontalProtocols();
      });
    };

    addEventListener('load', refresh, { once: true });
    addEventListener('resize', refresh, { passive: true });
    protocolQuery.addEventListener?.('change', refresh);

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    qsa('img').forEach(img => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true });
    });

    refresh();
  }

  finePointerQuery.addEventListener?.('change', () => {
    targetPointerX = 0;
    targetPointerY = 0;
  });

  motionQuery.addEventListener?.('change', () => {
    targetPointerX = 0;
    targetPointerY = 0;
    if (activeScene) setOrbState(activeScene, true);
  });

  /* ------------------------------------------------------------------------
     FAQ
     ------------------------------------------------------------------------ */

  const details = qsa('.questions details');

  details.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!mobileQuery.matches || !item.open) return;
      details.forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
