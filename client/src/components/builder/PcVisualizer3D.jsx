import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  RotateCcw, Sparkles, Eye, ZoomIn, ZoomOut,
  Maximize2, Play, Pause, Layers
} from 'lucide-react';

export default function PcVisualizer3D() {
  const { t } = useTranslation();
  const {
    builderConfig,
    visualizerSettings,
    setVisualizerSettings,
    setPickerModalSlot
  } = useShop();

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const partsGroupRef = useRef(new THREE.Group());
  const rgbLightRef = useRef(null);
  const rgbLight2Ref = useRef(null);

  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [explodedView, setExplodedView] = useState(false);

  const { rgbEnabled, rgbColor } = visualizerSettings;

  const rgbMap = {
    cyan: 0x06b6d4,
    purple: 0xa855f7,
    green: 0x10b981,
    pink: 0xec4899,
    white: 0xffffff,
    rainbow: 0x38bdf8
  };

  const activeColorHex = rgbMap[rgbColor] || 0x06b6d4;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0e17);

    // Subtle atmospheric fog
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(4.5, 3.2, 5.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.minDistance = 2.0;
    controls.maxDistance = 12.0;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(6, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-6, -2, -5);
    scene.add(fillLight);

    // ARGB Internal Case Lights
    const rgbLight1 = new THREE.PointLight(activeColorHex, rgbEnabled ? 4.5 : 0, 6);
    rgbLight1.position.set(0, 1.2, 0.4);
    scene.add(rgbLight1);
    rgbLightRef.current = rgbLight1;

    const rgbLight2 = new THREE.PointLight(activeColorHex, rgbEnabled ? 3.0 : 0, 5);
    rgbLight2.position.set(0, -0.6, 0.2);
    scene.add(rgbLight2);
    rgbLight2Ref.current = rgbLight2;

    // Reflective Metallic Pedestal / Ground
    const grid = new THREE.GridHelper(14, 28, 0x1e293b, 0x0f172a);
    grid.position.y = -1.6;
    scene.add(grid);

    // Parts Group
    const partsGroup = partsGroupRef.current;
    scene.add(partsGroup);

    // Animation Loop
    let animationFrameId;
    let hue = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate) {
        partsGroup.rotation.y += 0.006;
      }

      // Rainbow light cycling
      if (rgbEnabled && rgbColor === 'rainbow' && rgbLightRef.current) {
        hue = (hue + 0.005) % 1;
        const color = new THREE.Color().setHSL(hue, 0.9, 0.55);
        rgbLightRef.current.color = color;
        if (rgbLight2Ref.current) rgbLight2Ref.current.color = color;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update RGB lighting color & intensity
  useEffect(() => {
    if (rgbLightRef.current) {
      rgbLightRef.current.intensity = rgbEnabled ? 4.5 : 0;
      rgbLightRef.current.color.setHex(activeColorHex);
    }
    if (rgbLight2Ref.current) {
      rgbLight2Ref.current.intensity = rgbEnabled ? 3.0 : 0;
      rgbLight2Ref.current.color.setHex(activeColorHex);
    }
  }, [rgbEnabled, rgbColor, activeColorHex]);

  // Load and position 3D Models based on builderConfig
  useEffect(() => {
    const partsGroup = partsGroupRef.current;
    if (!partsGroup) return;

    // Clear previous models
    while (partsGroup.children.length > 0) {
      const obj = partsGroup.children[0];
      partsGroup.remove(obj);
    }

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    setIsLoadingModel(true);

    const offsetMult = explodedView ? 2.4 : 1.0;

    // Load definitions for each selected slot
    const slotsToLoad = [
      {
        slug: 'case',
        hasPart: !!builderConfig.case,
        url: '/models/case.glb',
        fallbackGen: createProceduralCase,
        position: [0, 0, 0],
        scale: [1.8, 1.8, 1.8],
        rotation: [0, 0, 0]
      },
      {
        slug: 'motherboard',
        hasPart: !!builderConfig.motherboard,
        url: '/models/motherboard.glb',
        fallbackGen: createProceduralMotherboard,
        position: [0, 0.4 * offsetMult, -0.15],
        scale: [1.2, 1.2, 1.2],
        rotation: [0, 0, 0]
      },
      {
        slug: 'cpu',
        hasPart: !!builderConfig.cpu,
        url: '/models/cpu.glb',
        fallbackGen: createProceduralCpu,
        position: [0, 0.5 * offsetMult, 0.05 * offsetMult],
        scale: [0.7, 0.7, 0.7],
        rotation: [0, 0, 0]
      },
      {
        slug: 'cooler',
        hasPart: !!builderConfig.cooler,
        url: '/models/cooler.glb',
        fallbackGen: createProceduralCooler,
        position: [0, 0.5 * offsetMult, 0.35 * offsetMult],
        scale: [1.1, 1.1, 1.1],
        rotation: [0, 0, 0]
      },
      {
        slug: 'ram',
        hasPart: !!builderConfig.ram,
        url: '/models/ram.glb',
        fallbackGen: createProceduralRam,
        position: [0.55 * offsetMult, 0.55 * offsetMult, 0.08 * offsetMult],
        scale: [0.8, 0.8, 0.8],
        rotation: [0, 0, 0]
      },
      {
        slug: 'gpu',
        hasPart: !!builderConfig.gpu,
        url: '/models/gpu.glb',
        fallbackGen: createProceduralGpu,
        position: [0, -0.2 * offsetMult, 0.45 * offsetMult],
        scale: [1.1, 1.1, 1.1],
        rotation: [0, 0, 0]
      },
      {
        slug: 'storage',
        hasPart: !!builderConfig.storage,
        url: '/models/storage.glb',
        fallbackGen: createProceduralStorage,
        position: [0.35 * offsetMult, 0.1 * offsetMult, 0.02 * offsetMult],
        scale: [0.65, 0.65, 0.65],
        rotation: [0, 0, 0]
      },
      {
        slug: 'psu',
        hasPart: !!builderConfig.psu,
        url: '/models/psu.glb',
        fallbackGen: createProceduralPsu,
        position: [0, -1.0 * offsetMult, 0],
        scale: [1.1, 1.1, 1.1],
        rotation: [0, 0, 0]
      }
    ];

    let pendingCount = slotsToLoad.filter(s => s.hasPart).length;
    if (pendingCount === 0) {
      // If nothing selected, load empty case wireframe or default preview case
      const previewCase = createProceduralCase(true);
      partsGroup.add(previewCase);
      setIsLoadingModel(false);
      return;
    }

    slotsToLoad.forEach(slot => {
      if (!slot.hasPart) return;

      loader.load(
        slot.url,
        (gltf) => {
          const model = gltf.scene;

          // Normalize bounding box size
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const normFactor = maxDim > 0 ? (2.0 / maxDim) : 1;

          model.scale.set(
            slot.scale[0] * normFactor,
            slot.scale[1] * normFactor,
            slot.scale[2] * normFactor
          );
          model.position.set(...slot.position);
          model.rotation.set(...slot.rotation);

          // Enhance materials with PBR metallic reflections
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.metalness = Math.max(0.4, child.material.metalness || 0.5);
                child.material.roughness = Math.min(0.5, child.material.roughness || 0.4);
              }
            }
          });

          partsGroup.add(model);
          pendingCount--;
          if (pendingCount <= 0) setIsLoadingModel(false);
        },
        undefined,
        (err) => {
          console.warn(`Failed loading GLB for ${slot.slug}, using high-res procedural geometry:`, err);
          const fallback = slot.fallbackGen(false, activeColorHex);
          fallback.position.set(...slot.position);
          fallback.scale.set(...slot.scale);
          partsGroup.add(fallback);
          pendingCount--;
          if (pendingCount <= 0) setIsLoadingModel(false);
        }
      );
    });

  }, [builderConfig, explodedView]);

  // Camera Reset
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(4.5, 3.2, 5.2);
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
      partsGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full select-none">
      {/* 3D Visualizer Top Controls */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            3D REAL-TIME VIEW
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
            WEBGL 3D
          </span>
          {isLoadingModel && (
            <span className="text-xs text-slate-400 animate-pulse ml-2 font-mono">
              Загрузка 3D деталей...
            </span>
          )}
        </div>

        {/* 3D Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exploded View Toggle */}
          <button
            onClick={() => setExplodedView(!explodedView)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              explodedView
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Взрыв-схема / Разобрать по деталям"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{explodedView ? 'Собрать' : 'Взрыв-схема'}</span>
          </button>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              autoRotate ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title="360° Вращение"
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Сбросить камеру"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* ARGB Controls */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700/60">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <button
              onClick={() => setVisualizerSettings(prev => ({ ...prev, rgbEnabled: !prev.rgbEnabled }))}
              className={`text-xs font-medium px-1.5 py-0.5 rounded transition ${
                rgbEnabled ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              RGB {rgbEnabled ? 'ON' : 'OFF'}
            </button>
            {rgbEnabled && (
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
                {['cyan', 'purple', 'green', 'pink', 'white'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setVisualizerSettings(prev => ({ ...prev, rgbColor: c }))}
                    className={`w-3 h-3 rounded-full border transition ${
                      rgbColor === c ? 'scale-125 border-white ring-2 ring-cyan-400/50' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: rgbMap[c] ? `#${rgbMap[c].toString(16).padStart(6, '0')}` : '#06b6d4' }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[460px] w-full cursor-grab active:cursor-grabbing overflow-hidden"
      />

      {/* 3D Helper Footer */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Зажмите левую кнопку мыши для вращения 360°, колесо для зума, правую для сдвига</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400">
          <span>GLTF / PBR READY ●</span>
        </div>
      </div>
    </div>
  );
}

// ================= PROCEDURAL FALLBACK 3D GEOMETRIES =================

function createProceduralCase(isEmpty = false) {
  const group = new THREE.Group();

  // Outer Metal Chassis
  const chassisGeo = new THREE.BoxGeometry(2.4, 4.4, 4.2);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.8,
    roughness: 0.3,
    wireframe: isEmpty
  });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 0.5;
  group.add(chassis);

  // Tempered Glass Side Window
  const glassGeo = new THREE.PlaneGeometry(3.9, 4.0);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(1.21, 0.5, 0);
  glass.rotation.y = Math.PI / 2;
  group.add(glass);

  // PSU Shroud Basement
  const shroudGeo = new THREE.BoxGeometry(2.35, 1.1, 4.15);
  const shroudMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
  const shroud = new THREE.Mesh(shroudGeo, shroudMat);
  shroud.position.set(0, -1.15, 0);
  group.add(shroud);

  return group;
}

function createProceduralMotherboard() {
  const group = new THREE.Group();
  const pcbGeo = new THREE.BoxGeometry(0.1, 3.2, 2.8);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.6, roughness: 0.4 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  group.add(pcb);

  // VRM Heatsinks
  const vrmGeo = new THREE.BoxGeometry(0.25, 0.9, 0.35);
  const vrmMat = new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.9, roughness: 0.2 });
  const vrm1 = new THREE.Mesh(vrmGeo, vrmMat);
  vrm1.position.set(0.12, 0.9, -0.6);
  group.add(vrm1);

  return group;
}

function createProceduralCpu() {
  const group = new THREE.Group();
  const cpuGeo = new THREE.BoxGeometry(0.08, 0.6, 0.6);
  const cpuMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
  const cpu = new THREE.Mesh(cpuGeo, cpuMat);
  group.add(cpu);
  return group;
}

function createProceduralCooler(isEmpty, rgbColor = 0x06b6d4) {
  const group = new THREE.Group();
  // Pump block / Heatsink
  const blockGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 24);
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.rotation.z = Math.PI / 2;
  group.add(block);

  // ARGB Glowing Ring
  const ringGeo = new THREE.TorusGeometry(0.38, 0.05, 16, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: rgbColor });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.y = Math.PI / 2;
  ring.position.x = 0.2;
  group.add(ring);

  return group;
}

function createProceduralRam(isEmpty, rgbColor = 0x06b6d4) {
  const group = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const ramGeo = new THREE.BoxGeometry(0.06, 1.3, 0.14);
    const ramMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const ram = new THREE.Mesh(ramGeo, ramMat);
    ram.position.set(0, 0, (i - 0.5) * 0.25);
    group.add(ram);

    // Glowing RGB strip on top
    const ledGeo = new THREE.BoxGeometry(0.07, 0.15, 0.14);
    const ledMat = new THREE.MeshBasicMaterial({ color: rgbColor });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 0.65, (i - 0.5) * 0.25);
    group.add(led);
  }
  return group;
}

function createProceduralGpu(isEmpty, rgbColor = 0x06b6d4) {
  const group = new THREE.Group();
  const gpuGeo = new THREE.BoxGeometry(0.8, 1.2, 3.2);
  const gpuMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
  const gpu = new THREE.Mesh(gpuGeo, gpuMat);
  group.add(gpu);

  // Triple Fans
  for (let i = -1; i <= 1; i++) {
    const fanGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 24);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.5 });
    const fan = new THREE.Mesh(fanGeo, fanMat);
    fan.rotation.z = Math.PI / 2;
    fan.position.set(0.41, 0, i * 0.95);
    group.add(fan);
  }

  // Glowing RGB Logo Strip
  const logoGeo = new THREE.BoxGeometry(0.82, 0.18, 0.9);
  const logoMat = new THREE.MeshBasicMaterial({ color: rgbColor });
  const logo = new THREE.Mesh(logoGeo, logoMat);
  logo.position.set(0, 0.61, 0);
  group.add(logo);

  return group;
}

function createProceduralStorage() {
  const group = new THREE.Group();
  const m2Geo = new THREE.BoxGeometry(0.04, 0.18, 0.7);
  const m2Mat = new THREE.MeshStandardMaterial({ color: 0x065f46, metalness: 0.5, roughness: 0.5 });
  const m2 = new THREE.Mesh(m2Geo, m2Mat);
  group.add(m2);
  return group;
}

function createProceduralPsu() {
  const group = new THREE.Group();
  const psuGeo = new THREE.BoxGeometry(1.6, 0.95, 1.8);
  const psuMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
  const psu = new THREE.Mesh(psuGeo, psuMat);
  group.add(psu);
  return group;
}
