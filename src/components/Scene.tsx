import { Canvas } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import { Dagger } from './Dagger'
import type { DaggerConfig } from './Dagger'

const DAGGERS: DaggerConfig[] = [
  {
    id: 'experience',
    label: 'Experience',
    x: -2.6,
    bladeColor: '#B0B8A4',
    guardColor: '#8B7040',
    handleColor: '#4A3020',
    pommelColor: '#A08848',
    emissiveColor: '#C9A24A',
  },
  {
    id: 'skills',
    label: 'Skills',
    x: -1.3,
    bladeColor: '#9AAAB8',
    guardColor: '#252E3C',
    handleColor: '#161E2A',
    pommelColor: '#303848',
    emissiveColor: '#3A6FAA',
  },
  {
    id: 'projects',
    label: 'Projects',
    x: 0,
    bladeColor: '#C4CED6',
    guardColor: '#4A4438',
    handleColor: '#2A2420',
    pommelColor: '#5A5048',
    emissiveColor: '#C9813A',
  },
  {
    id: 'about',
    label: 'About',
    x: 1.3,
    bladeColor: '#A8A898',
    guardColor: '#3A3828',
    handleColor: '#5C4830',
    pommelColor: '#C4B870',
    emissiveColor: '#98A83A',
  },
  {
    id: 'contact',
    label: 'Contact',
    x: 2.6,
    bladeColor: '#8090A0',
    guardColor: '#28283A',
    handleColor: '#1A1828',
    pommelColor: '#383858',
    emissiveColor: '#6855B0',
  },
]

function handleCreated({ camera }: RootState) {
  camera.lookAt(0, 0.4, 0)
}

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 7.5], fov: 50 }}
      onCreated={handleCreated}
      dpr={[1, 2]}
    >
      {/* Warm torchlight from left, cooler fill from right */}
      <ambientLight intensity={0.07} />
      <pointLight position={[-2.5, 5, 3]} intensity={45} color="#D0863A" decay={2} />
      <pointLight position={[3, 7, 1]} intensity={22} color="#6080B8" decay={2} />

      {DAGGERS.map((config, i) => (
        <Dagger key={config.id} config={config} delay={i * 0.5} />
      ))}

      {/* Dark stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#080B10" roughness={0.96} metalness={0.04} />
      </mesh>
    </Canvas>
  )
}
