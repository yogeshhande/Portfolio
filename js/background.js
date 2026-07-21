/* =========================================================
   background.js — interactive 3D animated backdrop (Three.js)
   A drifting field of low-poly wireframe shapes + a connected
   particle network. Multi-hue accent palette that slowly shifts
   over time. Particles repel from the cursor/touch point, and
   clicking/tapping fires a colored burst ring.
   Respects prefers-reduced-motion and pauses off-screen/off-tab.
   ========================================================= */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Palette: cool-to-warm accent spread over the dark base ---- */
  const PALETTE = [
    0xd4ff3f, // signature lime
    0x3ff0ff, // electric cyan
    0xa93fff, // violet
    0xff3fb0, // magenta-pink
    0x3f7fff  // azure
  ];
  const PALETTE_HSL = PALETTE.map(hex => {
    const c = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    return hsl;
  });

  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const isMobile = width < 700;

  /* ---- Group 1: floating wireframe polyhedra, each tinted from the palette ---- */
  const shapesGroup = new THREE.Group();
  const shapeGeometries = [
    new THREE.IcosahedronGeometry(1.6, 0),
    new THREE.OctahedronGeometry(1.3, 0),
    new THREE.TetrahedronGeometry(1.5, 0),
    new THREE.TorusGeometry(1.1, 0.32, 8, 24),
    new THREE.DodecahedronGeometry(1.2, 0)
  ];

  const shapeCount = isMobile ? 7 : 14;

  for (let i = 0; i < shapeCount; i++) {
    const geo = shapeGeometries[i % shapeGeometries.length];
    const paletteIdx = i % PALETTE.length;
    const mat = new THREE.MeshBasicMaterial({
      color: PALETTE[paletteIdx],
      wireframe: true,
      transparent: true,
      opacity: 0.16 + Math.random() * 0.22
    });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 34,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20 - 6
    );
    const scale = 0.6 + Math.random() * 1.2;
    mesh.scale.setScalar(scale);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    mesh.userData.spin = {
      x: (Math.random() - 0.5) * 0.0016,
      y: (Math.random() - 0.5) * 0.0022,
    };
    mesh.userData.drift = {
      y: (Math.random() - 0.5) * 0.004,
      phase: Math.random() * Math.PI * 2
    };
    mesh.userData.hueBase = PALETTE_HSL[paletteIdx].h;
    mesh.userData.hueOffset = Math.random() * 1;

    shapesGroup.add(mesh);
  }
  scene.add(shapesGroup);

  /* ---- Group 2: connected particle field (network), colored per-particle ---- */
  const particleCount = isMobile ? 45 : 95;
  const basePositions = new Float32Array(particleCount * 3);
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const particleData = [];

  const tmpColor = new THREE.Color();
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 24;
    const z = (Math.random() - 0.5) * 24 - 8;
    basePositions[i * 3] = x;
    basePositions[i * 3 + 1] = y;
    basePositions[i * 3 + 2] = z;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const hex = PALETTE[i % PALETTE.length];
    tmpColor.set(hex);
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;

    particleData.push({
      baseY: y,
      speed: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      offX: 0, offY: 0, offZ: 0,
      velX: 0, velY: 0, velZ: 0
    });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0.75,
    vertexColors: true
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---- Connection lines between nearby particles ---- */
  const maxDist = 5.2;
  const lineGeo = new THREE.BufferGeometry();
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x9fb84a,
    transparent: true,
    opacity: 0.12
  });
  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegments);

  function rebuildLines() {
    const pos = particleGeo.attributes.position.array;
    const linePositions = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          linePositions.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          linePositions.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  }
  rebuildLines();

  /* ---- Pointer tracking: screen -> world plane, for repulsion + parallax ---- */
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2(0, 0);
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 8);
  const pointerWorld = new THREE.Vector3();
  let pointerActive = false;

  let mouseX = 0, mouseY = 0;

  function updatePointer(clientX, clientY) {
    mouseX = (clientX / width) - 0.5;
    mouseY = (clientY / height) - 0.5;
    pointerNDC.x = (clientX / width) * 2 - 1;
    pointerNDC.y = -(clientY / height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    raycaster.ray.intersectPlane(interactionPlane, pointerWorld);
    pointerActive = true;
  }

  window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('mouseleave', () => { pointerActive = false; });
  window.addEventListener('touchend', () => { pointerActive = false; });

  /* ---- Click / tap burst: a colored expanding ring + particle kick ---- */
  const bursts = [];
  function spawnBurst(clientX, clientY) {
    updatePointer(clientX, clientY);
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const ringGeo = new THREE.RingGeometry(0.05, 0.12, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pointerWorld);
    ring.lookAt(camera.position);
    scene.add(ring);
    bursts.push({ mesh: ring, age: 0 });

    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const dx = pos[i * 3] - pointerWorld.x;
      const dy = pos[i * 3 + 1] - pointerWorld.y;
      const dz = pos[i * 3 + 2] - pointerWorld.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      if (dist < 7) {
        const force = (1 - dist / 7) * 1.4;
        const d = particleData[i];
        d.velX += (dx / dist) * force;
        d.velY += (dy / dist) * force;
        d.velZ += (dz / dist) * force;
      }
    }
  }

  window.addEventListener('click', (e) => spawnBurst(e.clientX, e.clientY));
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) spawnBurst(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  /* ---- Resize handling ---- */
  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  /* ---- Pause when tab hidden (perf) ---- */
  let isVisible = true;
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible) animate();
  });

  /* ---- If reduced motion: render a single static frame, no loop ---- */
  if (reduceMotion) {
    renderer.render(scene, camera);
    return;
  }

  /* ---- Animation loop ---- */
  const clock = new THREE.Clock();
  let frame = 0;
  const REPEL_RADIUS = 4.2;
  const REPEL_STRENGTH = 0.035;
  const SPRING = 0.03;
  const DAMPING = 0.9;

  function animate() {
    if (!isVisible) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    frame++;

    shapesGroup.children.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.spin.x;
      mesh.rotation.y += mesh.userData.spin.y;
      mesh.position.y += Math.sin(t * mesh.userData.drift.y + mesh.userData.drift.phase) * 0.002;

      const hue = (mesh.userData.hueBase + Math.sin(t * 0.05 + mesh.userData.hueOffset) * 0.06 + 1) % 1;
      mesh.material.color.setHSL(hue, 0.85, 0.6);
    });

    const posAttr = particleGeo.attributes.position;
    const posArr = posAttr.array;
    for (let i = 0; i < particleCount; i++) {
      const d = particleData[i];
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1] + Math.sin(t * d.speed + d.phase) * 0.6;
      const bz = basePositions[i * 3 + 2];

      if (pointerActive) {
        const dx = bx + d.offX - pointerWorld.x;
        const dy = by + d.offY - pointerWorld.y;
        const dz = bz + d.offZ - pointerWorld.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
        if (dist < REPEL_RADIUS) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          d.velX += (dx / dist) * force;
          d.velY += (dy / dist) * force;
          d.velZ += (dz / dist) * force;
        }
      }

      d.velX += -d.offX * SPRING;
      d.velY += -d.offY * SPRING;
      d.velZ += -d.offZ * SPRING;
      d.velX *= DAMPING;
      d.velY *= DAMPING;
      d.velZ *= DAMPING;
      d.offX += d.velX;
      d.offY += d.velY;
      d.offZ += d.velZ;

      posArr[i * 3] = bx + d.offX;
      posArr[i * 3 + 1] = by + d.offY;
      posArr[i * 3 + 2] = bz + d.offZ;
    }
    posAttr.needsUpdate = true;

    if (frame % 4 === 0) rebuildLines();

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.age += 0.02;
      const s = 1 + b.age * 9;
      b.mesh.scale.set(s, s, s);
      b.mesh.material.opacity = Math.max(0, 0.6 - b.age * 0.7);
      b.mesh.lookAt(camera.position);
      if (b.age > 0.9) {
        scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        bursts.splice(i, 1);
      }
    }

    scene.rotation.x += (mouseY * 0.3 - scene.rotation.x) * 0.02;
    scene.rotation.y += (mouseX * 0.4 - scene.rotation.y) * 0.02;

    camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.4 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();
