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
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = null; 

    // Atmospheric Industrial Fog (fades distant workshop elements into brand-bg)
    scene.fog = new THREE.FogExp2(0x04050d, 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 5, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); 
    containerRef.current.appendChild(renderer.domElement);

    // --- 2. LIGHTS & ATMOSPHERE ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight1.position.set(5, 12, 7);
    scene.add(dirLight1);

    const goldLight = new THREE.DirectionalLight(0xc5a059, 3.0);
    goldLight.position.set(-5, 3, -2);
    scene.add(goldLight);

    // Moving point light for the shuttle glow
    const shuttleLight = new THREE.PointLight(0xf4d08b, 6, 9);
    scene.add(shuttleLight);

    // Warm Industrial Amber Lights (attached to workshop pillars for mood)
    const factoryLight1 = new THREE.PointLight(0xffb74d, 4.0, 14);
    factoryLight1.position.set(-4.8, 3.5, -2);
    scene.add(factoryLight1);

    const factoryLight2 = new THREE.PointLight(0xffb74d, 4.0, 14);
    factoryLight2.position.set(4.8, 3.5, -2);
    scene.add(factoryLight2);

    // --- 3. INDUSTRIAL WORKSHOP BACKGROUND ELEMENTS ---
    
    // 3.1 Floor Grid
    const floorHelper = new THREE.GridHelper(40, 40, 0xc5a059, 0x1c235a);
    floorHelper.position.y = -0.5;
    floorHelper.material.opacity = 0.35;
    floorHelper.material.transparent = true;
    scene.add(floorHelper);

    // 3.2 Workshop Structural Columns & Crossbeams
    const pillarGeo = new THREE.BoxGeometry(0.3, 10, 0.3);
    const pillarMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a0e1a, 
      metalness: 0.9, 
      roughness: 0.3 
    });
    const beamGeo = new THREE.BoxGeometry(11, 0.2, 0.2);

    // Glowing vertical LED strip lines for columns
    const ledLineGeo = new THREE.BoxGeometry(0.02, 10, 0.02);
    const ledLineMat = new THREE.MeshBasicMaterial({ color: 0xc5a059 });

    for (let zVal = -10; zVal <= 6; zVal += 4) {
      // Left structural pillar
      const pillarL = new THREE.Mesh(pillarGeo, pillarMat);
      pillarL.position.set(-5, 4.5, zVal);
      scene.add(pillarL);

      // Left pillar glowing LED highlight
      const ledL = new THREE.Mesh(ledLineGeo, ledLineMat);
      ledL.position.set(-4.84, 4.5, zVal + 0.16);
      scene.add(ledL);
      
      // Right structural pillar
      const pillarR = new THREE.Mesh(pillarGeo, pillarMat);
      pillarR.position.set(5, 4.5, zVal);
      scene.add(pillarR);

      // Right pillar glowing LED highlight
      const ledR = new THREE.Mesh(ledLineGeo, ledLineMat);
      ledR.position.set(4.84, 4.5, zVal - 0.16);
      scene.add(ledR);

      // Overhead industrial crossbeam
      const beam = new THREE.Mesh(beamGeo, pillarMat);
      beam.position.set(0, 9.5, zVal);
      scene.add(beam);
    }

    // 3.3 Volumetric Light Beams (Ceiling spotlights shining down)
    const coneGeo = new THREE.ConeGeometry(2.2, 9, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffb74d,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const lightBeam1 = new THREE.Mesh(coneGeo, coneMat);
    lightBeam1.position.set(-4.8, 4.5, -2);
    lightBeam1.rotation.z = -0.12; 
    scene.add(lightBeam1);

    const lightBeam2 = new THREE.Mesh(coneGeo, coneMat);
    lightBeam2.position.set(4.8, 4.5, -2);
    lightBeam2.rotation.z = 0.12;
    scene.add(lightBeam2);

    // 3.4 Hanger Stand & Apparel Products under spotlights
    // Hanger materials
    const hangerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const hangerBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16);
    const hangerPostGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8);
    const hangerTopGeo = new THREE.BoxGeometry(0.55, 0.02, 0.06);

    // Apparel Group Left (Women's Coat - Kadın Kabanı)
    const leftApparelGroup = new THREE.Group();
    leftApparelGroup.position.set(-4.8, 0, -2); // Directly under left spotlight
    leftApparelGroup.rotation.y = -1.25; // Rotate to face towards the weaving loom in the center
    scene.add(leftApparelGroup);

    // Build Hanger Stand Left
    const baseL = new THREE.Mesh(hangerBaseGeo, hangerMat);
    baseL.position.y = -0.48;
    leftApparelGroup.add(baseL);
    const postL = new THREE.Mesh(hangerPostGeo, hangerMat);
    postL.position.y = 0.6;
    leftApparelGroup.add(postL);
    const topL = new THREE.Mesh(hangerTopGeo, hangerMat);
    topL.position.y = 1.7;
    leftApparelGroup.add(topL);

    // Model Women's Coat (Camel-colored long overcoat matching user request image)
    const coatMat = new THREE.MeshStandardMaterial({ color: 0xc19a6b, roughness: 0.85 }); // Camel Brown
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x8a6233, roughness: 0.85 }); // Darker brown tied belt
    
    // Torso (Long flared overcoat)
    const coatTorsoGeo = new THREE.CylinderGeometry(0.11, 0.28, 1.2, 16);
    const coatTorso = new THREE.Mesh(coatTorsoGeo, coatMat);
    coatTorso.position.y = 1.05;
    leftApparelGroup.add(coatTorso);

    // Collar flaps
    const collarFlapGeo = new THREE.BoxGeometry(0.08, 0.18, 0.02);
    const collarFlapL = new THREE.Mesh(collarFlapGeo, coatMat);
    collarFlapL.position.set(-0.06, 1.55, 0.06);
    collarFlapL.rotation.set(0.2, 0.2, 0.3);
    leftApparelGroup.add(collarFlapL);
    const collarFlapR = new THREE.Mesh(collarFlapGeo, coatMat);
    collarFlapR.position.set(0.06, 1.55, 0.06);
    collarFlapR.rotation.set(0.2, -0.2, -0.3);
    leftApparelGroup.add(collarFlapR);

    // Tied belt around waist
    const beltGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.06, 16);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 1.15;
    leftApparelGroup.add(belt);

    // Sleeves
    const coatSleeveGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.6, 8);
    const sleeveLL = new THREE.Mesh(coatSleeveGeo, coatMat);
    sleeveLL.position.set(-0.16, 1.2, 0);
    sleeveLL.rotation.z = 0.25;
    leftApparelGroup.add(sleeveLL);
    const sleeveLR = new THREE.Mesh(coatSleeveGeo, coatMat);
    sleeveLR.position.set(0.16, 1.2, 0);
    sleeveLR.rotation.z = -0.25;
    leftApparelGroup.add(sleeveLR);

    // Neck joint hook
    const collarSphereGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const collarSphere = new THREE.Mesh(collarSphereGeo, coatMat);
    collarSphere.position.set(0, 1.63, 0);
    leftApparelGroup.add(collarSphere);


    // Apparel Group Right (Men's Suit - Takım Elbise)
    const rightApparelGroup = new THREE.Group();
    rightApparelGroup.position.set(4.8, 0, -2); // Directly under right spotlight
    rightApparelGroup.rotation.y = 1.25; // Rotate to face towards the weaving loom in the center
    scene.add(rightApparelGroup);

    // Build Hanger Stand Right
    const baseR = new THREE.Mesh(hangerBaseGeo, hangerMat);
    baseR.position.y = -0.48;
    rightApparelGroup.add(baseR);
    const postR = new THREE.Mesh(hangerPostGeo, hangerMat);
    postR.position.y = 0.6;
    rightApparelGroup.add(postR);
    const topR = new THREE.Mesh(hangerTopGeo, hangerMat);
    topR.position.y = 1.7;
    rightApparelGroup.add(topR);

    // Model Men's Suit (Navy open jacket, white shirt, black tie matching user request image)
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x162541, roughness: 0.8 }); // Midnight Navy
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); // White shirt
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9 }); // Black tie

    // Main Jacket Torso Back
    const suitJacketGeo = new THREE.BoxGeometry(0.36, 0.7, 0.12);
    const suitJacket = new THREE.Mesh(suitJacketGeo, suitMat);
    suitJacket.position.y = 1.35;
    rightApparelGroup.add(suitJacket);

    // White Shirt Insert (exposed in the chest v-neck)
    const shirtGeo = new THREE.BoxGeometry(0.14, 0.35, 0.03);
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.set(0, 1.48, 0.05); 
    rightApparelGroup.add(shirt);

    // Black Tie Insert
    const tieGeo = new THREE.BoxGeometry(0.026, 0.3, 0.015);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.42, 0.068); 
    rightApparelGroup.add(tie);

    // Left & Right Jacket Lapels (creating open-front look)
    const lapelGeo = new THREE.BoxGeometry(0.08, 0.42, 0.03);
    const lapelL = new THREE.Mesh(lapelGeo, suitMat);
    lapelL.position.set(-0.09, 1.44, 0.06);
    lapelL.rotation.set(0.1, 0.25, 0.12);
    rightApparelGroup.add(lapelL);
    const lapelR = new THREE.Mesh(lapelGeo, suitMat);
    lapelR.position.set(0.09, 1.44, 0.06);
    lapelR.rotation.set(0.1, -0.25, -0.12);
    rightApparelGroup.add(lapelR);

    // Trousers (Navy legs hanging down)
    const suitLegGeo = new THREE.BoxGeometry(0.1, 0.8, 0.08);
    const legL = new THREE.Mesh(suitLegGeo, suitMat);
    legL.position.set(-0.06, 0.65, 0);
    rightApparelGroup.add(legL);
    const legR = new THREE.Mesh(suitLegGeo, suitMat);
    legR.position.set(0.06, 0.65, 0);
    rightApparelGroup.add(legR);

    // Sleeves
    const suitSleeveGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.62, 8);
    const sleeveRL = new THREE.Mesh(suitSleeveGeo, suitMat);
    sleeveRL.position.set(-0.2, 1.35, 0);
    sleeveRL.rotation.z = 0.12;
    rightApparelGroup.add(sleeveRL);
    const sleeveRR = new THREE.Mesh(suitSleeveGeo, suitMat);
    sleeveRR.position.set(0.2, 1.35, 0);
    sleeveRR.rotation.z = -0.12;
    rightApparelGroup.add(sleeveRR);


    // 3.5 Bobbin Creel (Çağlık) - Yarn rack behind the loom feeding the warp
    const creelGroup = new THREE.Group();
    creelGroup.position.set(0, 0.0, -9.5); 
    scene.add(creelGroup);

    const creelFrameMat = new THREE.MeshStandardMaterial({ 
      color: 0x11163b, 
      metalness: 0.7, 
      roughness: 0.3 
    });
    const vBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
    const hBarGeo = new THREE.CylinderGeometry(0.03, 0.03, 5.6, 8);

    // Build creel grid frames
    for (let xVal = -2.2; xVal <= 2.2; xVal += 2.2) {
      const bar = new THREE.Mesh(vBarGeo, creelFrameMat);
      bar.position.set(xVal, 1.25, 0);
      creelGroup.add(bar);
    }
    for (let yVal = 0.2; yVal <= 2.6; yVal += 0.8) {
      const bar = new THREE.Mesh(hBarGeo, creelFrameMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, yVal, 0);
      creelGroup.add(bar);
    }

    // Generate yarn bobbins on the creel (more numerous and colorful)
    const bobbinGeo = new THREE.CylinderGeometry(0.11, 0.17, 0.38, 12);
    const bobbinColors = [0xc5a059, 0x1b204a, 0x708090, 0xd4af37, 0x3b82f6];
    const bobbinsData = [];

    for (let xVal = -2.0; xVal <= 2.0; xVal += 0.6) {
      for (let yVal = 0.3; yVal <= 2.5; yVal += 0.5) {
        if ((Math.abs(xVal) + yVal) % 0.4 < 0.12) continue;

        const colIndex = Math.abs(Math.floor(xVal * yVal * 15)) % bobbinColors.length;
        const bMat = new THREE.MeshStandardMaterial({ 
          color: bobbinColors[colIndex], 
          roughness: 0.8 
        });
        const bobbin = new THREE.Mesh(bobbinGeo, bMat);
        bobbin.rotation.x = Math.PI / 2;
        bobbin.position.set(xVal, yVal, 0);
        creelGroup.add(bobbin);

        bobbinsData.push(new THREE.Vector3(xVal, yVal, -9.5));
      }
    }

    // 3.6 Creel Feed Threads (More prominent gold/navy threads, opacity 0.55)
    const creelThreadsGroup = new THREE.Group();
    scene.add(creelThreadsGroup);

    bobbinsData.forEach((bobbinPos) => {
      const rollerX = -2.7 + (5.4 * Math.random());
      const geom = new THREE.BufferGeometry();
      const pts = new Float32Array([
        bobbinPos.x, bobbinPos.y, bobbinPos.z,
        rollerX, 0.5, -6.0
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      
      const isGoldThread = Math.random() > 0.4;
      const mat = new THREE.LineBasicMaterial({ 
        color: isGoldThread ? 0xc5a059 : 0x1e293b, 
        transparent: true, 
        opacity: isGoldThread ? 0.55 : 0.35 
      });
      const line = new THREE.Line(geom, mat);
      creelThreadsGroup.add(line);
    });

    // 3.7 Silhouetted Auxiliary Looms
    const otherLoomMat = new THREE.MeshStandardMaterial({ 
      color: 0x05070d, 
      transparent: true, 
      opacity: 0.35,
      metalness: 0.6,
      roughness: 0.4
    });
    const otherLoomGeo = new THREE.BoxGeometry(4.5, 1.6, 3.2);

    const leftLoom = new THREE.Mesh(otherLoomGeo, otherLoomMat);
    leftLoom.position.set(-8.5, 0.3, -2.5);
    scene.add(leftLoom);

    const rightLoom = new THREE.Mesh(otherLoomGeo, otherLoomMat);
    rightLoom.position.set(8.5, 0.3, -2.5);
    scene.add(rightLoom);


    // --- 4. MAIN WEAVING LOOM ASSEMBLY (FOREGROUND) ---
    const loomGroup = new THREE.Group();
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

    // Heald Frames (Gücü Çerçeveleri)
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

    // --- 5. WARP THREADS (ÇÖZGÜ İPLİKLERİ) ---
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

    // --- 6. WOVEN FABRIC (KUMAŞ DÜZLEMİ) ---
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
      warpLine.userData = { isEven }; 
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

    // --- RESPONSIVE SCALING HANDLER ---
    const adjustScale = () => {
      const w = window.innerWidth;
      let scale = 1.0;
      if (w < 640) {
        scale = 0.45; // Mobile screen scale
      } else if (w < 1024) {
        scale = 0.70; // Tablet screen scale
      } else {
        scale = 1.0;  // PC scale
      }
      
      loomGroup.scale.set(scale, scale, scale);
      creelGroup.scale.set(scale, scale, scale);
      creelThreadsGroup.scale.set(scale, scale, scale);
      leftLoom.scale.set(scale, scale, scale);
      rightLoom.scale.set(scale, scale, scale);

      // Scale and position the apparel models dynamically to fit under shifted light cones
      leftApparelGroup.scale.set(scale, scale, scale);
      leftApparelGroup.position.set(-4.8 * scale, 0, -2 * scale);

      rightApparelGroup.scale.set(scale, scale, scale);
      rightApparelGroup.position.set(4.8 * scale, 0, -2 * scale);

      // Adjust volumetric cones
      lightBeam1.scale.set(scale, scale, scale);
      lightBeam1.position.set(-4.8 * scale, 4.5 * scale, -2 * scale);
      lightBeam2.scale.set(scale, scale, scale);
      lightBeam2.position.set(4.8 * scale, 4.5 * scale, -2 * scale);
    };

    adjustScale();

    // --- 7. CAMERA KEYFRAMES FOR SCROLL STORYTELLING ---
    const camPosition = new THREE.Vector3();
    const camTarget = new THREE.Vector3();
    
    const keyframes = [
      { // 0. HERO: Wide isometric view showing full workshop space
        pos: new THREE.Vector3(6.5, 4.8, 8.5),
        look: new THREE.Vector3(0, 0.4, -2.0)
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
      { // 1.0. INTERACTIVE / DETAILS: Balanced overview of the loom & hall
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

    // --- 8. MOUSE PARALLAX SETUP ---
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- 9. ANIMATION LOOP ---
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

      loomGroup.rotation.y = THREE.MathUtils.lerp(0, 0.12, scrollProgress);

      renderer.render(scene, camera);
    };

    requestID = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      
      adjustScale();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestID);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Cleanup WebGL resources
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
      
      // Background cleanups
      pillarGeo.dispose();
      pillarMat.dispose();
      beamGeo.dispose();
      vBarGeo.dispose();
      hBarGeo.dispose();
      creelFrameMat.dispose();
      bobbinGeo.dispose();
      otherLoomGeo.dispose();
      otherLoomMat.dispose();
      floorHelper.dispose();
      ledLineGeo.dispose();
      ledLineMat.dispose();
      coneGeo.dispose();
      coneMat.dispose();

      // Apparel cleanups
      hangerMat.dispose();
      hangerBaseGeo.dispose();
      hangerPostGeo.dispose();
      hangerTopGeo.dispose();
      coatMat.dispose();
      coatTorsoGeo.dispose();
      coatSleeveGeo.dispose();
      suitMat.dispose();
      suitJacketGeo.dispose();
      suitLegGeo.dispose();
      shirtMat.dispose();
      tieMat.dispose();
      beltMat.dispose();
      shirtGeo.dispose();
      tieGeo.dispose();
      lapelGeo.dispose();
      collarFlapGeo.dispose();
      beltGeo.dispose();
      collarSphereGeo.dispose();
      suitSleeveGeo.dispose();
      
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
      creelGroup.children.forEach((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      creelThreadsGroup.children.forEach((c) => {
        c.geometry.dispose();
        c.material.dispose();
      });
      leftApparelGroup.children.forEach((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      rightApparelGroup.children.forEach((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
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
