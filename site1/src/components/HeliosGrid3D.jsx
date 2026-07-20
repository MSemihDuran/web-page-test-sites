import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeliosGrid3D({
  scrollProgress = 0,
  rpm = 60,
  solarAngle = 45,
  gridLoad = 50
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({ scrollProgress, rpm, solarAngle, gridLoad });

  // Update refs on changes
  useEffect(() => {
    stateRef.current = { scrollProgress, rpm, solarAngle, gridLoad };
  }, [scrollProgress, rpm, solarAngle, gridLoad]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x070913, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 22);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Solar Glow light
    const solarLight = new THREE.DirectionalLight(0x00f5d4, 3.0);
    solarLight.position.set(-10, 5, -10);
    scene.add(solarLight);

    // Turbine flashing safety red lights
    const beaconLights = [];
    const beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const beaconGeo = new THREE.SphereGeometry(0.06, 8, 8);

    // Materials
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Solar Blue
      metalness: 0.9,
      roughness: 0.1
    });
    const gridWireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    // Floor Grid
    const floorHelper = new THREE.GridHelper(60, 60, 0x00f5d4, 0x0f172a);
    floorHelper.position.y = -2;
    floorHelper.material.opacity = 0.25;
    floorHelper.material.transparent = true;
    scene.add(floorHelper);

    // 1. Central Power Station
    const stationGroup = new THREE.Group();
    stationGroup.position.set(0, -1, 0);
    scene.add(stationGroup);

    const stationBaseGeo = new THREE.BoxGeometry(2.5, 2, 2.5);
    const stationBase = new THREE.Mesh(stationBaseGeo, steelMat);
    stationGroup.add(stationBase);

    // Glowing core inside station
    const coreGeo = new THREE.BoxGeometry(2.6, 0.4, 2.6);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.6
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.2;
    stationGroup.add(coreMesh);

    // 2. Wind Turbines
    const turbines = [];
    const turbinePositions = [
      { x: -8, z: -5, height: 6 },
      { x: 8, z: -8, height: 7 },
      { x: -5, z: -12, height: 6.5 }
    ];

    turbinePositions.forEach((pos, idx) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(pos.x, -2, pos.z);
      scene.add(turbineGroup);

      // Tower
      const towerGeo = new THREE.CylinderGeometry(0.12, 0.25, pos.height, 16);
      const tower = new THREE.Mesh(towerGeo, steelMat);
      tower.position.y = pos.height / 2;
      turbineGroup.add(tower);

      // Nacelle (Engine Box at top)
      const nacelleGeo = new THREE.BoxGeometry(0.3, 0.3, 0.6);
      const nacelle = new THREE.Mesh(nacelleGeo, steelMat);
      nacelle.position.set(0, pos.height, 0);
      turbineGroup.add(nacelle);

      // Rotor Hub
      const rotorGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
      const rotor = new THREE.Mesh(rotorGeo, steelMat);
      rotor.rotation.x = Math.PI / 2;
      rotor.position.set(0, pos.height, 0.35);
      turbineGroup.add(rotor);

      // Blades Group
      const bladesGroup = new THREE.Group();
      bladesGroup.position.set(0, pos.height, 0.45);
      turbineGroup.add(bladesGroup);

      const bladeGeo = new THREE.BoxGeometry(0.1, pos.height * 0.4, 0.02);
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(bladeGeo, steelMat);
        blade.position.y = (pos.height * 0.4) / 2;
        
        const pivot = new THREE.Group();
        pivot.rotation.z = (i * Math.PI * 2) / 3;
        pivot.add(blade);
        bladesGroup.add(pivot);
      }

      // Flashing warning red LED at the top
      const beacon = new THREE.Mesh(beaconGeo, beaconMaterial);
      beacon.position.set(0, pos.height + 0.2, 0);
      turbineGroup.add(beacon);
      beaconLights.push(beacon);

      turbines.push({ bladesGroup, pos });
    });

    // 3. Solar Panels Array
    const solarPanels = [];
    const panelPositions = [
      { x: -4, z: 2 },
      { x: -2, z: 4 },
      { x: -4, z: 6 },
      { x: 4, z: 2 },
      { x: 2, z: 4 },
      { x: 4, z: 6 }
    ];

    panelPositions.forEach((pos) => {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(pos.x, -2, pos.z);
      scene.add(panelGroup);

      // Stand
      const standGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const stand = new THREE.Mesh(standGeo, steelMat);
      stand.position.y = 0.3;
      panelGroup.add(stand);

      // Rotating head
      const head = new THREE.Group();
      head.position.y = 0.6;
      panelGroup.add(head);

      const faceGeo = new THREE.BoxGeometry(1.2, 0.05, 0.8);
      const face = new THREE.Mesh(faceGeo, panelMat);
      // Grid lines on panels
      const wire = new THREE.Mesh(faceGeo, gridWireframeMat);
      wire.scale.set(1.02, 1.02, 1.02);
      head.add(face);
      head.add(wire);

      solarPanels.push(head);
    });

    // 4. Energy Flow Particle System
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const progressArray = new Float32Array(particleCount);
    const speedArray = new Float32Array(particleCount);
    const sourceArray = []; // List of coordinate sources

    // Define sources: turbine tips & solar panel centers
    const sources = [];
    turbinePositions.forEach(p => {
      sources.push(new THREE.Vector3(p.x, p.height - 2, p.z));
    });
    panelPositions.forEach(p => {
      sources.push(new THREE.Vector3(p.x, -1.4, p.z));
    });

    const targetPos = new THREE.Vector3(0, -1, 0); // Power station core

    for (let i = 0; i < particleCount; i++) {
      const src = sources[Math.floor(Math.random() * sources.length)];
      sourceArray.push(src);

      // Initialize randomly along path
      const pct = Math.random();
      progressArray[i] = pct;
      speedArray[i] = 0.005 + Math.random() * 0.01;

      const currentPos = new THREE.Vector3().copy(src).lerp(targetPos, pct);
      positions[i * 3] = currentPos.x;
      positions[i * 3 + 1] = currentPos.y;
      positions[i * 3 + 2] = currentPos.z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pTexture = new THREE.TextureLoader().load(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%2300f5d4" opacity="0.9"/></svg>',
      () => {}
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.28,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: pTexture
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Volumetric glow cones representing power grids in the background
    const coneGeo = new THREE.ConeGeometry(5, 15, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const glowBeam = new THREE.Mesh(coneGeo, coneMat);
    glowBeam.position.set(0, 6, 0);
    scene.add(glowBeam);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { scrollProgress: scroll, rpm: currentRpm, solarAngle: currentAngle, gridLoad: currentLoad } = stateRef.current;

      // 1. Rotate Wind Turbines
      const speedMult = currentRpm / 60; // 60 RPM base
      turbines.forEach(t => {
        t.bladesGroup.rotation.z += delta * Math.PI * 2 * speedMult;
      });

      // Flashing Beacons
      const flash = Math.sin(elapsed * 5) > 0;
      beaconLights.forEach(b => {
        b.material.color.setHex(flash ? 0xff0000 : 0x220000);
      });

      // 2. Solar Panel Tilt
      // Map 0-90 degrees to pitch rotation (tilt towards light source)
      const radAngle = (currentAngle * Math.PI) / 180;
      solarPanels.forEach(p => {
        p.rotation.x = -radAngle + Math.PI / 4; // Add slight offset offset
      });

      // 3. Station Core Glow Speed
      coreMesh.material.opacity = 0.3 + Math.sin(elapsed * (2 + currentLoad / 20)) * 0.25;
      glowBeam.material.opacity = 0.02 + Math.sin(elapsed * 2) * 0.015;

      // 4. Update Flow Particles
      const posAttr = particleGeo.getAttribute('position');
      const flowMult = 0.5 + currentLoad / 50; // Load speeds up energy flow
      for (let i = 0; i < particleCount; i++) {
        progressArray[i] += speedArray[i] * flowMult;
        if (progressArray[i] > 1.0) {
          progressArray[i] = 0;
          // Randomize source again
          sourceArray[i] = sources[Math.floor(Math.random() * sources.length)];
        }

        const currentPos = new THREE.Vector3().copy(sourceArray[i]).lerp(targetPos, progressArray[i]);
        // Add random jitter to simulate wild energy lines
        currentPos.x += Math.sin(elapsed * 10 + i) * 0.03;
        currentPos.z += Math.cos(elapsed * 10 + i) * 0.03;

        posAttr.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
      }
      posAttr.needsUpdate = true;

      // 5. Scroll Camera Interpolation
      // Hero (scroll=0) -> About (scroll=0.3) -> Interactive (scroll=0.6) -> Contact (scroll=1)
      const targetCamPos = new THREE.Vector3();
      const targetLookAt = new THREE.Vector3(0, 0, 0);

      if (scroll < 0.3) {
        // Hero: Dynamic cinematic overview
        const t = scroll / 0.3;
        targetCamPos.set(
          THREE.MathUtils.lerp(8, 4, t),
          THREE.MathUtils.lerp(7, 4, t),
          THREE.MathUtils.lerp(18, 12, t)
        );
        targetLookAt.set(0, 1, 0);
      } else if (scroll < 0.6) {
        // About Section: Focus on wind turbines
        const t = (scroll - 0.3) / 0.3;
        targetCamPos.set(
          THREE.MathUtils.lerp(4, -8, t),
          THREE.MathUtils.lerp(4, 5, t),
          THREE.MathUtils.lerp(12, 4, t)
        );
        targetLookAt.set(-8, 3, -5); // Look at turbine 1
      } else if (scroll < 0.8) {
        // Interactive Panel Section: Close-up on Solar Arrays
        const t = (scroll - 0.6) / 0.2;
        targetCamPos.set(
          THREE.MathUtils.lerp(-8, 3, t),
          THREE.MathUtils.lerp(5, 1, t),
          THREE.MathUtils.lerp(4, 6, t)
        );
        targetLookAt.set(3, -1.5, 3); // Look at solar panel group
      } else {
        // Contact / Stats: Deep panoramic view looking up
        const t = (scroll - 0.8) / 0.2;
        targetCamPos.set(
          THREE.MathUtils.lerp(3, 0, t),
          THREE.MathUtils.lerp(1, 12, t),
          THREE.MathUtils.lerp(6, 2, t)
        );
        targetLookAt.set(0, -2, 0);
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCamPos, 0.05);
      
      // Calculate lookAt smoothly
      const currentLookAt = new THREE.Vector3(0, 0, 0);
      currentLookAt.copy(camera.position).add(new THREE.Vector3(0, 0, -1)); // default orientation
      
      // We will look at target lookAt point
      camera.lookAt(targetLookAt);

      // Rotate scene slowly over time for orbit effect
      scene.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
