import { v4 } from 'uuid'

export interface Resource<T> {
  id: string
  resource: T
}

export class AgentResourceManager<T> {
  private resourceItems: Resource<T>[] = []

  addResources(resources: T[]): () => void {
    const ids = resources.map(() => v4())

    const newItems = resources.map((resource, index) => ({
      id: ids[index],
      resource,
    }))

    this.resourceItems.push(...newItems)

    return () => {
      this.resourceItems = this.resourceItems.filter(
        (item) => !ids.includes(item.id),
      )
    }
  }

  getResources(): T[] {
    return this.resourceItems.map((item) => item.resource)
  }

  clear(): void {
    this.resourceItems = []
  }
}
