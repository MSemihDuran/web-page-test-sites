import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function StellarOrbit3D({
  scrollProgress = 0,
  orbitSpeed = 1,
  signalFreq = 5,
  stationsCount = 4
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({ scrollProgress, orbitSpeed, signalFreq, stationsCount });

  useEffect(() => {
    stateRef.current = { scrollProgress, orbitSpeed, signalFreq, stationsCount };
  }, [scrollProgress, orbitSpeed, signalFreq, stationsCount]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020205, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0b0f19, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(20, 10, 20);
    scene.add(sunLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 6, 12);
    cyanLight.position.set(-5, 2, -2);
    scene.add(cyanLight);

    // Earth Hologram Setup
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Solid inner core
    const coreGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x070c1b,
      roughness: 0.8,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const earthCore = new THREE.Mesh(coreGeo, coreMat);
    earthGroup.add(earthCore);

    // Outer wireframe mesh (hologram grid)
    const wireGeo = new THREE.SphereGeometry(2.05, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const earthWire = new THREE.Mesh(wireGeo, wireMat);
    earthGroup.add(earthWire);

    // Earth grid dots (aesthetic connection nodes)
    const dotsCount = 150;
    const dotGeo = new THREE.SphereGeometry(0.03, 6, 6);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const earthDots = [];

    for (let i = 0; i < dotsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.06;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      earthGroup.add(dot);
      earthDots.push(dot);
    }

    // 2. Orbital Tracks & Satellites
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbits = [
      { radiusX: 3.5, radiusZ: 3.5, tiltX: 0.3, tiltY: 0.2, color: 0x06b6d4 },
      { radiusX: 4.2, radiusZ: 4.2, tiltX: -0.4, tiltY: 0.5, color: 0xd946ef },
      { radiusX: 3.8, radiusZ: 3.8, tiltX: 0.8, tiltY: -0.3, color: 0x06b6d4 }
    ];

    const satellites = [];

    const satBodyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.18);
    const satWingGeo = new THREE.BoxGeometry(0.35, 0.01, 0.1);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1
    });
    const satWingMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x03566b,
      roughness: 0.1
    });

    orbits.forEach((orbit, index) => {
      // 1. Orbit Loop Line
      const curve = new THREE.EllipseCurve(
        0, 0,
        orbit.radiusX, orbit.radiusZ,
        0, 2 * Math.PI,
        false, 0
      );
      const points = curve.getPoints(64);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitLineMat = new THREE.LineBasicMaterial({
        color: orbit.color,
        transparent: true,
        opacity: 0.25
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitLineMat);
      
      // Apply inclinations
      orbitLine.rotation.x = orbit.tiltX;
      orbitLine.rotation.z = orbit.tiltY;
      orbitGroup.add(orbitLine);

      // 2. Satellite Mesh
      const sGroup = new THREE.Group();
      orbitGroup.add(sGroup);

      const body = new THREE.Mesh(satBodyGeo, satMat);
      sGroup.add(body);

      // Solar Wings
      const leftWing = new THREE.Mesh(satWingGeo, satWingMat);
      leftWing.position.x = -0.22;
      sGroup.add(leftWing);

      const rightWing = new THREE.Mesh(satWingGeo, satWingMat);
      rightWing.position.x = 0.22;
      sGroup.add(rightWing);

      satellites.push({
        group: sGroup,
        orbit,
        angle: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.05
      });
    });

    // 3. Ground Stations & Signals
    const stationCones = [];
    const stationLocations = [
      new THREE.Vector3(1.3, 1.3, 1.0),
      new THREE.Vector3(-1.2, 1.4, -0.8),
      new THREE.Vector3(0.5, -1.5, 1.2),
      new THREE.Vector3(-1.5, -1.0, -1.0),
      new THREE.Vector3(0.1, 1.8, -0.7),
      new THREE.Vector3(1.6, -0.6, -1.0)
    ];

    // Signal Connection Line Material
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.5
    });

    // Signal Lines list
    const laserLines = [];

    // 4. Starfield Background Particles
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 10 + Math.random() * 20;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { scrollProgress: scroll, orbitSpeed: oSpeed, signalFreq: sFreq, stationsCount: count } = stateRef.current;

      // 1. Rotate Earth Globe
      earthGroup.rotation.y = elapsed * 0.04;
      earthGroup.rotation.x = Math.sin(elapsed * 0.02) * 0.05;

      // 2. Animate Satellites in orbits
      satellites.forEach(sat => {
        sat.angle += delta * sat.speed * oSpeed;
        
        // Calculate coordinate in plane
        const localX = Math.cos(sat.angle) * sat.orbit.radiusX;
        const localZ = Math.sin(sat.angle) * sat.orbit.radiusZ;

        // Vector relative to orbit center
        const pos = new THREE.Vector3(localX, 0, localZ);

        // Apply same inclination matrices as orbit line
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.orbit.tiltX);
        pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.orbit.tiltY);

        sat.group.position.copy(pos);

        // Align satellite orientation (always look tangent to path and panels face earth)
        const nextAngle = sat.angle + 0.01;
        const nextPos = new THREE.Vector3(
          Math.cos(nextAngle) * sat.orbit.radiusX,
          0,
          Math.sin(nextAngle) * sat.orbit.radiusZ
        );
        nextPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.orbit.tiltX);
        nextPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.orbit.tiltY);
        
        sat.group.lookAt(new THREE.Vector3(0, 0, 0));
      });

      // 3. Clear old lasers
      laserLines.forEach(line => scene.remove(line));
      laserLines.length = 0;

      // 4. Generate dynamic signal laser beams from active ground stations to satellites
      const activeStations = stationLocations.slice(0, count);
      
      // Pulse animation logic
      const pulseActive = Math.sin(elapsed * sFreq * 2) > -0.2;
      laserMat.opacity = pulseActive ? 0.35 + Math.sin(elapsed * 15) * 0.15 : 0.02;

      if (pulseActive) {
        activeStations.forEach((stationWorldPos, idx) => {
          // Transform local station point on rotating Earth to world space
          const stationPos = stationWorldPos.clone().applyMatrix4(earthGroup.matrixWorld);

          // Find the nearest satellite
          let nearestSat = null;
          let minDist = 999;
          satellites.forEach(sat => {
            const dist = stationPos.distanceTo(sat.group.position);
            if (dist < minDist) {
              minDist = dist;
              nearestSat = sat;
            }
          });

          if (nearestSat) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([stationPos, nearestSat.group.position]);
            const laser = new THREE.Line(lineGeo, laserMat);
            scene.add(laser);
            laserLines.push(laser);
          }
        });
      }

      // 5. Scroll Camera Interpolation
      // Hero (scroll=0) -> About (scroll=0.3) -> Controls (scroll=0.6) -> Stats & Contact (scroll=1)
      const targetCamPos = new THREE.Vector3();
      const targetLookAt = new THREE.Vector3(0, 0, 0);

      if (scroll < 0.35) {
        // Hero: View extremely close to one satellite
        const t = scroll / 0.35;
        // Locate first satellite position roughly
        const satPos = satellites[0] ? satellites[0].group.position : new THREE.Vector3(3.5, 0, 0);
        
        targetCamPos.set(
          THREE.MathUtils.lerp(satPos.x + 0.6, 0.0, t),
          THREE.MathUtils.lerp(satPos.y + 0.3, 2.5, t),
          THREE.MathUtils.lerp(satPos.z + 1.2, 5.8, t)
        );
        targetLookAt.set(0, 0, 0);
      } else if (scroll < 0.7) {
        // About / Controls: Full overview orbiting Earth
        const t = (scroll - 0.35) / 0.35;
        targetCamPos.set(
          THREE.MathUtils.lerp(0.0, -4.5, t),
          THREE.MathUtils.lerp(2.5, 1.2, t),
          THREE.MathUtils.lerp(5.8, 5.0, t)
        );
        targetLookAt.set(0, 0, 0);
      } else {
        // Stats / Contact: Distant panoramic starfield view
        const t = (scroll - 0.7) / 0.3;
        targetCamPos.set(
          THREE.MathUtils.lerp(-4.5, 0, t),
          THREE.MathUtils.lerp(1.2, -6.5, t),
          THREE.MathUtils.lerp(5.0, 7.5, t)
        );
        targetLookAt.set(0, -1.0, 0);
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
