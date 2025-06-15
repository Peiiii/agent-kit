import * as React from 'react'
import { AgentDemo } from './agent-demo'

export function BasicDemo() {
  return (
    <AgentDemo
      customContext={[
        {
          description: '自定义上下文',
          value: JSON.stringify({
            project: 'agent-kit',
            version: '1.0.0',
          }),
        },
      ]}
    />
  )
} 