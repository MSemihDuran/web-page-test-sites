import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WeavingLoom3D({ 
  scrollProgress = 0, 
  rpm = 120, 
  warpColor = '#c5a059', 
  weftColor = '#f4d08b',
  pattern = 'plain' 
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({ scrollProgress, rpm, warpColor, weftColor, pattern });

  // Update state reference to keep values fresh in the animation loop
  useEffect(() => {
    stateRef.current = { scrollProgress, rpm, warpColor, weftColor, pattern };
  }, [scrollProgress, rpm, warpColor, weftColor, pattern]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous canvas elements to prevent duplicate layers in StrictMode
    containerRef.current.innerHTML = '';

    // --- 1. SETUP THREE.JS SCENE ---
    // Use window sizes as robust full-screen fallbacks to prevent 0px clientWidth/clientHeight on mount
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = null; 

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 5, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Oynatıcıyı şeffaf yap
    containerRef.current.appendChild(renderer.domElement);

    // --- 2. LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const goldLight = new THREE.DirectionalLight(0xc5a059, 3.0);
    goldLight.position.set(-5, 3, -2);
    scene.add(goldLight);

    // Moving point light for the shuttle glow
    const shuttleLight = new THREE.PointLight(0xf4d08b, 5, 8);
    scene.add(shuttleLight);

    // --- 3. CREATE LOOM COMPONENT MESHES ---
    const loomGroup = new THREE.Group();
    loomGroup.position.set(0, 0, 0);
    scene.add(loomGroup);

    // Rollers (Back Roller & Front Take-up Roller)
    const rollerGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 32);
    const rollerMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2 
    });

    const backRoller = new THREE.Mesh(rollerGeo, rollerMat);
    backRoller.rotation.z = Math.PI / 2;
    backRoller.position.set(0, 0.5, -6);
    loomGroup.add(backRoller);

    const frontRoller = new THREE.Mesh(rollerGeo, rollerMat);
    frontRoller.rotation.z = Math.PI / 2;
    frontRoller.position.set(0, -0.2, 3);
    loomGroup.add(frontRoller);

    // Heald Frames (Gücü Çerçeveleri) - 2 Frames for Plain weave
    const frameGeo = new THREE.BoxGeometry(5.6, 2.5, 0.1);
    const frameWire = new THREE.EdgesGeometry(frameGeo);
    
    const frameMatA = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    const frameMatB = new THREE.LineBasicMaterial({ color: 0xc5a059, linewidth: 2 });

    const healdFrameA = new THREE.LineSegments(frameWire, frameMatA);
    healdFrameA.position.set(0, 0.5, -3);
    loomGroup.add(healdFrameA);

    const healdFrameB = new THREE.LineSegments(frameWire, frameMatB);
    healdFrameB.position.set(0, 0.5, -2.5);
    loomGroup.add(healdFrameB);

    // Reed (Tarak)
    const reedGroup = new THREE.Group();
    reedGroup.position.set(0, 0.5, -1.2);
    
    const reedFrameGeo = new THREE.BoxGeometry(5.4, 0.15, 0.1);
    const reedFrameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    const reedTop = new THREE.Mesh(reedFrameGeo, reedFrameMat);
    reedTop.position.y = 0.8;
    const reedBottom = new THREE.Mesh(reedFrameGeo, reedFrameMat);
    reedBottom.position.y = -0.8;
    reedGroup.add(reedTop);
    reedGroup.add(reedBottom);

    // Tarak telleri (Dents)
    const dentGeo = new THREE.BoxGeometry(0.015, 1.6, 0.05);
    const dentMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const dentCount = 40;
    for (let i = 0; i < dentCount; i++) {
      const dent = new THREE.Mesh(dentGeo, dentMat);
      dent.position.x = -2.5 + (5 / (dentCount - 1)) * i;
      reedGroup.add(dent);
    }
    loomGroup.add(reedGroup);

    // Shuttle (Mekik)
    const shuttleGroup = new THREE.Group();
    
    // Body (cylinder)
    const shuttleBodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const shuttleMat = new THREE.MeshStandardMaterial({ 
      color: 0xc5a059, 
      metalness: 0.9, 
      roughness: 0.1 
    });
    const shuttleBody = new THREE.Mesh(shuttleBodyGeo, shuttleMat);
    shuttleBody.rotation.z = Math.PI / 2;
    shuttleGroup.add(shuttleBody);

    // Tip cones
    const shuttleTipGeo = new THREE.ConeGeometry(0.08, 0.15, 16);
    const shuttleTipL = new THREE.Mesh(shuttleTipGeo, shuttleMat);
    shuttleTipL.rotation.z = Math.PI / 2;
    shuttleTipL.position.x = -0.375;
    const shuttleTipR = new THREE.Mesh(shuttleTipGeo, shuttleMat);
    shuttleTipR.rotation.z = -Math.PI / 2;
    shuttleTipR.position.x = 0.375;
    shuttleGroup.add(shuttleTipL);
    shuttleGroup.add(shuttleTipR);

    shuttleGroup.position.set(0, 0.15, -1.0);
    loomGroup.add(shuttleGroup);

    // --- 4. WARP THREADS (ÇÖZGÜ İPLİKLERİ) ---
    const threadCount = 90;
    const threads = [];
    
    for (let i = 0; i < threadCount; i++) {
      const x = -2.7 + (5.4 / (threadCount - 1)) * i;
      const isEven = i % 2 === 0;

      const geometry = new THREE.BufferGeometry();
      const points = new Float32Array(5 * 3); // 5 points, x,y,z
      geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
      
      const colorHex = isEven ? warpColor : '#151c4a'; 
      const material = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(colorHex), 
        linewidth: 1.5 
      });
      const line = new THREE.Line(geometry, material);
      
      loomGroup.add(line);
      threads.push({
        line,
        x,
        isEven,
        pointsArray: points
      });
    }

    // --- 5. WOVEN FABRIC (KUMAŞ DÜZLEMİ) ---
    const fabricLength = 3.0; 
    
    const fabricGridGroup = new THREE.Group();
    loomGroup.add(fabricGridGroup);

    // Vertical warp representations in fabric
    for (let i = 0; i < threadCount; i++) {
      const x = -2.7 + (5.4 / (threadCount - 1)) * i;
      const isEven = i % 2 === 0;
      
      const geom = new THREE.BufferGeometry();
      const pts = new Float32Array([
        x, 0.15, 0,
        x, -0.05, 1.5,
        x, -0.2, 3
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      const mat = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(isEven ? warpColor : '#11163b'), 
        transparent: true,
        opacity: 0.7
      });
      const warpLine = new THREE.Line(geom, mat);
      warpLine.userData = { isEven }; // Store properties inside userData for robust lookup
      fabricGridGroup.add(warpLine);
    }

    // Horizontal weft lines in fabric (that slide forward)
    const weftLinesGroup = new THREE.Group();
    fabricGridGroup.add(weftLinesGroup);

    const fabricWeftCount = 30;
    const fabricWefts = [];
    for (let i = 0; i < fabricWeftCount; i++) {
      const geom = new THREE.BufferGeometry();
      const pts = new Float32Array([
        -2.7, 0.15, 0,
        2.7, 0.15, 0
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      const mat = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(weftColor),
        transparent: true,
        opacity: 0.6
      });
      const weftLine = new THREE.Line(geom, mat);
      weftLinesGroup.add(weftLine);
      fabricWefts.push({
        line: weftLine,
        initialZ: (fabricLength / fabricWeftCount) * i
      });
    }

    // Dynamic weft line currently being laid down by the shuttle
    const activeWeftGeom = new THREE.BufferGeometry();
    const activeWeftPts = new Float32Array(3 * 3); 
    activeWeftGeom.setAttribute('position', new THREE.BufferAttribute(activeWeftPts, 3));
    const activeWeftMat = new THREE.LineBasicMaterial({ 
      color: new THREE.Color(weftColor), 
      linewidth: 2.5
    });
    const activeWeftLine = new THREE.Line(activeWeftGeom, activeWeftMat);
    loomGroup.add(activeWeftLine);

    // --- 6. CAMERA KEYFRAMES FOR SCROLL STORYTELLING ---
    const camPosition = new THREE.Vector3();
    const camTarget = new THREE.Vector3();
    
    const keyframes = [
      { // 0. HERO: Wide isometric view
        pos: new THREE.Vector3(5.5, 4.0, 7.5),
        look: new THREE.Vector3(0, 0, -1.5)
      },
      { // 0.25. PRECISION: Close up on heald frames splitting threads
        pos: new THREE.Vector3(2.5, 1.8, -1.8),
        look: new THREE.Vector3(-0.5, 0.3, -2.8)
      },
      { // 0.5. SPEED: View looking down the shuttle path
        pos: new THREE.Vector3(-3.5, 0.8, -0.6),
        look: new THREE.Vector3(1.0, 0.15, -1.0)
      },
      { // 0.75. FABRIC / QUALITY: Focused on the finished fabric roll
        pos: new THREE.Vector3(-1.8, 2.0, 2.5),
        look: new THREE.Vector3(0.5, 0.0, 1.2)
      },
      { // 1.0. INTERACTIVE / DETAILS: Balanced overview, slightly from top
        pos: new THREE.Vector3(4.8, 3.2, 4.8),
        look: new THREE.Vector3(0, 0.2, 0)
      }
    ];

    function getInterpolatedCamera(progress) {
      const p = Math.max(0, Math.min(progress, 0.999)) * (keyframes.length - 1);
      const index = Math.floor(p);
      const fraction = p - index;

      const k1 = keyframes[index];
      const k2 = keyframes[index + 1];

      const pos = new THREE.Vector3().lerpVectors(k1.pos, k2.pos, fraction);
      const look = new THREE.Vector3().lerpVectors(k1.look, k2.look, fraction);

      return { pos, look };
    }

    // --- 7. MOUSE PARALLAX SETUP ---
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- 8. ANIMATION LOOP ---
    let lastTime = 0;
    let loomTime = 0; 
    let requestID;

    const animate = (timestamp) => {
      requestID = requestAnimationFrame(animate);

      if (!lastTime) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Extract fresh props from state reference
      const { scrollProgress, rpm, warpColor: cWarp, weftColor: cWeft, pattern: pType } = stateRef.current;

      // Update colors if they changed
      threads.forEach((t) => {
        const c = t.isEven ? cWarp : '#151c4a';
        t.line.material.color.set(c);
      });
      activeWeftLine.material.color.set(cWeft);
      
      fabricGridGroup.children.forEach((c) => {
        if (c !== weftLinesGroup && c.material && c.userData) {
          c.material.color.set(c.userData.isEven ? cWarp : '#11163b');
        }
      });
      
      weftLinesGroup.children.forEach((c) => {
        if (c.material) c.material.color.set(cWeft);
      });

      // Calculate Loom Cycle based on RPM
      const cyclesPerSecond = rpm / 60;
      loomTime += deltaTime * cyclesPerSecond;
      const cycle = loomTime % 2.0;

      let frameAHeight = 0;
      let frameBHeight = 0;

      const localCycle = cycle % 1.0; 
      
      let shedOpenFactor = 0;
      if (localCycle < 0.3) {
        shedOpenFactor = localCycle / 0.3; 
      } else if (localCycle < 0.7) {
        shedOpenFactor = 1.0; 
      } else if (localCycle < 0.9) {
        shedOpenFactor = 1.0 - (localCycle - 0.7) / 0.2; 
      } else {
        shedOpenFactor = 0; 
      }

      const isFirstPick = cycle < 1.0;
      const directionMultiplier = isFirstPick ? 1 : -1;
      
      frameAHeight = shedOpenFactor * 0.75 * directionMultiplier;
      frameBHeight = -frameAHeight;

      healdFrameA.position.y = 0.5 + frameAHeight;
      healdFrameB.position.y = 0.5 + frameBHeight;

      let reedZOffset = 0;
      if (localCycle >= 0.65 && localCycle <= 0.85) {
        const t = (localCycle - 0.65) / 0.2; 
        reedZOffset = Math.sin(t * Math.PI) * 1.1; 
      }
      reedGroup.position.z = -1.2 + reedZOffset;

      let shuttleX = -2.8;
      let shuttleActive = false;
      
      if (localCycle >= 0.25 && localCycle <= 0.65) {
        shuttleActive = true;
        const t = (localCycle - 0.25) / 0.4; 
        const startX = isFirstPick ? -2.8 : 2.8;
        const endX = isFirstPick ? 2.8 : -2.8;
        shuttleX = THREE.MathUtils.lerp(startX, endX, t);
      } else {
        shuttleX = isFirstPick ? -2.8 : 2.8;
      }
      shuttleGroup.position.x = shuttleX;
      shuttleGroup.position.y = 0.15 + (shuttleActive ? Math.abs(frameAHeight) * 0.15 : 0);
      shuttleGroup.position.z = -1.0;

      shuttleLight.position.copy(shuttleGroup.position);
      shuttleLight.intensity = shuttleActive ? 6.0 : 1.5;

      // Update warp threads
      threads.forEach((t) => {
        const pts = t.pointsArray;
        const x = t.x;
        
        pts[0] = x; pts[1] = 0.5; pts[2] = -6;

        let heightOffset = 0;
        if (pType === 'plain') {
          heightOffset = t.isEven ? frameAHeight : frameBHeight;
        } else if (pType === 'twill') {
          const groupIndex = Math.floor((t.x + 2.7) * 8) % 4;
          const shiftCycle = Math.floor(cycle * 4 + groupIndex) % 4;
          heightOffset = shiftCycle < 2 ? frameAHeight : frameBHeight;
        } else {
          const groupIndex = Math.floor((t.x + 2.7) * 10) % 5;
          const shiftCycle = Math.floor(cycle * 5 + groupIndex) % 5;
          heightOffset = shiftCycle === 0 ? frameAHeight : frameBHeight;
        }

        const zHeald = t.isEven ? -3.0 : -2.5;
        pts[3] = x; pts[4] = 0.5 + heightOffset; pts[5] = zHeald;
        pts[6] = x; pts[7] = 0.15 + heightOffset * 0.4; pts[8] = reedGroup.position.z;
        pts[9] = x; pts[10] = 0.15; pts[11] = 0;
        pts[12] = x; pts[13] = -0.2; pts[14] = 3;

        t.line.geometry.attributes.position.needsUpdate = true;
      });

      // Update active weft thread
      const activePts = activeWeftLine.geometry.attributes.position.array;
      if (shuttleActive) {
        const startX = isFirstPick ? -2.7 : 2.7;
        activePts[0] = startX; activePts[1] = 0.15; activePts[2] = -1.0;
        activePts[3] = shuttleGroup.position.x; activePts[4] = shuttleGroup.position.y; activePts[5] = shuttleGroup.position.z;
        activePts[6] = shuttleGroup.position.x; activePts[7] = shuttleGroup.position.y; activePts[8] = shuttleGroup.position.z;
      } else {
        const restX = isFirstPick ? -2.7 : 2.7;
        activePts[0] = restX; activePts[1] = 0.15; activePts[2] = -1.0;
        activePts[3] = restX; activePts[4] = 0.15; activePts[5] = -1.0;
        activePts[6] = restX; activePts[7] = 0.15; activePts[8] = -1.0;
      }
      activeWeftLine.geometry.attributes.position.needsUpdate = true;

      // Update woven fabric weft threads
      const fabricFeedSpeed = cyclesPerSecond * 0.18; 
      fabricWefts.forEach((w) => {
        w.initialZ += deltaTime * fabricFeedSpeed;
        if (w.initialZ > fabricLength) {
          w.initialZ = 0; 
        }

        const pts = w.line.geometry.attributes.position.array;
        const z = w.initialZ;
        const y = THREE.MathUtils.lerp(0.15, -0.2, z / fabricLength);
        
        pts[0] = -2.7; pts[1] = y; pts[2] = z;
        pts[3] = 2.7; pts[4] = y; pts[5] = z;
        w.line.geometry.attributes.position.needsUpdate = true;
      });

      // Camera transitions
      const { pos: targetPos, look: targetLook } = getInterpolatedCamera(scrollProgress);

      const parallaxX = mouseX * 2.0;
      const parallaxY = -mouseY * 1.5;
      
      const targetPosWithParallax = new THREE.Vector3(
        targetPos.x + parallaxX,
        targetPos.y + parallaxY,
        targetPos.z
      );

      camera.position.lerp(targetPosWithParallax, 0.05);
      camTarget.lerp(targetLook, 0.05);
      camera.lookAt(camTarget);

      loomGroup.rotation.y = THREE.MathUtils.lerp(0, 0.1, scrollProgress);

      renderer.render(scene, camera);
    };

    requestID = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestID);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      rollerGeo.dispose();
      rollerMat.dispose();
      frameGeo.dispose();
      frameWire.dispose();
      frameMatA.dispose();
      frameMatB.dispose();
      reedFrameGeo.dispose();
      reedFrameMat.dispose();
      dentGeo.dispose();
      dentMat.dispose();
      shuttleBodyGeo.dispose();
      shuttleTipGeo.dispose();
      shuttleMat.dispose();
      activeWeftGeom.dispose();
      activeWeftMat.dispose();
      
      threads.forEach((t) => {
        t.line.geometry.dispose();
        t.line.material.dispose();
      });
      fabricGridGroup.children.forEach((c) => {
        if (c !== weftLinesGroup && c.geometry) {
          c.geometry.dispose();
          c.material.dispose();
        }
      });
      weftLinesGroup.children.forEach((c) => {
        c.geometry.dispose();
        c.material.dispose();
      });
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 1 }}
    />
  );
}
