import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ChimneyClean3D({
  scrollProgress = 0,
  brushSpeed = 1,
  airDraft = 50,
  filterStatus = 80
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({ scrollProgress, brushSpeed, airDraft, filterStatus });

  useEffect(() => {
    stateRef.current = { scrollProgress, brushSpeed, airDraft, filterStatus };
  }, [scrollProgress, brushSpeed, airDraft, filterStatus]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x06070a, 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 9);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 15, 10);
    scene.add(mainLight);

    // Orange flame glow point light
    const orangeLight = new THREE.PointLight(0xff5a00, 5, 10);
    orangeLight.position.set(0, -3, 2);
    scene.add(orangeLight);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Steel pipe color
      metalness: 0.95,
      roughness: 0.12
    });

    const transparentGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5
    });

    const brushMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8
    });

    const ringGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff5a00,
      transparent: true,
      opacity: 0.7
    });

    // Floor Grid
    const floorHelper = new THREE.GridHelper(50, 50, 0xff5a00, 0x11141c);
    floorHelper.position.y = -4.5;
    floorHelper.material.opacity = 0.18;
    floorHelper.material.transparent = true;
    scene.add(floorHelper);

    // 1. Chimney Ventilation Ductwork Group
    const ductGroup = new THREE.Group();
    ductGroup.position.y = -1;
    scene.add(ductGroup);

    // Vertical main duct (Transparent shell so we can see particles & brush inside)
    const mainDuctOuterGeo = new THREE.CylinderGeometry(0.7, 0.7, 9, 32, 1, true);
    const mainDuctOuter = new THREE.Mesh(mainDuctOuterGeo, transparentGlassMat);
    mainDuctOuter.position.y = 1;
    ductGroup.add(mainDuctOuter);

    // Steel supporting rings around the vertical pipe
    const ringGeo = new THREE.TorusGeometry(0.72, 0.03, 8, 32);
    const rings = [];
    const ringHeights = [-3.0, -1.0, 1.0, 3.0, 5.0];
    ringHeights.forEach(h => {
      const ring = new THREE.Mesh(ringGeo, metalMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = h;
      ductGroup.add(ring);
      rings.push(ring);
    });

    // Glowing scanner rings at the joints
    const glowRingGeo = new THREE.TorusGeometry(0.71, 0.015, 6, 24);
    const jointGlows = [];
    const jointHeights = [-2.0, 0, 2.0, 4.0];
    jointHeights.forEach(h => {
      const glowRing = new THREE.Mesh(glowRingGeo, ringGlowMat.clone());
      glowRing.rotation.x = Math.PI / 2;
      glowRing.position.y = h;
      ductGroup.add(glowRing);
      jointGlows.push(glowRing);
    });

    // Side duct branch 1 (tilted 45 degrees)
    const sideDuct1 = new THREE.Group();
    sideDuct1.position.set(-1.4, 2.5, 0);
    sideDuct1.rotation.z = Math.PI / 4;
    ductGroup.add(sideDuct1);

    const sidePipe1Geo = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 16);
    const sidePipe1 = new THREE.Mesh(sidePipe1Geo, metalMat);
    sideDuct1.add(sidePipe1);

    // Side duct branch 2 (tilted -45 degrees)
    const sideDuct2 = new THREE.Group();
    sideDuct2.position.set(1.4, -0.5, 0);
    sideDuct2.rotation.z = -Math.PI / 4;
    ductGroup.add(sideDuct2);

    const sidePipe2 = new THREE.Mesh(sidePipe1Geo, metalMat);
    sideDuct2.add(sidePipe2);

    // 2. Chimney Cleaning Brush Mesh
    const brushGroup = new THREE.Group();
    ductGroup.add(brushGroup);

    // Core rod
    const brushRodGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
    const brushRod = new THREE.Mesh(brushRodGeo, metalMat);
    brushGroup.add(brushRod);

    // Stack of thin bristle disks
    const bristleGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.08, 16);
    for (let i = -4; i <= 4; i++) {
      const bristle = new THREE.Mesh(bristleGeo, brushMat);
      bristle.position.y = i * 0.08;
      // Stagger slightly
      bristle.rotation.y = (i * Math.PI) / 8;
      brushGroup.add(bristle);
    }

    // 3. Smoke & Soot Air Particles System
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const pColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.sin(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 9 - 3.5; // Spread vertically
      positions[i * 3 + 2] = Math.cos(angle) * radius;
      
      speeds[i] = 0.5 + Math.random() * 1.5;

      // Initial soot color (dark grey-black)
      pColors[i * 3] = 0.2;
      pColors[i * 3 + 1] = 0.2;
      pColors[i * 3 + 2] = 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pTexture = new THREE.TextureLoader().load(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%23ffffff" /></svg>',
      () => {}
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: pTexture
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    ductGroup.add(particles);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { scrollProgress: scroll, brushSpeed: bSpeed, airDraft: draft, filterStatus: filter } = stateRef.current;

      // 1. Move cleaning brush along vertical duct based on scroll position
      // Map scroll progress (0 to 1) to brush Y (-3 to 5)
      const targetBrushY = -3.2 + scroll * 8.2;
      brushGroup.position.y = THREE.MathUtils.lerp(brushGroup.position.y, targetBrushY, 0.08);
      // Spin the brush as it cleans
      brushGroup.rotation.y += delta * Math.PI * 4 * bSpeed * (scroll > 0.05 ? 1 : 0.1);

      // 2. Pulse Scanner Joint Lights
      jointGlows.forEach((glow, idx) => {
        // Active pulse depends on filter status and time
        glow.material.opacity = 0.1 + Math.sin(elapsed * 5 + idx) * 0.4;
        glow.material.color.setHSL(0.06 + Math.sin(elapsed * 2) * 0.02, 1, 0.5); // Orange/Amber
      });

      // 3. Update smoke & soot air particles (Cleanliness depends on scroll progress)
      const posAttr = particleGeo.getAttribute('position');
      const colorAttr = particleGeo.getAttribute('color');
      
      const draftMult = 1.0 + (draft / 50) * 1.2;
      const cleanLevel = Math.min(scroll * 1.5, 1.0); // Reach 100% clean midway

      for (let i = 0; i < particleCount; i++) {
        // Rising air velocity
        positions[i * 3 + 1] += delta * speeds[i] * draftMult;

        // Reset if particles exit the top of chimney
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = -3.5;
          const radius = Math.random() * 0.6;
          const angle = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.sin(angle) * radius;
          positions[i * 3 + 2] = Math.cos(angle) * radius;
        }

        // Color Interpolation (Soot Dark Gray -> Clean glowing orange-teal air)
        // Let's blend from dark charcoal to clean air (Orange to Blue/Green representing clean ventilation)
        const isClean = positions[i * 3 + 1] > brushGroup.position.y; // Cleaned if above the brush line
        
        let r, g, b;
        if (isClean) {
          // Clean air (glowing orange-white theme matching fire safety)
          r = THREE.MathUtils.lerp(0.3, 1.0, cleanLevel);
          g = THREE.MathUtils.lerp(0.2, 0.5, cleanLevel);
          b = THREE.MathUtils.lerp(0.2, 0.1, cleanLevel);
        } else {
          // Sooty dirty smoke (dark charcoal gray)
          r = 0.15;
          g = 0.12;
          b = 0.12;
        }

        colorAttr.setXYZ(i, r, g, b);
        posAttr.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // 4. Slow scene rotate
      ductGroup.rotation.y = elapsed * 0.05;

      // 5. Scroll Camera Interpolation
      const targetCamPos = new THREE.Vector3();
      const targetLookAt = new THREE.Vector3(0, 0, 0);

      if (scroll < 0.3) {
        // Hero: View of the soot-filled entrance of the chimney
        const t = scroll / 0.3;
        targetCamPos.set(
          THREE.MathUtils.lerp(1.2, 2.5, t),
          THREE.MathUtils.lerp(-1.0, 0.0, t),
          THREE.MathUtils.lerp(4.5, 4.0, t)
        );
        targetLookAt.set(0, -2.0, 0);
      } else if (scroll < 0.65) {
        // About & Services: Close up following the brush sweeping soot
        const t = (scroll - 0.3) / 0.35;
        targetCamPos.set(
          THREE.MathUtils.lerp(2.5, -2.8, t),
          THREE.MathUtils.lerp(0.0, 1.2, t),
          THREE.MathUtils.lerp(4.0, 3.5, t)
        );
        targetLookAt.set(0, brushGroup.position.y, 0);
      } else {
        // Reports & Contact: Zoom out to see the clean venting lines in operation
        const t = (scroll - 0.65) / 0.35;
        targetCamPos.set(
          THREE.MathUtils.lerp(-2.8, 0.0, t),
          THREE.MathUtils.lerp(1.2, 4.8, t),
          THREE.MathUtils.lerp(3.5, 5.8, t)
        );
        targetLookAt.set(0, 1.0, 0);
      }

      camera.position.lerp(targetCamPos, 0.06);
      camera.lookAt(targetLookAt);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10" />;
}
