import React, { useEffect, useRef, useState } from 'react';
import { createTimeline, createTimer, utils } from 'animejs';
import * as THREE from 'three';
import 'animejs/adapters/three';

export const ThreeStageShowcase = () => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activePreset, setActivePreset] = useState('gold');

  const timelineRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const $container = containerRef.current;
    if (!$container) return;

    const width = $container.clientWidth || 600;
    const height = $container.clientHeight || 420;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    $container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 6.5);
    camera.lookAt(0, 0.4, 0);
    scene.add(camera);

    // Container Group
    const container = new THREE.Group();
    scene.add(container);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(14, 14);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x191A18 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    container.add(ground);

    // Golden & Steel Grid
    const gridColorA = 0xF4CD6A;
    const gridColorB = 0x6E7370;
    const grid = new THREE.GridHelper(14, 28, gridColorA, gridColorB);
    grid.position.y = 0.002;
    container.add(grid);

    // Center Pedestal / Cube
    const cubeGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.7,
      roughness: 0.25,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 0.6;
    cube.castShadow = true;
    cube.receiveShadow = true;
    container.add(cube);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    container.add(ambientLight);

    const spot = new THREE.SpotLight(0xffffff, 120, 16, Math.PI / 4, 0.3);
    spot.position.set(0, 4.5, 0);
    spot.castShadow = true;
    spot.target = cube;
    container.add(spot);

    const spotHelper = new THREE.SpotLightHelper(spot, 0xF4CD6A);
    container.add(spotHelper);

    // Timeline using Anime.js v4 Three.js adapter
    let tl = null;
    let timer = null;

    try {
      tl = createTimeline({ defaults: { duration: 5000, ease: 'linear', loop: true } })
        .add(
          container,
          {
            rotateY: 360,
            duration: 40000,
          },
          0
        )
        .add(
          spot,
          {
            x: () => utils.random(-5, 5, 1),
            y: () => utils.random(3.5, 5, 1),
            z: () => utils.random(-5, 5, 1),
            duration: 3200,
            ease: 'inOutSine',
            onLoop: (self) => self.refresh && self.refresh(),
          },
          0
        )
        .add(
          cube,
          {
            color: ['#F4CD6A', '#C1440E', '#D4AF37'],
            x: [-2.5, 0, 2.5],
            y: {
              to: [0, 4 * Math.PI],
              modifier: (value) => 0.6 + 0.5 * (Math.abs(Math.sin(value)) + Math.abs(Math.cos(value))),
            },
            rotateZ: [360, 0, -360],
            rotateY: [0, 360],
            alternate: true,
            duration: 4500,
            onUpdate: () => spotHelper.update(),
          },
          0
        );

      timelineRef.current = tl;

      timer = createTimer({
        onUpdate: () => {
          renderer.render(scene, camera);
        },
      });
      timerRef.current = timer;
    } catch (err) {
      console.warn('Anime.js Three.js adapter setup:', err);
    }

    // Resize Handler
    const handleResize = () => {
      if (!$container) return;
      const w = $container.clientWidth;
      const h = $container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      try {
        if (tl && typeof tl.pause === 'function') tl.pause();
        if (timer && typeof timer.pause === 'function') timer.pause();
      } catch {
        // ignore
      }
      groundGeometry.dispose();
      groundMaterial.dispose();
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const togglePlayback = () => {
    if (timelineRef.current) {
      if (isPlaying) {
        timelineRef.current.pause();
      } else {
        timelineRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="hsection" style={{ background: 'var(--deep-black)', color: 'var(--chalk)', position: 'relative', overflow: 'hidden' }}>
      <div className="section-head" style={{ marginBottom: '20px' }}>
        <div>
          <span className="mono" style={{ color: 'var(--gold-bright)', display: 'block', marginBottom: '8px' }}>
            3D Laboratory · Real-Time Kinetic Stage
          </span>
          <h2 style={{ color: 'var(--chalk)' }}>
            Engineered on<br />Street Pavement
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={togglePlayback}
            style={{ color: 'var(--chalk)', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            {isPlaying ? '⏸ Pause Motion' : '▶ Play Motion'}
          </button>
          <div className="mono section-num" style={{ color: 'var(--gold-deep)' }}>
            06 / 3D Stage
          </div>
        </div>
      </div>

      <p style={{ maxWidth: '640px', color: '#a9aca9', fontSize: '14.5px', marginBottom: '24px', lineHeight: '1.6' }}>
        Interactive Three.js WebGL viewport animated via Anime.js v4 timeline. Featuring dynamic shadow-casting spotlight tracking, rotational grid coordinates, and chromatic kinetic pedestal movement.
      </p>

      {/* THREE.JS CONTAINER */}
      <div
        className="full-container"
        ref={containerRef}
        style={{
          width: '100%',
          height: '460px',
          background: 'radial-gradient(circle at center, #262422 0%, #121212 75%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Floating Controls Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            zIndex: 10,
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: 'rgba(25, 26, 24, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            border: '1px solid rgba(244, 205, 106, 0.3)',
          }}
        >
          <span className="mono" style={{ fontSize: '10.5px', color: 'var(--gold-bright)' }}>
            ● LIVE 3D RENDER (40s REVOLUTION)
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>
            SPOTLIGHT TRACKING
          </span>
        </div>
      </div>
    </section>
  );
};
