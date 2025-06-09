import { Color, colorToStr, lerpColor, strToColor } from '../lib/color';
import { useEffect, useRef, useState } from 'react';
import styles from './RollingMagmaCalculator.module.css'
import { add, distSqr, randomVector } from '../lib/math';

const startProjColor: Color = strToColor('#0000ff')
const endProjColor: Color = strToColor('#00ff00')

type SimulationState = 'paused' | 'once' | 'continuous'

export const RollingMagmaCalculator: React.FC = () => {
  const [chains, setChains] = useState(6)
  const [projCount, setProjCount] = useState(1)
  const [aoe, setAoe] = useState(1.0)
  const [projSpeed, setProjSpeed] = useState(1.0)
  const [enemyRadius, setEnemyRadius] = useState(.5)
  const [mineDistanceFromEnemy, setMineDistanceFromEnemy] = useState(0)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [hits, setHits] = useState(0)
  const [simulations, setSimulations] = useState(0)
  const [simulationState, setSimulationState] = useState<SimulationState>('paused')

  const frameDelayMs = 50 / simulationSpeed
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const baseProjDist = 1
  const baseProjRadius = 1

  const scale = 50

  const toggleSimulation = () => {
    setSimulationState(simulationState === 'paused' ? 'continuous' : 'paused')
  }

  const simulateOnce = () => {
    setSimulationState('once')
  }

  useEffect(() => {
    const cancelRef = { canceled: false }
    if (simulationState !== 'paused') {
      simulate(cancelRef)
    }
    return () => { cancelRef.canceled = true; }
  }, [simulationState])

  async function simulate(cancelRef: { canceled: boolean }) {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const center = {
      x: ctx.canvas.width / 2,
      y: ctx.canvas.height / 2
    }

    const enemy = center
    const projDistScaled = scale * (baseProjDist * projSpeed)
    const projRadiusScaled = scale * aoe * baseProjRadius
    const enemyRadiusScaled = scale * enemyRadius

    let simulationIndex = 0;
    let simulatedHits = 0

    while(!cancelRef.canceled) {
      simulationIndex++
      const mine = add(enemy, randomVector(mineDistanceFromEnemy * scale))
      const projLocs = [] // Invariant: length === projCount
      for (let i = 0; i < projCount; i++) {
        projLocs.push(structuredClone(mine))
      }

      // Clear canvas
      ctx.fillStyle='#dddddd'
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Draw circle to represent enemy
      ctx.fillStyle = '#dd0000'
      ctx.beginPath()
      ctx.arc(center.x, center.y, enemyRadiusScaled, 0, 2 * Math.PI)
      ctx.fill()

      // chainIndex = 0 represents the initial hit, ie, there are
      // chains + 1 total hits
      for (let chainIndex = 0; chainIndex <= chains; chainIndex++) {
        await new Promise(r => setTimeout(r, frameDelayMs))
        if (cancelRef.canceled) { return; }

        const projColor = lerpColor(startProjColor, endProjColor, chainIndex / chains)

        let anyProjHit = false
        for (let projIndex = 0; projIndex < projCount; projIndex++) {
          const proj = add(projLocs[projIndex], randomVector(projDistScaled))
          projLocs[projIndex] = proj

          const distSqrBetweenCenters = distSqr(enemy, proj)
          const projHit = distSqrBetweenCenters < Math.pow(enemyRadiusScaled + projRadiusScaled, 2)
          anyProjHit ||= projHit

          ctx.beginPath()
          ctx.arc(proj.x, proj.y, projRadiusScaled, 0, 2 * Math.PI)
          ctx.fillStyle = colorToStr(projColor) + '22'
          ctx.fill()
          ctx.strokeStyle = '2px ' + colorToStr(projColor) + '99'
          ctx.stroke()
        }

        if (anyProjHit) {
          simulatedHits++
        }
      }

      setHits(simulatedHits)
      setSimulations(simulationIndex)
      if (simulationState !== 'continuous') {
        setSimulationState('paused')
        return;
      }
    }
  }

  type NumberFieldProps = {
    label: string,
    value: number,
    setValue: (number) => void
  }
  const NumberField: React.FC<NumberFieldProps> = ({label, value, setValue}) => {
    return (
      <label className={styles.numberField}>
        <input
          disabled={simulationState !== 'paused'}
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
        />
        {label}
      </label>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Rolling Magma Simulator</h1>
      <NumberField label="Projectile count" value={projCount} setValue={setProjCount} />
      <NumberField label="AOE modifier" value={aoe} setValue={setAoe} />
      <NumberField label="Projectile speed modifier" value={projSpeed} setValue={setProjSpeed} />
      <NumberField label="Enemy radius" value={enemyRadius} setValue={setEnemyRadius} />
      <NumberField label="Mine distance from enemy" value={mineDistanceFromEnemy} setValue={setMineDistanceFromEnemy} />
      <NumberField label="Simulation speed" value={simulationSpeed} setValue={setSimulationSpeed} />
      
      <button className={styles.actionButton} onClick={simulateOnce}>Simulate once</button>
      <button className={styles.actionButton} onClick={toggleSimulation}>{simulationState === 'paused' ? 'Start' : 'Stop'} simulation</button>
      <canvas className={styles.simulationCanvas} ref={canvasRef} width={600} height={600}/>
      <div>Average hits per simulation: {hits / simulations}</div>
    </div>
  )
};
