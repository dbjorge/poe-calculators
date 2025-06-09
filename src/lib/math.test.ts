import { describe, it } from "node:test"
import * as assert from 'node:assert'
import { add, clamp, distSqr, lerp, magnitude, randomVector } from "./math"

function assertCloseTo(actual: number, expected: number, epsilon = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `Expected ${actual} to be close to ${expected} (within ${epsilon})`
  )
}
  
describe(clamp.name, () => {
  it('clamps', () => {
    assert.strictEqual(clamp(2, 4, -3), 2)
    assert.strictEqual(clamp(2, 4, 3), 3)
    assert.strictEqual(clamp(2, 4, 5), 4)
  })
})

describe(lerp.name, () => {
  it('interpolates forwards', () => {
    assert.strictEqual(lerp(1, 5, 0), 1)
    assert.strictEqual(lerp(1, 5, .5), 3)
    assert.strictEqual(lerp(1, 5, 1), 5)
  })

  it('interpolates backwards', () => {
    assert.strictEqual(lerp(5, 1, 0), 5)
    assert.strictEqual(lerp(5, 1, .5), 3)
    assert.strictEqual(lerp(5, 1, 1), 1)
  })

  it('noops if the interpolation range is of width 0', () => {
    assert.strictEqual(lerp(3, 3, 0), 3)
    assert.strictEqual(lerp(3, 3, .5), 3)
    assert.strictEqual(lerp(3, 3, 1), 3)
  })

  it('clamps', () => {
    assert.strictEqual(lerp(1, 5, -1), 1)
    assert.strictEqual(lerp(1, 5, 2), 5)
  })
})

describe(add.name, () => {
  it('adds 2 points', () => {
    assert.deepEqual(add({ x: 1, y: 2 }, { x: 10, y: 20 }), { x: 11, y: 22 })
  })
})

describe(magnitude.name, () => {
  it('correctly calculates magnitude', () => {
    assert.strictEqual(magnitude({ x: 1, y: 0 }), 1)
    assert.strictEqual(magnitude({ x: 0, y: 1 }), 1)
    assert.strictEqual(magnitude({ x: 3, y: 4 }), 5)
    assert.strictEqual(magnitude({ x: -3, y: -4 }), 5)
  })
})

describe(distSqr.name, () => {
  it('correctly calculates distance squared', () => {
    assert.strictEqual(distSqr({ x: 0, y: 0 }, { x: 1, y: 0 }), 1)
    assert.strictEqual(distSqr({ x: 0, y: 0 }, { x: 3, y: -4 }), 25)
    assert.strictEqual(distSqr({ x: -1, y: 1 }, { x: 2, y: -2 }), 18)
  })
})

describe(randomVector.name, () => {
  it('produces diffierent vectors', () => {
    let v1 = randomVector(3);
    let v2 = randomVector(3);
    let v3 = randomVector(3);

    assert.notStrictEqual(v1.x, v2.x)
    assert.notStrictEqual(v1.x, v3.x)
    assert.notStrictEqual(v2.x, v3.x)

    assert.notStrictEqual(v1.y, v2.y)
    assert.notStrictEqual(v1.y, v3.y)
    assert.notStrictEqual(v2.y, v3.y)
  })

  it('produces vectors of the requested magnitude', () => {
    assertCloseTo(magnitude(randomVector(1)), 1)
    assertCloseTo(magnitude(randomVector(27)), 27)
  })
})