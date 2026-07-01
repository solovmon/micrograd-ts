export class Value {
  data: number
  grad: number
  private backward: () => void = () => {}
  private previous: Set<Value>
  private operation: string

  constructor(
    data: number,
    children: Value[] = [],
    operation: string = ""
  ) {
    this.data = data
    this.grad = 0
    this.previous = new Set(children)
    this.operation = operation
  }
  
  add(other: Value | number): Value {
    const newOther = other instanceof Value ? other : new Value(other)  
    const out = new Value(this.data + newOther.data, [this, newOther], '+')
    
    let backward = () => {
      this.grad += out.grad
      newOther.grad += out.grad
    }
    out.backward = backward

    return out
  }
}
