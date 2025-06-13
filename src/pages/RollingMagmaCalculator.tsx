import { Color, colorToStr, lerpColor, strToColor } from "../lib/color";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./RollingMagmaCalculator.module.css";
import { add, clamp, distSqr, randomVector } from "../lib/math";

const FRAME_DELAY_MS = 0

// Per wiki
const BASE_PROJ_SPACING_METRES = 1.6;
// Per PoB, includes +0.4m from level 20
const BASE_PROJ_RADIUS_METRES = 1.8;

type NumberFieldScenario = [string /* name */, string /* value */];
const CHAIN_SCENARIOS: NumberFieldScenario[] = [
  ["20/20 gem, gloomfang", "7"],
  ["20/20 gem, +2 chain gloves", "8"],
  ["20/20 gem, +2 chain gloves, gloomfang", "9"],
  ["20/20 gem", "6"],
  ["20/0 gem", "4"],
];
const RETURN_PROBABILITY_SCENARIOS: NumberFieldScenario[] = [
  ["Shrapnel Specialist", "0.5"],
  ["Base", "0.0"],
  ["Legacy settlers enchant", "0.0"],
  ["Nimis", "1.0"],
]
const PROJ_COUNT_SCENARIOS: NumberFieldScenario[] = [
  ["base", "1"],
  ["volley", "3"],
  ["greater volley", "5"],
  ["sire of shards", "5"],
  ["awakened gmp", "6"],
  ["awakened gmp, greater volley, sire of shards", "14"],
];
const PROJ_SPEED_SCENARIOS: NumberFieldScenario[] = [
  ["1x ascendancy small, slower proj support, gloomfang", "1.0"],
  ["1x ascendancy small, slower proj support", "0.76"],
  ["1x ascendancy small, gloomfang", "1.43"],
  ["1x ascendancy small", "1.08"],
];
const AOE_SCENARIOS: NumberFieldScenario[] = [
  ["base", "1.0"],
  ["goratha build", "2.59"],
  ["goratha build + beacon of hope", "3.39"],
];
const ENEMY_RADIUS_SCENARIOS: NumberFieldScenario[] = [
  // from https://www.youtube.com/watch?v=5X4YQ5O5JlE
  ["generic monster", "0.3"],
  ["large boss", "1.1"],
  // from wiki
  ["humanoid", "0.2"],
];

const startProjColor: Color = strToColor("#0000ff");
const endProjColor: Color = strToColor("#00ff00");

type SimulationState = "paused" | "once" | "continuous";

type NumberFieldProps = {
  label: string;
  value: string;
  disabled?: boolean;
  setValue: (number) => void;
  scenarios?: NumberFieldScenario[];
};
const NumberField: React.FC<NumberFieldProps> = ({
  label,
  disabled,
  value,
  setValue,
  scenarios,
}) => {
  const [scenarioName, setScenarioName] = useState<string | null>(
    scenarios?.[0]?.[0] ?? null
  );

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setScenarioName(null);
      setValue(e.target.value);
    },
    [setValue]
  );

  const onSelectScenario: React.ChangeEventHandler<HTMLSelectElement> =
    useCallback(
      (e) => {
        setScenarioName(scenarios[e.target.selectedIndex][0] ?? null);
        setValue(scenarios[e.target.selectedIndex][1]);
      },
      [setValue, scenarios]
    );

  return (
    <div className={styles.numberField}>
      <label>
        <input disabled={disabled} value={value} onChange={onInputChange} />
        {label}
      </label>
      {scenarios && (
        <select className={styles.scenarioSelect} aria-label={`${label} scenarios`} disabled={disabled} onChange={onSelectScenario} value={scenarioName ?? ''}>
          {scenarios.map(([name, val]) => (
            <option key={name} value={name}>
              {name} ({val})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export const RollingMagmaCalculator: React.FC = () => {
  // Form fields
  const [chainsStr, setChains] = useState(CHAIN_SCENARIOS[0][1]);
  const [returnProbabilityStr, setReturnProbability] = useState(RETURN_PROBABILITY_SCENARIOS[0][1]);
  const [projCountStr, setProjCount] = useState(PROJ_COUNT_SCENARIOS[0][1]);
  const [aoeStr, setAoe] = useState(AOE_SCENARIOS[0][1]);
  const [projSpeedStr, setProjSpeed] = useState(PROJ_SPEED_SCENARIOS[0][1]);
  const [enemyRadiusStr, setEnemyRadius] = useState(
    ENEMY_RADIUS_SCENARIOS[0][1]
  );
  const [mineDistanceFromEnemyStr, setMineDistanceFromEnemy] = useState("0");

  const chains = clamp(0, 1000000, parseInt(chainsStr));
  const returnProbability = clamp(0, 1, parseFloat(returnProbabilityStr))
  const projCount = clamp(1, 1000000, parseInt(projCountStr));
  const aoe = clamp(0.001, 1000000, parseFloat(aoeStr));
  const projSpeed = clamp(0, 1000000, parseFloat(projSpeedStr));
  const enemyRadius = clamp(0.001, 1000000, parseFloat(enemyRadiusStr));
  const mineDistanceFromEnemy = clamp(0, 1000000, parseFloat(mineDistanceFromEnemyStr));

  // Simulation state/results
  const [hits, setHits] = useState(0);
  const [simulations, setSimulations] = useState(0);
  const [simulationState, setSimulationState] =
    useState<SimulationState>("paused");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scale = 50;

  const toggleSimulation = () => {
    setSimulationState(simulationState === "paused" ? "continuous" : "paused");
  };

  const simulateOnce = () => {
    setSimulationState("once");
  };

  useEffect(() => {
    const cancelRef = { canceled: false };
    if (simulationState !== "paused") {
      simulate(cancelRef);
    }
    return () => {
      cancelRef.canceled = true;
    };
  }, [simulationState]);

  async function simulate(cancelRef: { canceled: boolean }) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const center = {
      x: ctx.canvas.width / 2,
      y: ctx.canvas.height / 2,
    };

    const enemy = center;
    const projDistScaled = scale * (BASE_PROJ_SPACING_METRES * projSpeed);
    const projRadiusScaled = scale * Math.sqrt(aoe) * BASE_PROJ_RADIUS_METRES;
    const enemyRadiusScaled = scale * enemyRadius;

    let simulationIndex = 0;
    let simulatedHits = 0;

    while (!cancelRef.canceled) {
      await new Promise((r) => setTimeout(r, FRAME_DELAY_MS));
      if (cancelRef.canceled) {
        return;
      }

      simulationIndex++;
      const mine = add(enemy, randomVector(mineDistanceFromEnemy * scale));
      const returns = Math.random() <= returnProbability ? 1 : 0
      const projLocs = []; // Invariant: length === projCount
      for (let i = 0; i < projCount; i++) {
        projLocs.push(structuredClone(mine));
      }

      // Clear canvas
      ctx.fillStyle = "#dddddd";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw circle to represent enemy
      ctx.fillStyle = "#dd0000";
      ctx.beginPath();
      ctx.arc(center.x, center.y, enemyRadiusScaled, 0, 2 * Math.PI);
      ctx.fill();

      // chainIndex = 0 represents the initial hit, ie, there are
      // chains + 1 total hits, plus possibly a return
      for (let chainIndex = 0; chainIndex <= (chains + returns); chainIndex++) {

        const projColor = lerpColor(
          startProjColor,
          endProjColor,
          chainIndex / (chains + 1)
        );

        let anyProjHit = false;
        for (let projIndex = 0; projIndex < projCount; projIndex++) {
          const proj = add(projLocs[projIndex], randomVector(projDistScaled));
          projLocs[projIndex] = proj;

          const distSqrBetweenCenters = distSqr(enemy, proj);
          const projHit =
            distSqrBetweenCenters <
            Math.pow(enemyRadiusScaled + projRadiusScaled, 2);
          anyProjHit ||= projHit;

          ctx.beginPath();
          ctx.arc(proj.x, proj.y, projRadiusScaled, 0, 2 * Math.PI);
          ctx.fillStyle = colorToStr(projColor) + "22";
          ctx.fill();
          ctx.strokeStyle = "2px " + colorToStr(projColor) + "99";
          ctx.stroke();
        }

        if (anyProjHit) {
          simulatedHits++;
        }
      }

      setHits(simulatedHits);
      setSimulations(simulationIndex);
      if (simulationState !== "continuous") {
        setSimulationState("paused");
        return;
      }
    }
  }

  const fieldsDisabled = simulationState !== "paused";

  return (
    <div className={styles.container}>
      <h1>Rolling Magma Simulator</h1>
      <NumberField
        label="Chains"
        disabled={fieldsDisabled}
        value={chainsStr}
        setValue={setChains}
        scenarios={CHAIN_SCENARIOS}
      />
      <NumberField
        label="Return chance"
        disabled={fieldsDisabled}
        value={returnProbabilityStr}
        setValue={setReturnProbability}
        scenarios={RETURN_PROBABILITY_SCENARIOS}
      />
      <NumberField
        label="Projectile count"
        disabled={fieldsDisabled}
        value={projCountStr}
        setValue={setProjCount}
        scenarios={PROJ_COUNT_SCENARIOS}
      />
      <NumberField
        label="Inc AOE modifier"
        disabled={fieldsDisabled}
        value={aoeStr}
        setValue={setAoe}
        scenarios={AOE_SCENARIOS}
      />
      <NumberField
        label="Projectile speed modifier"
        disabled={fieldsDisabled}
        value={projSpeedStr}
        setValue={setProjSpeed}
        scenarios={PROJ_SPEED_SCENARIOS}
      />
      <NumberField
        label="Enemy radius (metres)"
        disabled={fieldsDisabled}
        value={enemyRadiusStr}
        setValue={setEnemyRadius}
        scenarios={ENEMY_RADIUS_SCENARIOS}
      />
      <NumberField
        label="Mine distance from enemy (metres)"
        disabled={fieldsDisabled}
        value={mineDistanceFromEnemyStr}
        setValue={setMineDistanceFromEnemy}
      />

      <div>
        <button className={styles.actionButton} onClick={toggleSimulation}>
          {simulationState === "paused" ? "Start" : "Stop"} simulation
        </button>
        <button className={styles.actionButton} onClick={simulateOnce} disabled={fieldsDisabled}>
          Simulate once
        </button>
      </div>
      <div className={styles.results}>
        <span className={styles.result}>Simulations: {simulations}</span>
        <span className={styles.result}>
          Avg hits/mine: {(hits / simulations).toFixed(2)}
        </span>
      </div>
      <canvas
        className={styles.simulationCanvas}
        ref={canvasRef}
        width={600}
        height={600}
      />
    </div>
  );
};
