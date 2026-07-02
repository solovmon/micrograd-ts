import { Value } from "./engine.ts"

export function trace(root: Value): [Value[], [Value, Value][]] {
  const nodes = new Set<Value>()
  const edges: [Value, Value][] = []

  const build = (node: Value): void => {
    if (!nodes.has(node)) {
      nodes.add(node)
      for (const child of node.children) {
        edges.push([child, node])
        build(child)
      }
    }
  }

  build(root)

return [[...nodes], edges]
}

