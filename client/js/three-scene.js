import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export class ThreeScene {
  constructor(container) {
    this.container = container;
    this.mouse = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.planets = [];
    this.planetMeshes = [];
    this.labels = [];
    this.isLoaded = false;

    this.init();
    this.createGalaxy();
    this.createPlanets();
    this.createParticles();
    this.setupEvents();
    this.animate();
    this.isLoaded = true;
  }

  init() {
    const container = this.container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06060A);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 2, 12);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('three-canvas'),
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Controls for subtle auto-rotation
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.3;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minPolarAngle = Math.PI / 3.8;
    this.controls.target.set(0, 0, 0);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
    this.scene.add(ambientLight);

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    // Point light
    const pointLight = new THREE.PointLight(0x5BBFD6, 0.6, 20);
    pointLight.position.set(-3, 2, 4);
    this.scene.add(pointLight);

    // Bloom effect via post-processing (simulated with emissive materials)
    this.scene.fog = new THREE.FogExp2(0x06060A, 0.015);
  }

  createGalaxy() {
    const galaxyGroup = new THREE.Group();

    // Galaxy particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 6000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x5BBFD6);
    const color2 = new THREE.Color(0x8A7EC4);
    const color3 = new THREE.Color(0xC4A06B);

    for (let i = 0; i < particleCount; i++) {
      // Spiral galaxy distribution
      const radius = Math.random() * 6;
      const angle = radius * 0.8 + Math.random() * 0.3;
      const spread = (Math.random() - 0.5) * 0.6;

      positions[i * 3] = Math.cos(angle) * radius + spread * 0.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8 * Math.pow(radius / 6, 1.5);
      positions[i * 3 + 2] = Math.sin(angle) * radius + spread * 0.5;

      const t = radius / 6;
      const color = color1.clone().lerp(color2, t).lerp(color3, t * 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 0.02 + Math.random() * 0.06;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    this.galaxy = new THREE.Points(particlesGeometry, particlesMaterial);
    galaxyGroup.add(this.galaxy);

    // Center glow
    const centerGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0x5BBFD6,
      transparent: true,
      opacity: 0.6
    });
    this.centerGlow = new THREE.Mesh(centerGeometry, centerMaterial);
    galaxyGroup.add(this.centerGlow);

    // Outer glow ring
    const ringGeometry = new THREE.RingGeometry(0.6, 0.9, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x5BBFD6,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.glowRing = new THREE.Mesh(ringGeometry, ringMaterial);
    this.glowRing.rotation.x = -Math.PI / 3;
    galaxyGroup.add(this.glowRing);

    this.scene.add(galaxyGroup);
    this.galaxyGroup = galaxyGroup;
  }

  createPlanets() {
    const planetData = [
      {
        id: 'learn',
        name: 'Avarith Learn',
        sub: 'Coming Soon',
        radius: 0.4,
        orbit: 2.2,
        speed: 0.3,
        color: 0x5BBFD6,
        emissive: 0x2A6B7A,
        glowColor: 0x5BBFD6,
        position: [2.2, 0.2, 0]
      },
      {
        id: 'agent',
        name: 'Avarith Agent',
        sub: 'Coming Soon',
        radius: 0.5,
        orbit: 3.6,
        speed: 0.18,
        color: 0x8A7EC4,
        emissive: 0x4A3E6A,
        glowColor: 0x8A7EC4,
        position: [0, 0.6, 3.6]
      },
      {
        id: 'memory',
        name: 'Avarith Memory',
        sub: 'Coming Soon',
        radius: 0.6,
        orbit: 5.0,
        speed: 0.1,
        color: 0xC4A06B,
        emissive: 0x6A4A2A,
        glowColor: 0xC4A06B,
        position: [-5.0, -0.3, 0]
      },
      {
        id: 'api',
        name: 'Avarith API',
        sub: 'Coming Soon',
        radius: 0.45,
        orbit: 6.2,
        speed: 0.07,
        color: 0x6BA87A,
        emissive: 0x2A5A3A,
        glowColor: 0x6BA87A,
        position: [0, -0.5, -6.2]
      }
    ];

    const planetGroup = new THREE.Group();

    planetData.forEach((data, index) => {
      // Planet sphere
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: data.color,
        emissive: data.emissive,
        emissiveIntensity: 0.1,
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.6
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(data.position[0], data.position[1], data.position[2]);
      mesh.userData = { id: data.id, data: data };

      // Glow ring around planet
      const glowGeometry = new THREE.SphereGeometry(data.radius * 1.6, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: data.glowColor,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      mesh.add(glowMesh);

      // Orbiting electron ring (for Learn specifically)
      if (data.id === 'learn') {
        const ringGeo = new THREE.TorusGeometry(data.radius * 2.8, 0.015, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x5BBFD6,
          transparent: true,
          opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        ring.rotation.z = 0.3;
        mesh.add(ring);
        mesh.userData.ring = ring;
      }

      planetGroup.add(mesh);
      this.planetMeshes.push(mesh);
      this.planets.push({ mesh, data, angle: index * Math.PI / 2 });
    });

    this.scene.add(planetGroup);
    this.planetGroup = planetGroup;
  }

  createParticles() {
    // Ambient floating particles
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color = new THREE.Color(0x5BBFD6);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 8;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const brightness = 0.1 + Math.random() * 0.3;
      colors[i * 3] = color.r * brightness;
      colors[i * 3 + 1] = color.g * brightness;
      colors[i * 3 + 2] = color.b * brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    this.ambientParticles = new THREE.Points(geometry, material);
    this.scene.add(this.ambientParticles);
  }

  setupEvents() {
    // Mouse move for parallax
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize
    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    // Click on planets (delegated to UI)
    this.renderer.domElement.addEventListener('click', (e) => {
      // Raycasting for planet clicks
      const rect = this.renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, this.camera);

      const intersects = raycaster.intersectObjects(this.planetMeshes, true);
      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && !target.userData?.id) {
          target = target.parent;
        }
        if (target.userData?.id) {
          const event = new CustomEvent('planet-click', {
            detail: { id: target.userData.id, data: target.userData.data }
          });
          document.dispatchEvent(event);
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Rotate galaxy
    if (this.galaxyGroup) {
      this.galaxyGroup.rotation.y += 0.0003;
    }

    // Rotate planets
    this.planetMeshes.forEach((mesh, i) => {
      const data = this.planets[i];
      if (data) {
        data.angle += (data.data.speed || 0.1) * 0.008;
        const orbit = data.data.orbit || 2;
        mesh.position.x = Math.cos(data.angle) * orbit;
        mesh.position.z = Math.sin(data.angle) * orbit;
        mesh.position.y = Math.sin(data.angle * 0.5) * 0.3;

        // Rotate planet on its axis
        mesh.rotation.y += 0.005;
        mesh.rotation.x += 0.001;

        // Ring rotation for Learn
        if (mesh.userData.ring) {
          mesh.userData.ring.rotation.z += 0.01;
        }

        // Glow pulse
        const glow = mesh.children.find(c => c.isMesh && c.material.opacity !== undefined && c.material.opacity < 0.2);
        if (glow) {
          glow.material.opacity = 0.06 + 0.04 * Math.sin(time * 0.8 + i);
        }
      }
    });

    // Ambient particles rotation
    if (this.ambientParticles) {
      this.ambientParticles.rotation.y += 0.0002;
      this.ambientParticles.rotation.x += 0.00005;
    }

    // Parallax effect via camera target offset
    this.target.x += (this.mouse.x * 0.3 - this.target.x) * 0.02;
    this.target.y += (this.mouse.y * 0.15 - this.target.y) * 0.02;

    // Update controls
    this.controls.update();

    // Center glow pulse
    if (this.centerGlow) {
      const scale = 1 + 0.06 * Math.sin(time * 0.6);
      this.centerGlow.scale.set(scale, scale, scale);
    }

    if (this.glowRing) {
      this.glowRing.rotation.x = -Math.PI / 3 + 0.1 * Math.sin(time * 0.3);
      this.glowRing.rotation.z = 0.2 * Math.sin(time * 0.2);
      const s = 1 + 0.05 * Math.sin(time * 0.5);
      this.glowRing.scale.set(s, s, s);
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Get planet position in screen space for label projection
  getPlanetScreenPositions() {
    const positions = {};
    this.planetMeshes.forEach((mesh) => {
      const id = mesh.userData?.id;
      if (id) {
        const pos = new THREE.Vector3();
        mesh.getWorldPosition(pos);
        pos.project(this.camera);
        const x = (pos.x * 0.5 + 0.5) * this.width;
        const y = (-pos.y * 0.5 + 0.5) * this.height;
        const depth = pos.z;
        positions[id] = { x, y, depth, data: mesh.userData.data };
      }
    });
    return positions;
  }

  dispose() {
    this.renderer.dispose();
    // Clean up geometries and materials
    this.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }
}