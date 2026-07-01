import * as util from "node:util"

export class Value {
  data: number
  grad: number
  private _backward: () => void = () => {}
  private previous: Set<Value>
  private operation: string

  constructor(
    data: number,
    children: Value[] = [],
    operation: string = ""
  ) {
    this.data      = data
    this.grad      = 0
    this.previous  = new Set(children)
    this.operation = operation
  }

  toString(): string {
    return `Value: { data=${this.data}, grad=${this.grad} }`
  }
  
  // node & bun inspect method (ex: console.log)
  [util.inspect.custom](): string {
    return this.toString()
  }
  
  add(other: Value | number): Value {
    const newOther = other instanceof Value ? other : new Value(other)  
    const out      = new Value(this.data + newOther.data, [this, newOther], "+")
    
    let backward = () => {
      this.grad     += out.grad
      newOther.grad += out.grad
    }
    out._backward = backward

    return out
  }

  mul(other: Value | number): Value {
    const newOther = other instanceof Value ? other : new Value(other)
    const out      = new Value(this.data * newOther.data, [this, newOther], "*")

    const backward = () => {
      this.grad     += newOther.data * out.grad
      newOther.grad += this.data * out.grad
    }
    out._backward = backward

    return out
  }

  pow(other: Value | number): Value {
    if (other instanceof Value && this.data <= 0) {
      throw new Error("Base must be positive when exponent is not constant")
    }

    const newOther = other instanceof Value ? other : new Value(other)
    const out = new Value(this.data ** newOther.data, [this, newOther], "^")

    const backward = () => {
      this.grad     += (newOther.data * (this.data ** (newOther.data - 1))) * out.grad
      if (other instanceof Value) {
        newOther.grad += (this.data ** newOther.data * Math.log(this.data)) * out.grad
      }
    }
    out._backward = backward

    return out
  }

  topo(): Value[] {
    const topo: Value[] = []
    const visited = new Set<Value>()
    
    const buildTopo = (node: Value) => {
      if (!visited.has(node)) {
        visited.add(node)
        for (let childNode of node.previous) {
          buildTopo(childNode)
        }
        topo.push(node)
      }
    }
    buildTopo(this)
    
    return topo
  }

  backward(): void {
    const reversedTopo = this.topo().reverse()
    this.grad  = 1
    for (let node of reversedTopo) {
      node._backward()  
    }
  }
}
