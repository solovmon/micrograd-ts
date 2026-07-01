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

  div(other: Value | number): Value {
    const otherValue = other instanceof Value ? other : new Value(other)
    if (otherValue.data == 0) {
      throw new Error("Can't divide by 0!")
    }
    const out      = new Value(this.data / otherValue.data, [this, otherValue], "/")

    const backward = () => {
      this.grad      += (1 / otherValue.data) * out.grad
     otherValue.grad += (-this.data / (otherValue.data * otherValue.data)) * out.grad
    }
    out._backward = backward

    return out
  }

  pow(other: Value | number): Value {
    if (other instanceof Value && this.data <= 0) {
      throw new Error("Base must be positive!")
    }

    const otherValue = other instanceof Value ? other : new Value(other)
    const out = new Value(this.data ** otherValue.data, [this, otherValue], "^")

    const backward = () => {
     this.grad       += (otherValue.data * (this.data ** (otherValue.data - 1))) * out.grad
     otherValue.grad += (other instanceof Value) ? (this.data ** otherValue.data * Math.log(this.data)) * out.grad : 0 
    }
    out._backward = backward

    return out
  }

  exp(): Value {
    const out = new Value(Math.exp(this.data), [this], "exp")

    const backward = () => {
      this.grad += out.data * out.grad
    }

    out._backward = backward

    return out
  }

  sub(other: Value | number) {
    const otherValue = other instanceof Value ? other : new Value(other)
    const out = new Value(this.data - otherValue.data, [this, otherValue], "-")

    let backward = () => {
      this.grad       += out.grad
      otherValue.grad -= out.grad
    }
    out._backward = backward

    return out
  }

  tanh(): Value {
    const x   = this.data
    const t   = (Math.exp(2 * x) - 1)/(Math.exp(2 * x) + 1)
    const out = new Value (t, [this], "tanh")
    
    const backward = () => {
      this.grad += (1 - t**2) * out.grad
    }
    out._backward = backward
    
    return out
  }
  
  neg(): Value {
    return this.mul(-1)
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
