"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import { OrganStatus } from "@/lib/mockData";
import { Maximize2, RotateCcw, Zap, Activity } from "lucide-react";

interface NodeMeshRef {
  id: OrganStatus["id"];
  mesh: THREE.Group | THREE.Mesh;
  glowMesh: THREE.Mesh;
  worldPos: THREE.Vector3;
}

export default function Twin3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    patient,
    readings,
    prediction,
    organStatuses,
    activeOrgan,
    setActiveOrgan,
    cameraPreset,
    setCameraPreset,
  } = useDigitalTwin();

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<OrganStatus | null>(null);

  // Latest CGM reading
  const latestReading = readings[readings.length - 1];
  const currentGlucose = latestReading ? latestReading.glucose_mgdl : (patient?.fasting_glucose ?? 120);

  // Glycemic aura color based on current glucose
  const auraColorHex =
    currentGlucose > 250
      ? 0xfb7185 // rose/critical
      : currentGlucose > 180
      ? 0xfbbf24 // amber/high
      : currentGlucose < 70
      ? 0xa78bfa // violet/hypo
      : 0x22d3ee; // cyan/optimal

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    nodes: NodeMeshRef[];
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    isUserInteracting: boolean;
    mouseStart: { x: number; y: number };
    rotationAngles: { theta: number; phi: number; radius: number };
    particles: THREE.Points;
    heartGlow: THREE.Mesh | null;
    pulseTime: number;
    sensorWaves: THREE.Mesh[];
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene & Camera Setup ---
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a101f, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0f2438, 2.5);
    scene.add(ambientLight);

    const topCyanLight = new THREE.DirectionalLight(0x22d3ee, 3.0);
    topCyanLight.position.set(2, 4, 3);
    scene.add(topCyanLight);

    const backVioletLight = new THREE.DirectionalLight(0xa78bfa, 2.5);
    backVioletLight.position.set(-2, -2, -3);
    scene.add(backVioletLight);

    const bodyCoreLight = new THREE.PointLight(auraColorHex, 2.0, 5);
    bodyCoreLight.position.set(0, 0.4, 0.5);
    scene.add(bodyCoreLight);

    // --- 3. Digital Grid Floor ---
    const gridHelper = new THREE.GridHelper(8, 24, 0x22d3ee, 0x162a45);
    gridHelper.position.y = -1.8;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    scene.add(gridHelper);

    // --- 4. Anatomical Silhouette Body (Procedural Cybernetic Mesh) ---
    const bodyGroup = new THREE.Group();

    // Body Material: Translucent Holographic Glass
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f2b48,
      emissive: 0x051829,
      metalness: 0.2,
      roughness: 0.3,
      transparent: true,
      opacity: 0.6,
      transmission: 0.4,
      wireframe: false,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    // Head / Cranium
    const headGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.position.y = 1.6;
    headMesh.scale.set(0.9, 1.15, 0.95);
    bodyGroup.add(headMesh);
    bodyGroup.add(new THREE.Mesh(headGeo, wireMat));

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
    neckMesh.position.y = 1.35;
    bodyGroup.add(neckMesh);

    // Torso / Chest & Abdomen
    const chestGeo = new THREE.CylinderGeometry(0.42, 0.34, 0.65, 20);
    const chestMesh = new THREE.Mesh(chestGeo, bodyMat);
    chestMesh.position.y = 0.95;
    chestMesh.scale.set(1.1, 1, 0.7);
    bodyGroup.add(chestMesh);

    const chestWire = new THREE.Mesh(chestGeo, wireMat);
    chestWire.position.copy(chestMesh.position);
    chestWire.scale.copy(chestMesh.scale);
    bodyGroup.add(chestWire);

    // Abdomen / Pelvis
    const abdomenGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.6, 20);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, bodyMat);
    abdomenMesh.position.y = 0.35;
    abdomenMesh.scale.set(1.05, 1, 0.72);
    bodyGroup.add(abdomenMesh);

    // Arms
    // Left Arm (with CGM Sensor locus)
    const leftUpperArmGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.6, 16);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, bodyMat);
    leftUpperArm.position.set(-0.62, 0.85, 0);
    leftUpperArm.rotation.z = 0.15;
    bodyGroup.add(leftUpperArm);

    const leftForearmGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.6, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeo, bodyMat);
    leftForearm.position.set(-0.72, 0.3, 0.05);
    leftForearm.rotation.z = 0.08;
    bodyGroup.add(leftForearm);

    // Right Arm
    const rightUpperArm = new THREE.Mesh(leftUpperArmGeo, bodyMat);
    rightUpperArm.position.set(0.62, 0.85, 0);
    rightUpperArm.rotation.z = -0.15;
    bodyGroup.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(leftForearmGeo, bodyMat);
    rightForearm.position.set(0.72, 0.3, 0.05);
    rightForearm.rotation.z = -0.08;
    bodyGroup.add(rightForearm);

    // Legs
    // Left Leg
    const thighGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.85, 18);
    const leftThigh = new THREE.Mesh(thighGeo, bodyMat);
    leftThigh.position.set(-0.24, -0.4, 0);
    bodyGroup.add(leftThigh);

    const calfGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.85, 18);
    const leftCalf = new THREE.Mesh(calfGeo, bodyMat);
    leftCalf.position.set(-0.25, -1.2, 0);
    bodyGroup.add(leftCalf);

    // Right Leg
    const rightThigh = new THREE.Mesh(thighGeo, bodyMat);
    rightThigh.position.set(0.24, -0.4, 0);
    bodyGroup.add(rightThigh);

    const rightCalf = new THREE.Mesh(calfGeo, bodyMat);
    rightCalf.position.set(0.25, -1.2, 0);
    bodyGroup.add(rightCalf);

    scene.add(bodyGroup);

    // --- 5. Organ System Nodes & Sensor Pods ---
    const nodes: NodeMeshRef[] = [];
    const sensorWaves: THREE.Mesh[] = [];
    let heartGlowRef: THREE.Mesh | null = null;

    organStatuses.forEach(organ => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(organ.position3D[0], organ.position3D[1], organ.position3D[2]);

      const nodeColor = new THREE.Color(organ.color);

      // Core nucleus sphere
      const coreGeo = new THREE.SphereGeometry(organ.id === "sensor" ? 0.06 : 0.08, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 1.5,
        roughness: 0.1,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      nodeGroup.add(coreMesh);

      // Outer pulsating aura ring/halo
      const haloGeo = new THREE.RingGeometry(0.1, 0.14, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(haloMesh);

      // Specialized visual for CGM ISF Sensor Pod
      if (organ.id === "sensor") {
        // Transmitter disc
        const podGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
        const podMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x22d3ee,
          emissiveIntensity: 0.4,
        });
        const podMesh = new THREE.Mesh(podGeo, podMat);
        podMesh.rotation.x = Math.PI / 2;
        nodeGroup.add(podMesh);

        // Subcutaneous filament needle indicator
        const needleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8);
        const needleMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const needleMesh = new THREE.Mesh(needleGeo, needleMat);
        needleMesh.position.z = -0.06;
        needleMesh.rotation.x = Math.PI / 2;
        nodeGroup.add(needleMesh);

        // Concentric radio telemetry transmission rings
        for (let r = 1; r <= 3; r++) {
          const ringGeo = new THREE.RingGeometry(0.12 * r, 0.13 * r, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.5 - r * 0.12,
            side: THREE.DoubleSide,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.y = Math.PI / 2;
          nodeGroup.add(ringMesh);
          sensorWaves.push(ringMesh);
        }
      }

      // Save heart ref for pulsing
      if (organ.id === "heart") {
        heartGlowRef = haloMesh;
      }

      scene.add(nodeGroup);

      const worldPos = new THREE.Vector3();
      nodeGroup.getWorldPosition(worldPos);

      nodes.push({
        id: organ.id,
        mesh: nodeGroup,
        glowMesh: haloMesh,
        worldPos,
      });
    });

    // --- 6. Glucose Flux Particles (Vascular & Interstitial Flow) ---
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Particles distributed along the vascular torso & limb paths
      const t = (i / particleCount) * Math.PI * 4;
      const radius = 0.25 + Math.sin(t * 2) * 0.1;
      const y = -1.0 + (i / particleCount) * 2.4;
      const x = Math.sin(t) * radius;
      const z = Math.cos(t) * radius * 0.6;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Particle color matches glycemic flux
      const color = new THREE.Color(auraColorHex);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 7. Mouse Orbit Controls & Interaction ---
    let isUserInteracting = false;
    let mouseStart = { x: 0, y: 0 };
    const rotationAngles = { theta: 0, phi: 0, radius: 4.2 };

    const onPointerDown = (e: PointerEvent) => {
      isUserInteracting = true;
      mouseStart = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isUserInteracting) {
        // Raycasting for organ hover
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        const clickableMeshes = nodes.map(n => n.mesh);
        const intersects = raycaster.intersectObjects(clickableMeshes, true);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          const hitNode = nodes.find(n => n.mesh === hitObj || n.mesh.children.includes(hitObj));
          if (hitNode) {
            const org = organStatuses.find(o => o.id === hitNode.id);
            setHoveredNode(org ?? null);
            container.style.cursor = "pointer";
            return;
          }
        }
        setHoveredNode(null);
        container.style.cursor = "default";
        return;
      }

      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;
      rotationAngles.theta += dx * 0.006;
      rotationAngles.phi = Math.max(-0.6, Math.min(0.8, rotationAngles.phi - dy * 0.006));
      mouseStart = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      rotationAngles.radius = Math.max(2.0, Math.min(6.5, rotationAngles.radius + e.deltaY * 0.003));
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const clickableMeshes = nodes.map(n => n.mesh);
      const intersects = raycaster.intersectObjects(clickableMeshes, true);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        const hitNode = nodes.find(n => n.mesh === hitObj || n.mesh.children.includes(hitObj));
        if (hitNode) {
          const org = organStatuses.find(o => o.id === hitNode.id);
          if (org) {
            setActiveOrgan(org);
            if (org.id === "pancreas") setCameraPreset("pancreas");
            else if (org.id === "sensor") setCameraPreset("sensor");
            else if (org.id === "liver") setCameraPreset("liver");
            else if (org.id === "heart") setCameraPreset("heart");
          }
        }
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("click", onClick);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Save refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      nodes,
      targetCamPos: new THREE.Vector3(0, 0.3, 4.2),
      targetLookAt: new THREE.Vector3(0, 0.2, 0),
      currentLookAt: new THREE.Vector3(0, 0.2, 0),
      isUserInteracting,
      mouseStart,
      rotationAngles,
      particles,
      heartGlow: heartGlowRef,
      pulseTime: 0,
      sensorWaves,
    };

    // --- 8. Animation Render Loop ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const state = sceneRef.current;
      if (!state) return;

      state.pulseTime += delta * 2.5;

      // Rotate nodes halos
      state.nodes.forEach(n => {
        n.glowMesh.rotation.z += delta * 0.8;
        const scale = 1.0 + Math.sin(state.pulseTime + (n.id === "pancreas" ? 1 : 0)) * 0.12;
        n.glowMesh.scale.set(scale, scale, scale);
      });

      // Pulse CGM sensor waves outward
      state.sensorWaves.forEach((ring, idx) => {
        const ringScale = 1.0 + ((state.pulseTime * 0.8 + idx * 0.6) % 1.8);
        ring.scale.set(ringScale, ringScale, ringScale);
        (ring.material as THREE.Material).opacity = Math.max(0, 0.6 - (ringScale - 1.0) * 0.4);
      });

      // Flow flux particles along circulation
      const posAttr = state.particles.geometry.getAttribute("position");
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += delta * 0.4;
        if (posArray[i * 3 + 1] > 1.8) {
          posArray[i * 3 + 1] = -1.6;
        }
      }
      posAttr.needsUpdate = true;

      // Auto-rotation when not interacting
      if (autoRotate && !isUserInteracting && cameraPreset === "body") {
        rotationAngles.theta += delta * 0.25;
      }

      // Smooth camera interpolation based on cameraPreset or user orbit
      let desiredCamX = 0;
      let desiredCamY = 0.3;
      let desiredCamZ = 4.2;
      const desiredLookAt = new THREE.Vector3(0, 0.2, 0);

      if (cameraPreset === "pancreas") {
        desiredCamX = 0.2;
        desiredCamY = 0.55;
        desiredCamZ = 1.6;
        desiredLookAt.set(0.1, 0.45, 0.2);
      } else if (cameraPreset === "sensor") {
        desiredCamX = -1.4;
        desiredCamY = 0.8;
        desiredCamZ = 1.2;
        desiredLookAt.set(-0.95, 0.75, 0.05);
      } else if (cameraPreset === "liver") {
        desiredCamX = -0.5;
        desiredCamY = 0.65;
        desiredCamZ = 1.5;
        desiredLookAt.set(-0.35, 0.55, 0.25);
      } else if (cameraPreset === "heart") {
        desiredCamX = 0.25;
        desiredCamY = 0.95;
        desiredCamZ = 1.5;
        desiredLookAt.set(0.15, 0.85, 0.28);
      } else {
        // Body orbit
        desiredCamX = Math.sin(rotationAngles.theta) * Math.cos(rotationAngles.phi) * rotationAngles.radius;
        desiredCamY = Math.sin(rotationAngles.phi) * rotationAngles.radius + 0.3;
        desiredCamZ = Math.cos(rotationAngles.theta) * Math.cos(rotationAngles.phi) * rotationAngles.radius;
      }

      camera.position.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), 0.05);
      state.currentLookAt.lerp(desiredLookAt, 0.05);
      camera.lookAt(state.currentLookAt);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("click", onClick);
      renderer.dispose();
      scene.clear();
    };
  }, [organStatuses, auraColorHex, cameraPreset, autoRotate, setActiveOrgan, setCameraPreset]);

  return (
    <div className="relative w-full h-[580px] lg:h-[720px] rounded-3xl overflow-hidden border border-line bg-gradient-to-b from-[#080e1a] via-[#0d1829] to-[#080e1a] shadow-xl select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Overlay HUD: Patient Identity & Biometric Holographic Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm">
        <div className="rounded-2xl border border-line border-b-2 bg-card/90 p-4 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-cyan font-bold">
                3D Digital Twin · {patient?.id}
              </p>
              <h2 className="text-base font-extrabold text-text tracking-tight">{patient?.name}</h2>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase font-mono border border-b-2 shadow-xs ${
                patient?.risk_label === "CRITICAL"
                  ? "bg-rose/15 text-rose border-rose/40 border-b-rose/70"
                  : patient?.risk_label === "HIGH"
                  ? "bg-amber/15 text-amber border-amber/40 border-b-amber/70"
                  : "bg-cyan/15 text-cyan border-cyan/40 border-b-cyan/70"
              }`}
            >
              {patient?.risk_label} RISK
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line/40 pt-2 text-center">
            <div>
              <p className="text-[10px] text-text/50">Current ISF Glucose</p>
              <p className="text-sm font-mono font-extrabold text-cyan">{currentGlucose} mg/dL</p>
            </div>
            <div>
              <p className="text-[10px] text-text/50">120-Min Spike Risk</p>
              <p
                className={`text-sm font-mono font-extrabold ${
                  prediction && prediction.spike_probability > 0.6 ? "text-rose" : "text-emerald"
                }`}
              >
                {prediction ? `${Math.round(prediction.spike_probability * 100)}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text/50">HbA1c</p>
              <p className="text-sm font-mono font-extrabold text-text">{patient?.hba1c}%</p>
            </div>
          </div>
        </div>

        {/* Dynamic Holographic Glycemic Alert Banner */}
        {prediction && prediction.prediction === "SPIKE" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose/40 border-b-2 border-b-rose bg-rose/15 px-3.5 py-2 backdrop-blur-md text-xs font-bold text-rose animate-pulse shadow-xs">
            <Zap className="h-4 w-4 shrink-0" />
            <span>Glucose spike predicted within 120 minutes. Review clinical intervention protocol.</span>
          </div>
        )}
      </div>

      {/* Top-Right Camera Perspective Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 rounded-2xl border border-line border-b-2 bg-card/90 p-1.5 backdrop-blur-md shadow-xs text-xs">
          <span className="px-2 text-[10px] font-mono text-muted uppercase font-bold">Focus:</span>
          {(
            [
              { id: "body", label: "Full Body" },
              { id: "pancreas", label: "Pancreas" },
              { id: "sensor", label: "CGM Sensor" },
              { id: "liver", label: "Liver" },
              { id: "heart", label: "Vascular System" },
            ] as const
          ).map(p => (
            <button
              key={p.id}
              onClick={() => {
                setCameraPreset(p.id);
                const target = organStatuses.find(o => o.id === p.id);
                if (target) setActiveOrgan(target);
              }}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all tactile-press ${
                cameraPreset === p.id
                  ? "bg-cyan text-on-accent border border-cyan/50 border-b-2 border-b-cyan-700 shadow-xs"
                  : "text-text/70 hover:text-text hover:bg-surface border border-transparent hover:border-line"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* View Controls Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-line border-b-2 bg-card/90 px-2.5 py-1 text-xs font-bold backdrop-blur-md transition tactile-press shadow-xs ${
              autoRotate ? "text-cyan border-cyan/40 border-b-cyan/60" : "text-text/70 hover:text-text"
            }`}
          >
            <RotateCcw className={`h-3 w-3 ${autoRotate ? "animate-spin" : ""}`} />
            <span>{autoRotate ? "Auto-Orbit On" : "Orbit Paused"}</span>
          </button>
          <button
            onClick={() => {
              setCameraPreset("body");
              setActiveOrgan(null);
            }}
            title="Reset Perspective"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-line border-b-2 bg-card/90 text-text/70 hover:text-cyan hover:border-cyan/40 backdrop-blur-md tactile-press shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Organ Diagnostic Card (Active Locus Inspector) */}
      {activeOrgan && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-20 animate-fadeUp">
          <div className="rounded-2xl border border-line/80 bg-card/90 p-4 backdrop-blur-lg shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-line/40">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full animate-ping"
                  style={{ backgroundColor: activeOrgan.color }}
                />
                <div>
                  <h3 className="text-sm font-extrabold text-text">{activeOrgan.name}</h3>
                  <p className="text-[10px] font-mono text-cyan">{activeOrgan.system}</p>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                style={{
                  backgroundColor: `${activeOrgan.color}20`,
                  color: activeOrgan.color,
                  border: `1px solid ${activeOrgan.color}50`,
                }}
              >
                {activeOrgan.status}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text/60 font-medium">{activeOrgan.metric}</span>
                <span className="font-mono font-extrabold text-text">{activeOrgan.value}</span>
              </div>
              <p className="text-xs text-text/70 leading-relaxed">{activeOrgan.description}</p>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-line/40 text-[10px] text-muted">
              <span>Interactive 3D locus anchored</span>
              <button
                onClick={() => setActiveOrgan(null)}
                className="text-cyan hover:underline font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover Tooltip when pointer is over an organ locus */}
      {hoveredNode && !activeOrgan && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border border-cyan/40 bg-card/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg text-xs font-semibold text-cyan">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>Click to inspect {hoveredNode.name}</span>
        </div>
      )}

      {/* Spatial 3D Orientation Guide Watermark */}
      <div className="absolute bottom-3 left-4 z-10 hidden sm:flex items-center gap-3 text-[10px] font-mono text-text/40">
        <span>• Left drag: 360° orbit</span>
        <span>• Scroll: zoom</span>
        <span>• Click organ: zoom to locus</span>
      </div>
    </div>
  );
}
