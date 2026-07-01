import { Value } from "./micrograd/engine.ts"
import { MLP } from "./micrograd/neuralNet.ts"

function formatValues(values: Value[]): string {
  return values.map((value, index) => `  [${index}] ${value.toString()}`).join("\n")
}

const model = new MLP(3, [4, 4, 1])
const inputs = [new Value(2), new Value(3), new Value(-1)]
const target = new Value(1)

console.log("Model:")
console.log(model)
console.log("")
console.log("Model internals:")
console.log("")

console.log("Inputs:")
console.log(formatValues(inputs))
console.log(`Target: ${target}`)
console.log("")

const prediction = model.call(inputs)
if (Array.isArray(prediction)) {
  throw new Error("Expected a single Value output from the final MLP layer")
}

const loss = prediction.sub(target).pow(2)

console.log("Forward pass:")
console.log(`Prediction: ${prediction}`)
console.log(`Loss: ${loss}`)
console.log("")

model.zeroGrad()
loss.backward()

console.log("After backward:")
console.log(`Prediction: ${prediction}`)
console.log(`Loss: ${loss}`)
console.log("")

console.log("Parameters:")
console.log(formatValues(model.parameters()))
