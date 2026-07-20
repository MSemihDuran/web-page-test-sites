import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BioSyncTower3D({
  scrollProgress = 0,
  lightSpectrum = 'full', // 'full' | 'redblue' | 'uv'
  nutrientFlow = 50,
  humidity = 60
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({ scrollProgress, lightSpectrum, nutrientFlow, humidity });

  useEffect(() => {
    stateRef.current = { scrollProgress, lightSpectrum, nutrientFlow, humidity };
  }, [scrollProgress, lightSpectrum, nutrientFlow, humidity]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x030704, 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1, 12);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x091a0f, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(5, 15, 5);
    scene.add(sunLight);

    // Spectrum glow light
    const spectrumLight = new THREE.PointLight(0x10b981, 8, 15);
    spectrumLight.position.set(0, 3, 0);
    scene.add(spectrumLight);

    // Materials
    const structureMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.2
    });
    const growTrayMat = new THREE.MeshStandardMaterial({
      color: 0x0f1a12,
      metalness: 0.5,
      roughness: 0.5
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Plant chlorophyll green
      roughness: 0.9,
      metalness: 0.1
    });
    const ledGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.8
    });

    // Floor Grid
    const floorHelper = new THREE.GridHelper(50, 50, 0x10b981, 0x091a0f);
    floorHelper.position.y = -3;
    floorHelper.material.opacity = 0.2;
    floorHelper.material.transparent = true;
    scene.add(floorHelper);

    // 1. Hydroponics Tower Core
    const towerGroup = new THREE.Group();
    towerGroup.position.y = -2;
    scene.add(towerGroup);

    // Central Column post
    const coreColumnGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 16);
    const coreColumn = new THREE.Mesh(coreColumnGeo, structureMat);
    coreColumn.position.y = 4;
    towerGroup.add(coreColumn);

    // Spiraling Helix wires (aesthetic biotech look)
    const helixPoints = [];
    const helixCount = 100;
    for (let i = 0; i <= helixCount; i++) {
      const angle = (i * Math.PI * 4) / helixCount * 4; // Multiple rotations
      const y = (i / helixCount) * 10;
      const x = Math.sin(angle) * 0.4;
      const z = Math.cos(angle) * 0.4;
      helixPoints.push(new THREE.Vector3(x, y, z));
    }
    const helixGeo1 = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const helixMat1 = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 });
    const helixLine1 = new THREE.Line(helixGeo1, helixMat1);
    towerGroup.add(helixLine1);

    const helixPoints2 = helixPoints.map(p => new THREE.Vector3(-p.x, p.y, -p.z));
    const helixGeo2 = new THREE.BufferGeometry().setFromPoints(helixPoints2);
    const helixLine2 = new THREE.Line(helixGeo2, helixMat1);
    towerGroup.add(helixLine2);

    // Trays, Grow Rings, and Plants on 4 levels
    const trays = [];
    const growLights = [];
    const plants = [];
    const levels = [1, 3.2, 5.4, 7.6];

    levels.forEach((lvlHeight) => {
      const levelGroup = new THREE.Group();
      levelGroup.position.y = lvlHeight;
      towerGroup.add(levelGroup);

      // Grow Tray
      const trayGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.15, 32);
      const tray = new THREE.Mesh(trayGeo, growTrayMat);
      levelGroup.add(tray);
      trays.push(tray);

      // LED Light Ring above the tray
      const lightRingGeo = new THREE.TorusGeometry(1.5, 0.04, 8, 32);
      const lightRing = new THREE.Mesh(lightRingGeo, ledGlowMat.clone());
      lightRing.rotation.x = Math.PI / 2;
      lightRing.position.y = 1.0;
      levelGroup.add(lightRing);
      growLights.push(lightRing);

      // Metal supports for the LED Ring
      const supportGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8);
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const support = new THREE.Mesh(supportGeo, structureMat);
        support.position.set(Math.sin(angle) * 1.5, 0.5, Math.cos(angle) * 1.5);
        levelGroup.add(support);
      }

      // Small 3D plants around the tray
      const numPlants = 8;
      for (let i = 0; i < numPlants; i++) {
        const plantAngle = (i * Math.PI * 2) / numPlants;
        const radius = 1.0 + Math.random() * 0.2;
        const pGroup = new THREE.Group();
        pGroup.position.set(Math.sin(plantAngle) * radius, 0.15, Math.cos(plantAngle) * radius);
        
        // Add random slight rotation
        pGroup.rotation.y = Math.random() * Math.PI;
        levelGroup.add(pGroup);

        // Plant stem / soil cup
        const cupGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.12, 8);
        const cup = new THREE.Mesh(cupGeo, structureMat);
        cup.position.y = -0.06;
        pGroup.add(cup);

        // Plant foliage (grouped spheres)
        const plantFoliage = new THREE.Group();
        pGroup.add(plantFoliage);

        const leafCount = 4 + Math.floor(Math.random() * 3);
        for (let j = 0; j < leafCount; j++) {
          const size = 0.08 + Math.random() * 0.08;
          const leafGeo = new THREE.SphereGeometry(size, 8, 8);
          // Scale it flat
          leafGeo.scale(1.5, 0.3, 1.0);
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(
            Math.sin((j * Math.PI * 2) / leafCount) * 0.1,
            size / 2,
            Math.cos((j * Math.PI * 2) / leafCount) * 0.1
          );
          leaf.rotation.x = 0.2 + Math.random() * 0.3;
          leaf.rotation.y = (j * Math.PI * 2) / leafCount;
          plantFoliage.add(leaf);
        }

        plants.push(plantFoliage);
      }
    });

    // 2. Floating Nutrient Mist Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.5 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.sin(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = Math.cos(angle) * radius;
      speeds[i] = 0.3 + Math.random() * 0.8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pTexture = new THREE.TextureLoader().load(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%2310b981" opacity="0.6"/></svg>',
      () => {}
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.18,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: pTexture
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    towerGroup.add(particles);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { scrollProgress: scroll, lightSpectrum: spectrum, nutrientFlow: flow, humidity: hum } = stateRef.current;

      // 1. Update Grow Lights color based on spectrum
      let glowColor = new THREE.Color(0xfef08a); // Warm default
      let lightColorHex = 0xfef08a;
      if (spectrum === 'redblue') {
        glowColor.setHex(0xff0055); // Grow Light Pink-Red
        lightColorHex = 0xff0055;
      } else if (spectrum === 'uv') {
        glowColor.setHex(0xa855f7); // Grow UV Purple
        lightColorHex = 0xa855f7;
      } else {
        glowColor.setHex(0x34d399); // Warm healthy emerald-tint
        lightColorHex = 0x34d399;
      }

      growLights.forEach(light => {
        light.material.color.copy(glowColor);
        // Pulse glow
        light.material.opacity = 0.5 + Math.sin(elapsed * 4) * 0.25;
      });
      spectrumLight.color.copy(glowColor);

      // 2. Animate Plants (scale moves gently mimicking growth & nutrient intake)
      const plantScale = 0.95 + Math.sin(elapsed * 2) * 0.05 * (flow / 50);
      plants.forEach(p => {
        p.scale.set(plantScale, plantScale, plantScale);
      });

      // 3. Update mist particles rising up
      const posAttr = particleGeo.getAttribute('position');
      const riseMult = 1.0 + (flow / 50) * 0.5; // Flow speeds up rise
      const disperseMult = hum / 60; // Humidity disperses mist wider
      
      for (let i = 0; i < particleCount; i++) {
        // Move Y up
        positions[i * 3 + 1] += delta * speeds[i] * riseMult;
        
        // Horizontal drift
        positions[i * 3] += Math.sin(elapsed + i) * 0.002 * disperseMult;
        positions[i * 3 + 2] += Math.cos(elapsed + i) * 0.002 * disperseMult;

        // Reset if particles go too high
        if (positions[i * 3 + 1] > 10) {
          positions[i * 3 + 1] = 0;
          const radius = 0.5 + Math.random() * 1.5;
          const angle = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.sin(angle) * radius;
          positions[i * 3 + 2] = Math.cos(angle) * radius;
        }

        posAttr.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      }
      posAttr.needsUpdate = true;

      // 4. Rotate tower slowly
      towerGroup.rotation.y = elapsed * 0.03;

      // 5. Scroll Camera Interpolation (Climbing up the grow tower)
      // Hero (scroll=0) -> About (scroll=0.3) -> Interactive Controls (scroll=0.6) -> Stats & Contact (scroll=1)
      const targetCamPos = new THREE.Vector3();
      const targetLookAt = new THREE.Vector3(0, 0, 0);

      if (scroll < 0.35) {
        // Hero: View of the lower level of the tower
        const t = scroll / 0.35;
        targetCamPos.set(
          THREE.MathUtils.lerp(0, 4.5, t),
          THREE.MathUtils.lerp(-0.5, 0.5, t),
          THREE.MathUtils.lerp(7, 5.5, t)
        );
        targetLookAt.set(0, -1, 0);
      } else if (scroll < 0.7) {
        // About & Controls: Climb to mid tower
        const t = (scroll - 0.35) / 0.35;
        targetCamPos.set(
          THREE.MathUtils.lerp(4.5, -4.5, t),
          THREE.MathUtils.lerp(0.5, 2.5, t),
          THREE.MathUtils.lerp(5.5, 5.0, t)
        );
        targetLookAt.set(0, 1.5, 0);
      } else {
        // Stats & Contact: Peak height looking down
        const t = (scroll - 0.7) / 0.3;
        targetCamPos.set(
          THREE.MathUtils.lerp(-4.5, 0.1, t),
          THREE.MathUtils.lerp(2.5, 6.8, t),
          THREE.MathUtils.lerp(5.0, 4.0, t)
        );
        targetLookAt.set(0, 3.5, 0);
      }

      camera.position.lerp(targetCamPos, 0.05);
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
