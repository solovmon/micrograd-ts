import { Value } from "./micrograd/engine.ts"

function assertEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
}

const numA = 2
const a = new Value(numA)
const numB = 4
const b = new Value(numB)
const numC = 10
const c = new Value(numC)
const numD = 2.5
const d = new Value(numD)

const e = a.add(b).add(3)
const numE = numA + numB + 3
const f = e.mul(c).add(6)
const numF = numE * numC + 6
const g = f.pow(d).mul(2)
const numG = numF**numD * 2
const h = g.pow(4)
const numH = numG**4

console.log("e: ", e)
console.log("f: ", f)
console.log("g: ", g)
console.log("h: ", h)


assertEqual(e.data, numE, "e")
assertEqual(f.data, numF, "f")
assertEqual(g.data, numG, "g")
assertEqual(h.data, numH, "h")

console.log(h.topo())
