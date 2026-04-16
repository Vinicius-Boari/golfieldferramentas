import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Wrench shape
function WrenchShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -1.2);
  shape.lineTo(0.12, -1.2);
  shape.lineTo(0.12, 0.6);
  shape.lineTo(0.35, 0.9);
  shape.lineTo(0.35, 1.2);
  shape.lineTo(-0.23, 1.2);
  shape.lineTo(-0.23, 0.9);
  shape.lineTo(0, 0.6);
  shape.closePath();
  return shape;
}

// Hexagon (bolt/nut)
function HexShape() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = Math.cos(angle) * 0.4;
    const y = Math.sin(angle) * 0.4;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

type ToolType = "wrench" | "hex" | "gear" | "drill";

interface FloatingToolProps {
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  type: ToolType;
  scale: number;
}

function FloatingTool({ position, rotation, speed, type, scale }: FloatingToolProps) {
  const ref = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = rotation[0] + t * speed * 0.15;
    ref.current.rotation.y = rotation[1] + t * speed * 0.1;
    ref.current.rotation.z = rotation[2] + t * speed * 0.05;
    ref.current.position.y = initialY + Math.sin(t * speed * 0.3 + offset) * 0.6;
    ref.current.position.x = position[0] + Math.sin(t * speed * 0.15 + offset) * 0.3;
  });

  const geometry = useMemo(() => {
    if (type === "wrench") {
      return new THREE.ExtrudeGeometry(WrenchShape(), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    }
    if (type === "hex") {
      return new THREE.ExtrudeGeometry(HexShape(), { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    }
    if (type === "gear") {
      const shape = new THREE.Shape();
      const teeth = 8;
      const innerR = 0.3;
      const outerR = 0.45;
      for (let i = 0; i < teeth; i++) {
        const a1 = (Math.PI * 2 / teeth) * i;
        const a2 = a1 + Math.PI * 2 / teeth * 0.3;
        const a3 = a1 + Math.PI * 2 / teeth * 0.5;
        const a4 = a1 + Math.PI * 2 / teeth * 0.8;
        shape.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
        shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
        shape.lineTo(Math.cos(a3) * outerR, Math.sin(a3) * outerR);
        shape.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
      }
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
    }
    // drill bit - simple cylinder + cone
    return new THREE.CylinderGeometry(0.08, 0.02, 1.5, 8);
  }, [type]);

  return (
    <mesh ref={ref} position={position} scale={scale} geometry={geometry}>
      <meshStandardMaterial
        color="#ff3333"
        transparent
        opacity={0.12}
        roughness={0.5}
        metalness={0.5}
      />
    </mesh>
  );
}

function Scene() {
  const tools = useMemo(() => {
    const types: ToolType[] = ["wrench", "hex", "gear", "drill"];
    const items: FloatingToolProps[] = [];
    for (let i = 0; i < 18; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 8 - 3,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        speed: 0.3 + Math.random() * 0.4,
        type: types[i % types.length],
        scale: 0.8 + Math.random() * 1.2,
      });
    }
    return items;
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.2} />
      {tools.map((tool, i) => (
        <FloatingTool key={i} {...tool} />
      ))}
    </>
  );
}

const ToolsBackground3D = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default ToolsBackground3D;
