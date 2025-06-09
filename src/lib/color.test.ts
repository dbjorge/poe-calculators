import { describe, it } from "node:test"
import * as assert from 'node:assert'
import { Color, colorToStr, lerpColor, strToColor } from "./color"

function assertColorClose(actual: Color, expected: Color, epsilon = 0.01) {
  assert.ok(
    (
      Math.abs(actual.r - expected.r) <= epsilon &&
      Math.abs(actual.g - expected.g) <= epsilon &&
      Math.abs(actual.b - expected.b) <= epsilon
    ),
    `Expected a color near (${expected.r},${expected.g},${expected.b}) but got (${actual.r},${actual.g},${actual.b})`
  )
}
  
describe(colorToStr.name, () => {
  it('converts valid colors to strings', () => {
    assert.strictEqual(colorToStr({ r: 0, g: 0, b: 0}), '#000000')
    assert.strictEqual(colorToStr({ r: .5, g: .5, b: .5}), '#808080')
    assert.strictEqual(colorToStr({ r: 1, g: 1, b: 1}), '#ffffff')
    assert.strictEqual(colorToStr({ r: 0, g: .5, b: 1}), '#0080ff')
  })

  it('clamps values', () => {
    assert.strictEqual(colorToStr({ r: -0.001, g: -2, b: -100 }), '#000000')
    assert.strictEqual(colorToStr({ r: 1.001, g: 2, b: 100 }), '#ffffff')
  })
})

describe(strToColor.name, () => {
  it('converts valid #123456 style strings to colors', () => {
    assert.deepStrictEqual(strToColor('#000000'), { r: 0, g: 0, b: 0 })
    assertColorClose(strToColor('#7F7f7F'), { r: .5, g: .5, b: .5 })
    assert.deepStrictEqual(strToColor('#FfFFfF'), { r: 1, g: 1, b: 1 })
  })

  it('converts valid #123 style strings to colors', () => {
    assert.deepStrictEqual(strToColor('#000'), { r: 0, g: 0, b: 0 })
    assertColorClose(strToColor('#666'), { r: .4, g: .4, b: .4 })
    assert.deepStrictEqual(strToColor('#FfF'), { r: 1, g: 1, b: 1 })
  })

  it('throws on invalid input', () => {
    assert.throws(() => strToColor(''))
    assert.throws(() => strToColor('123'))
    assert.throws(() => strToColor('123456'))
    assert.throws(() => strToColor('invalid'))
    assert.throws(() => strToColor('#12g'))
    assert.throws(() => strToColor('#12345g'))
  })
})

describe(lerpColor.name, () => {
  const blue = { r: 0, g: 0, b: 1 }
  const red = { r: 1, g: 0, b: 0 }
  const purple = { r: .5, g: 0, b: .5 }
  it('interpolates correctly', () => {
    assert.deepStrictEqual(lerpColor(blue, red, 0), blue)
    assert.deepStrictEqual(lerpColor(blue, red, .5), purple)
    assert.deepStrictEqual(lerpColor(blue, red, 1), red)
  })

  it('clamps progress to the endpoints', () => {
    assert.deepStrictEqual(lerpColor(blue, red, 2), red)
    assert.deepStrictEqual(lerpColor(blue, red, -1), blue)
  })
})