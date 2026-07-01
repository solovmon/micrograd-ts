import { Value } from "./micrograd/engine.ts"

const a = new Value(2)
const b = new Value(3)
const c = a.add(b)
const d = c.add(4)

console.log("a:", a.data)
console.log("b:", b.data)
console.log("c = a + b:", c.data)
console.log("d = c + 4:", d.data)

if (c.data !== 5) {
  throw new Error(`Expected c.data to be 5, got ${c.data}`)
}

if (d.data !== 9) {
  throw new Error(`Expected d.data to be 9, got ${d.data}`)
}
