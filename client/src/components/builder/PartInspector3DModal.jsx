import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { X, RotateCcw, Box, Eye, Sparkles, Check } from 'lucide-react';

export default function PartInspector3DModal({ part, onClose, onSelect }) {
  const { t, i18n } = useTranslation();
  const { formatUzs } = useShop();

  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const modelMap = {
    case: '/models/case.glb',
    motherboard: '/models/motherboard.glb',
    cpu: '/models/cpu.glb',
    cooler: '/models/cooler.glb',
    ram: '/models/ram.glb',
    gpu: '/models/gpu.glb',
    storage: '/models/storage.glb',
    psu: '/models/psu.glb'
  };

  useEffect(() => {
    if (!part || !containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c111d);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(2.8, 1.8, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.8);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Grid
    const grid = new THREE.GridHelper(8, 16, 0x1e293b, 0x0f172a);
    grid.position.y = -1.2;
    scene.add(grid);

    // Load Model
    const modelUrl = modelMap[part.category_slug] || '/models/gpu.glb';
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    let currentModel = null;
    loader.load(
      modelUrl,
      (gltf) => {
        currentModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = new THREE.Vector3();
        box.getCenter(center);
        currentModel.position.sub(center); // Center to (0,0,0)

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 2.0 / maxDim;
          currentModel.scale.set(scale, scale, scale);
        }

        scene.add(currentModel);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.warn('Fallback placeholder', err);
        const geo = new THREE.BoxGeometry(1.6, 1.2, 2.0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.2 });
        currentModel = new THREE.Mesh(geo, mat);
        scene.add(currentModel);
        setLoading(false);
      }
    );

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [part]);

  if (!part) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0d121f] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-black font-bold uppercase">
                  3D INSPECT
                </span>
                <span className="text-xs font-semibold text-slate-400">{part.brand}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {i18n.language === 'en' ? part.name_en : part.name_ru}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Viewport */}
        <div className="relative h-[380px] w-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0c111d] text-cyan-400 font-mono text-xs z-10">
              Загрузка 3D модели...
            </div>
          )}
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>

        {/* Footer info & Select CTA */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Стоимость:</div>
            <div className="text-xl font-black text-cyan-400 font-mono">
              {formatUzs(part.price_uzs)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Закрыть
            </button>
            {onSelect && (
              <button
                onClick={() => {
                  onSelect(part);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
              >
                <Check className="w-4 h-4" />
                Выбрать в сборку
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
