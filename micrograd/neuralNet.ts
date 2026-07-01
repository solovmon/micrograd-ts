import { Value } from "./engine.ts"
import * as util from "node:util"

abstract class Module {
  zeroGrad(): void {
    for (const parameter of this.parameters()) {
      parameter.grad = 0
    }
  }

  abstract parameters(): Value[]
  
  [util.inspect.custom](): string {
    return this.toString()
  }
}

class Neuron extends Module {
  weights: Value[]
  bias: Value
  nonlin: boolean
  
  constructor(numOfInputs: number, nonlin = true) {
    super()
    this.weights = Array.from({ length: numOfInputs }, () => new Value(Math.random() * 2 - 1))
    this.bias = new Value(0)
    this.nonlin = nonlin
  }

  call(inputs: Value[]): Value {
    if (inputs.length < this.weights.length) {
      throw new Error(`Neuron expected at least ${this.weights.length} inputs, got ${inputs.length}!`)
    }
    
    let activation = this.bias
    for (let i = 0; i < this.weights.length; i++) {
      activation = activation.add(this.weights[i]!.mul(inputs[i]!))
    }
    return this.nonlin ? activation.tanh() : activation
  }

  parameters(): Value[] {
    return [...this.weights, this.bias]
  }

  override toString(): string {
    return `${this.nonlin ? "Tanh" : "Linear"} Neuron(${this.weights.length})`
  }
}

export class Layer extends Module {
  neurons: Neuron[]

  constructor(numOfInputs: number, numOfOutputs: number, nonlin = true) {
    super()
    this.neurons = Array.from({ length: numOfOutputs }, () => new Neuron(numOfInputs, nonlin))
  }

  call(inputs: Value[]): Value[] | Value {
    const outputs: Value[] = []
    for (const neuron of this.neurons) {
      outputs.push(neuron.call(inputs))
    }

    return outputs.length === 1 ? outputs[0]! : outputs
  }

  override parameters(): Value[] {
    return this.neurons.flatMap((neuron) => neuron.parameters())
  }

  override toString(): string {
    return `Layer: [${this.neurons.map((neuron) => neuron.toString()).join(", ")}]`
  }
}

export class MLP extends Module {
  layers: Layer[]

  constructor(numOfInputs: number, numOfOutputs: number[]) {
    super()
    const size = [numOfInputs, ...numOfOutputs]
   
    this.layers = []
    for(let i = 0; i < size.length - 1; i++) {
      const nonlin = i !== numOfOutputs.length - 1
      this.layers.push(new Layer(size[i]!, size[i + 1]!, nonlin))
    }
  }

  call(inputs: Value[]): Value[] | Value {
    let output: Value[] | Value = inputs

    for (const layer of this.layers) {
       const layerInput = Array.isArray(output) ? output : [output]
       output = layer.call(layerInput)
    }

    return output!
  }
  
  override parameters(): Value[] {
    return this.layers.flatMap((layer) => layer.parameters())
  }

  override toString(): string {
    return `MLP: [${this.layers.map((layer) => layer.toString()).join(", ")}]`
  }
}
