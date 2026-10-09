/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StarSystem, CelestialBody, MoonData } from '../types/space';
import {
  createSunTexture,
  createEarthCloudTexture,
  createRingTexture,
  createStarGlowTexture,
  getPlanetTexture,
} from '../utils/proceduralTextures';

interface CosmosCanvasProps {
  system: StarSystem;
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBody | 'star' | null) => void;
  isPlaying: boolean;
  simulationSpeed: number;
  showOrbits: boolean;
  showLabels: boolean;
  isFollowing: boolean;
  onResetCameraRequested?: () => void;
  focusTrigger: number; // Increment to re-trigger focus on selected body
}

interface Body3DReference {
  mesh: THREE.Mesh;
  pivot: THREE.Group;
  bodyData: CelestialBody;
  angle: number;
  cloudMesh?: THREE.Mesh;
  moons: { mesh: THREE.Mesh; pivot: THREE.Group; data: MoonData; angle: number }[];
  ringMesh?: THREE.Mesh;
  orbitLine?: THREE.Line;
}

export const CosmosCanvas: React.FC<CosmosCanvasProps> = ({
  system,
  selectedBodyId,
  onSelectBody,
  isPlaying,
  simulationSpeed,
  showOrbits,
  showLabels,
  isFollowing,
  focusTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Mesh registries
  const starMeshRef = useRef<THREE.Mesh | null>(null);
  const starGlowSpriteRef = useRef<THREE.Sprite | null>(null);
  const bodiesMapRef = useRef<Map<string, Body3DReference>>(new Map());
  const clickableMeshesRef = useRef<{ mesh: THREE.Mesh; id: string }[]>([]);

  // Selection visual target ring
  const selectionMarkerRef = useRef<THREE.Group | null>(null);

  // Camera choreography state
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraGoalPosRef = useRef<THREE.Vector3 | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // Mouse interaction state (Orbit controls)
  const isDraggingRef = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<THREE.Spherical>(new THREE.Spherical(130, Math.PI / 3, Math.PI / 4));
  const touchStartDistRef = useRef<number>(0);

  // Screen-space 2D label projections
  const [screenLabels, setScreenLabels] = useState<
    { id: string; name: string; x: number; y: number; isSelected: boolean }[]
  >([]);

  // Smoothly focus on a target point in 3D
  const focusOnPosition = useCallback((targetPos: THREE.Vector3, distance = 25) => {
    if (!cameraRef.current) return;
    cameraTargetRef.current.copy(targetPos);
    
    // Position camera at an angle relative to the target
    const offset = new THREE.Vector3(distance * 0.7, distance * 0.5, distance * 0.7);
    cameraGoalPosRef.current = targetPos.clone().add(offset);
    isTransitioningRef.current = true;
  }, []);

  // Reset camera to wide solar system overview
  const resetToOverview = useCallback(() => {
    cameraTargetRef.current.set(0, 0, 0);
    sphericalRef.current.set(135, Math.PI / 3.2, Math.PI / 4.5);
    if (cameraRef.current) {
      const newPos = new THREE.Vector3().setFromSpherical(sphericalRef.current);
      cameraGoalPosRef.current = newPos;
      isTransitioningRef.current = true;
    }
  }, []);

  // Trigger camera focus when selectedBodyId or focusTrigger changes
  useEffect(() => {
    if (!selectedBodyId) return;

    if (selectedBodyId === 'star') {
      focusOnPosition(new THREE.Vector3(0, 0, 0), system.star.size * 5 + 15);
      return;
    }

    const bodyRef = bodiesMapRef.current.get(selectedBodyId);
    if (bodyRef) {
      const worldPos = new THREE.Vector3();
      bodyRef.mesh.getWorldPosition(worldPos);
      focusOnPosition(worldPos, bodyRef.bodyData.size * 4 + 8);
    }
  }, [selectedBodyId, focusTrigger, focusOnPosition, system.star.size]);

  // Main Three.js Scene Setup & Re-creation on system change
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Dark space obsidian
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    cameraRef.current = camera;
    const initPos = new THREE.Vector3().setFromSpherical(sphericalRef.current);
    camera.position.copy(initPos);
    camera.lookAt(cameraTargetRef.current);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Starfield Background (Multi-layered particle sphere)
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const paletteColors = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#BAE6FD'),
      new THREE.Color('#FEF08A'),
      new THREE.Color('#FCA5A5'),
      new THREE.Color('#DDD6FE'),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 900 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Lighting
    // Ambient light allows night-side readability
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);

    // Central stellar point light
    const starLight = new THREE.PointLight(
      new THREE.Color(system.star.color),
      system.star.luminosity * 3.5,
      1200,
      0.6
    );
    starLight.position.set(0, 0, 0);
    scene.add(starLight);

    // Subtle fill light from top
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.15);
    dirLight.position.set(0, 50, 0);
    scene.add(dirLight);

    // Clickable objects collection
    const clickables: { mesh: THREE.Mesh; id: string }[] = [];

    // 6. Central Star
    const starGeom = new THREE.SphereGeometry(system.star.size, 48, 48);
    const starTexture = createSunTexture(system.star.color, system.star.emissiveColor);
    const starMat = new THREE.MeshBasicMaterial({
      map: starTexture,
      color: new THREE.Color(system.star.color),
    });
    const starMesh = new THREE.Mesh(starGeom, starMat);
    starMesh.position.set(0, 0, 0);
    scene.add(starMesh);
    starMeshRef.current = starMesh;
    clickables.push({ mesh: starMesh, id: 'star' });

    // Emissive Corona Glow Sprite
    const glowTex = createStarGlowTexture(system.star.color);
    const spriteMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: new THREE.Color(system.star.color),
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.75,
      depthWrite: false,
    });
    const starGlowSprite = new THREE.Sprite(spriteMat);
    const spriteScale = system.star.size * 3.8;
    starGlowSprite.scale.set(spriteScale, spriteScale, 1);
    scene.add(starGlowSprite);
    starGlowSpriteRef.current = starGlowSprite;

    // 7. Selection Ring Marker
    const markerGroup = new THREE.Group();
    const ringRadius = 2.0;
    const ringGeom = new THREE.RingGeometry(ringRadius, ringRadius + 0.15, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const markerMesh = new THREE.Mesh(ringGeom, ringMat);
    markerMesh.rotation.x = Math.PI / 2;
    markerGroup.add(markerMesh);
    markerGroup.visible = false;
    scene.add(markerGroup);
    selectionMarkerRef.current = markerGroup;

    // 8. Planets & Orbits
    const bodiesMap = new Map<string, Body3DReference>();

    system.planets.forEach((planet, index) => {
      // Planet orbit pivot
      const pivot = new THREE.Group();
      scene.add(pivot);

      // Planet Mesh
      const pGeom = new THREE.SphereGeometry(planet.size, 40, 40);
      const pTex = getPlanetTexture(planet);
      const pMat = new THREE.MeshStandardMaterial({
        map: pTex,
        roughness: planet.type === 'gas_giant' ? 0.7 : 0.85,
        metalness: 0.05,
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);

      // Stagger initial orbital angles so planets don't start in a straight line
      const initialAngle = (index * (Math.PI * 2)) / system.planets.length + 0.2;
      pMesh.position.set(
        Math.cos(initialAngle) * planet.distance,
        0,
        Math.sin(initialAngle) * planet.distance
      );
      pivot.add(pMesh);
      clickables.push({ mesh: pMesh, id: planet.id });

      let cloudMesh: THREE.Mesh | undefined;
      // Earth Cloud Swirl Layer
      if (planet.id === 'earth') {
        const cloudGeom = new THREE.SphereGeometry(planet.size * 1.02, 32, 32);
        const cloudTex = createEarthCloudTexture();
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.55,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
        pMesh.add(cloudMesh);
      }

      // Rings (e.g. Saturn or ringed custom planets)
      let ringMesh: THREE.Mesh | undefined;
      if (planet.hasRings && planet.ringInnerRadius && planet.ringOuterRadius) {
        const ringGeom = new THREE.RingGeometry(
          planet.ringInnerRadius,
          planet.ringOuterRadius,
          64
        );
        const ringTex = createRingTexture(planet.ringColor || planet.color);
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
          roughness: 0.5,
        });
        ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.35; // Majestic axial ring tilt
        ringMesh.rotation.y = 0.15;
        pMesh.add(ringMesh);
      }

      // Moons
      const moonRefs: { mesh: THREE.Mesh; pivot: THREE.Group; data: MoonData; angle: number }[] = [];
      if (planet.moons && planet.moons.length > 0) {
        planet.moons.forEach((moon, mIdx) => {
          const mPivot = new THREE.Group();
          pMesh.add(mPivot);

          const mGeom = new THREE.SphereGeometry(moon.size, 20, 20);
          const mMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(moon.color),
            roughness: 0.9,
          });
          const mMesh = new THREE.Mesh(mGeom, mMat);
          const mAngle = (mIdx * Math.PI) / 2;
          mMesh.position.set(Math.cos(mAngle) * moon.distance, 0, Math.sin(mAngle) * moon.distance);
          mPivot.add(mMesh);

          moonRefs.push({
            mesh: mMesh,
            pivot: mPivot,
            data: moon,
            angle: mAngle,
          });
        });
      }

      // Orbit Guideline Circle
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 128;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        orbitPoints.push(
          new THREE.Vector3(Math.cos(theta) * planet.distance, 0, Math.sin(theta) * planet.distance)
        );
      }
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.35,
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      scene.add(orbitLine);

      bodiesMap.set(planet.id, {
        mesh: pMesh,
        pivot,
        bodyData: planet,
        angle: initialAngle,
        cloudMesh,
        moons: moonRefs,
        ringMesh,
        orbitLine,
      });
    });

    bodiesMapRef.current = bodiesMap;
    clickableMeshesRef.current = clickables;

    // 9. Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. WebGL context lost & restored handlers
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost, pausing animation');
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
    const handleContextRestored = () => {
      console.info('WebGL context restored, re-initializing scene');
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Initial overview
    resetToOverview();

    // 11. Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }

      // Dispose all Three resources
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [system, resetToOverview]);

  // Synchronize orbit line visibility with prop
  useEffect(() => {
    bodiesMapRef.current.forEach((ref) => {
      if (ref.orbitLine) {
        ref.orbitLine.visible = showOrbits;
      }
    });
  }, [showOrbits]);

  // Render loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return;

      // 1. Central star self-rotation and pulse
      if (starMeshRef.current) {
        starMeshRef.current.rotation.y += 0.003;
      }
      if (starGlowSpriteRef.current) {
        const pulse = 1.0 + Math.sin(currentTime * 0.002) * 0.05;
        const baseScale = system.star.size * 3.8;
        starGlowSpriteRef.current.scale.set(baseScale * pulse, baseScale * pulse, 1);
      }

      // 2. Planets & Moons orbital progression
      const deltaSim = isPlaying ? delta * simulationSpeed * 0.5 : 0;

      bodiesMapRef.current.forEach((ref) => {
        if (deltaSim > 0) {
          ref.angle += ref.bodyData.speed * deltaSim * 0.2;
          ref.mesh.position.x = Math.cos(ref.angle) * ref.bodyData.distance;
          ref.mesh.position.z = Math.sin(ref.angle) * ref.bodyData.distance;

          // Self-rotation
          ref.mesh.rotation.y += (ref.bodyData.rotationSpeed || 0.01) * deltaSim * 5;
        }

        // Earth clouds subtle spin
        if (ref.cloudMesh) {
          ref.cloudMesh.rotation.y += 0.0015;
        }

        // Moons revolution
        if (ref.moons.length > 0 && deltaSim > 0) {
          ref.moons.forEach((m) => {
            m.angle += m.data.speed * deltaSim * 0.6;
            m.mesh.position.x = Math.cos(m.angle) * m.data.distance;
            m.mesh.position.z = Math.sin(m.angle) * m.data.distance;
          });
        }
      });

      // 3. Selection marker positioning
      if (selectionMarkerRef.current) {
        if (selectedBodyId === 'star') {
          selectionMarkerRef.current.position.set(0, 0, 0);
          const markerScale = (system.star.size * 1.3) / 2.0;
          selectionMarkerRef.current.scale.set(markerScale, markerScale, markerScale);
          selectionMarkerRef.current.visible = true;
          selectionMarkerRef.current.rotation.z += 0.01;
        } else if (selectedBodyId && bodiesMapRef.current.has(selectedBodyId)) {
          const bodyRef = bodiesMapRef.current.get(selectedBodyId)!;
          const worldPos = new THREE.Vector3();
          bodyRef.mesh.getWorldPosition(worldPos);
          selectionMarkerRef.current.position.copy(worldPos);
          const markerScale = (bodyRef.bodyData.size * 1.45) / 2.0;
          selectionMarkerRef.current.scale.set(markerScale, markerScale, markerScale);
          selectionMarkerRef.current.visible = true;
          selectionMarkerRef.current.rotation.z += 0.015;
        } else {
          selectionMarkerRef.current.visible = false;
        }
      }

      // 4. Follow mode: smoothly glue camera target to moving planet
      if (isFollowing && selectedBodyId && selectedBodyId !== 'star') {
        const bodyRef = bodiesMapRef.current.get(selectedBodyId);
        if (bodyRef) {
          const planetPos = new THREE.Vector3();
          bodyRef.mesh.getWorldPosition(planetPos);

          // Update target to planet position
          const diff = planetPos.clone().sub(cameraTargetRef.current);
          cameraTargetRef.current.copy(planetPos);
          camera.position.add(diff);
        }
      }

      // 5. Camera smooth transition interpolation
      if (isTransitioningRef.current && cameraGoalPosRef.current) {
        camera.position.lerp(cameraGoalPosRef.current, 0.08);
        camera.lookAt(cameraTargetRef.current);

        if (camera.position.distanceTo(cameraGoalPosRef.current) < 0.2) {
          isTransitioningRef.current = false;
          // Re-calculate spherical coordinates so Orbit controls remain seamless
          const relPos = camera.position.clone().sub(cameraTargetRef.current);
          sphericalRef.current.setFromVector3(relPos);
        }
      } else if (!isTransitioningRef.current) {
        // Normal OrbitControls stance
        const camPos = new THREE.Vector3()
          .setFromSpherical(sphericalRef.current)
          .add(cameraTargetRef.current);
        camera.position.copy(camPos);
        camera.lookAt(cameraTargetRef.current);
      }

      // 6. Project 2D Labels in screen coordinates if showLabels is active
      if (showLabels && containerRef.current) {
        const widthHalf = containerRef.current.clientWidth / 2;
        const heightHalf = containerRef.current.clientHeight / 2;
        const labels: { id: string; name: string; x: number; y: number; isSelected: boolean }[] = [];

        // Star label
        const starVec = new THREE.Vector3(0, system.star.size + 1.2, 0);
        starVec.project(camera);
        if (starVec.z < 1) {
          labels.push({
            id: 'star',
            name: system.star.name,
            x: starVec.x * widthHalf + widthHalf,
            y: -(starVec.y * heightHalf) + heightHalf,
            isSelected: selectedBodyId === 'star',
          });
        }

        // Planet labels
        bodiesMapRef.current.forEach((ref) => {
          const vec = new THREE.Vector3();
          ref.mesh.getWorldPosition(vec);
          vec.y += ref.bodyData.size + 1.2;
          vec.project(camera);
          if (vec.z < 1) {
            labels.push({
              id: ref.bodyData.id,
              name: ref.bodyData.name,
              x: vec.x * widthHalf + widthHalf,
              y: -(vec.y * heightHalf) + heightHalf,
              isSelected: selectedBodyId === ref.bodyData.id,
            });
          }
        });

        setScreenLabels(labels);
      } else if (!showLabels && screenLabels.length > 0) {
        setScreenLabels([]);
      }

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [
    isPlaying,
    simulationSpeed,
    selectedBodyId,
    isFollowing,
    showLabels,
    system.star.name,
    system.star.size,
  ]);

  // Pointer event handlers for interactive 3D rotation, zooming, panning, and selection
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isTransitioningRef.current = false;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (e.button === 0) {
      isDraggingRef.current = true;
    } else if (e.button === 2) {
      isPanningRef.current = true;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      // Rotate camera around target
      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, sphericalRef.current.phi - deltaY * 0.007)
      );
    } else if (isPanningRef.current && cameraRef.current) {
      // Pan camera target
      const cam = cameraRef.current;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      const panFactor = sphericalRef.current.radius * 0.0015;

      cameraTargetRef.current.addScaledVector(right, -deltaX * panFactor);
      cameraTargetRef.current.addScaledVector(up, deltaY * panFactor);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isTransitioningRef.current = false;
    const zoomFactor = 1.0 + Math.sign(e.deltaY) * 0.08;
    sphericalRef.current.radius = Math.max(
      6,
      Math.min(450, sphericalRef.current.radius * zoomFactor)
    );
  };

  // Click Raycasting for Planet Selection
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !cameraRef.current || !sceneRef.current) return;

    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = clickableMeshesRef.current.map((item) => item.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const hitRecord = clickableMeshesRef.current.find((item) => item.mesh === hitMesh);

      if (hitRecord) {
        if (hitRecord.id === 'star') {
          onSelectBody('star');
        } else {
          const bodyRef = bodiesMapRef.current.get(hitRecord.id);
          if (bodyRef) {
            onSelectBody(bodyRef.bodyData);
          }
        }
      }
    }
  };

  // Touch pinch zoom handling for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const diff = dist - touchStartDistRef.current;
      touchStartDistRef.current = dist;

      isTransitioningRef.current = false;
      const zoomFactor = 1.0 - diff * 0.005;
      sphericalRef.current.radius = Math.max(
        6,
        Math.min(450, sphericalRef.current.radius * zoomFactor)
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-slate-950"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {/* Floating 2D Screen-Projected Name Labels */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {screenLabels.map((label) => (
            <div
              key={label.id}
              style={{
                transform: `translate3d(${label.x}px, ${label.y}px, 0) translate(-50%, -100%)`,
              }}
              className={`absolute px-2 py-0.5 rounded text-xs tracking-wide transition-opacity duration-150 ${
                label.isSelected
                  ? 'bg-sky-500/90 text-white font-semibold shadow-lg shadow-sky-500/30'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 font-medium'
              }`}
            >
              {label.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
