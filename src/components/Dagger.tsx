import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export interface DaggerConfig {
  id: string
  label: string
  x: number
  bladeColor: string
  guardColor: string
  handleColor: string
  pommelColor: string
  emissiveColor: string
}

interface DaggerProps {
  config: DaggerConfig
  delay: number
}

const FALL_HEIGHT = 14
const FALL_DURATION = 1.5

export function Dagger({ config, delay }: DaggerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bladeMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const elapsed = useRef(0)
  const landedRef = useRef(false)
  const [showLabel, setShowLabel] = useState(false)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    elapsed.current += delta
    const t = Math.max(0, elapsed.current - delay)

    if (!landedRef.current) {
      if (t <= 0) return

      const p = Math.min(1, t / FALL_DURATION)
      // Ease-in (gravity-like acceleration)
      const eased = p * p
      groupRef.current.position.y = FALL_HEIGHT * (1 - eased)

      if (p >= 1) {
        landedRef.current = true
        groupRef.current.position.y = 0
        setShowLabel(true)
      }
    } else {
      const age = t - FALL_DURATION
      if (age < 0.5) {
        // Impact shake: rapid decay oscillation
        const shake = Math.sin(age * 55) * 0.022 * Math.pow(1 - age / 0.5, 2)
        groupRef.current.rotation.z = shake
      } else {
        // Gentle idle sway, offset per dagger so they don't sync
        groupRef.current.rotation.z = Math.sin((elapsed.current + config.x) * 0.85) * 0.005
      }
    }

    // Smooth emissive glow transition on hover
    if (bladeMatRef.current) {
      const target = hovered ? 0.4 : 0
      bladeMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        bladeMatRef.current.emissiveIntensity,
        target,
        0.08
      )
    }
  })

  const handleClick = () => {
    document.getElementById(config.id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePointerOver = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group
      ref={groupRef}
      position={[config.x, FALL_HEIGHT, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Blade: tip at local y=-2.2, base at y=0 (guard level) */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.032, 0.004, 2.2, 6]} />
        <meshStandardMaterial
          ref={bladeMatRef}
          color={config.bladeColor}
          metalness={0.92}
          roughness={0.15}
          emissive={config.emissiveColor}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Cross-guard */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.065, 0.09]} />
        <meshStandardMaterial
          color={config.guardColor}
          metalness={0.75}
          roughness={0.45}
        />
      </mesh>

      {/* Handle grip */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.058, 0.05, 0.92, 8]} />
        <meshStandardMaterial
          color={config.handleColor}
          metalness={0.2}
          roughness={0.88}
        />
      </mesh>

      {/* Pommel */}
      <mesh position={[0, 0.96, 0]}>
        <sphereGeometry args={[0.095, 8, 6]} />
        <meshStandardMaterial
          color={config.pommelColor}
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>

      {showLabel && (
        <Html
          position={[0, 1.35, 0]}
          center
          zIndexRange={[1, 1]}
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            color: hovered ? '#D6DCE5' : '#6A7A8A',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transition: 'color 0.4s ease',
            userSelect: 'none',
          }}
        >
          {config.label}
        </Html>
      )}
    </group>
  )
}
