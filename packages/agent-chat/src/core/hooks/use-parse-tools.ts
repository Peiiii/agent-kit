import { useMemo } from 'react';
import type { Tool } from '../types';
import { getToolDefFromTool } from '../utils/tool';


export const getToolDefsFromTools = (tools: Tool[]) => {
  return tools.map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }
  })
}

export const getToolExecutorsFromTools = (tools: Tool[]) => {
  return Object.fromEntries(tools.filter((tool) => tool.execute).map((tool) => [tool.name, tool.execute!]))
}

export const getToolRenderersFromTools = (tools: Tool[]) => {
  return Object.fromEntries(tools.filter((tool) => tool.render).map((tool) => [tool.name, {
    render: tool.render!,
    definition: getToolDefFromTool(tool),
  }]))
}

export const useParseTools = (tools: Tool[]) => {
  const toolDefs = useMemo(() => getToolDefsFromTools(tools), [tools])
  const toolExecutors = useMemo(() => getToolExecutorsFromTools(tools), [tools])
  const toolRenderers = useMemo(() => getToolRenderersFromTools(tools), [tools])
  return {
    toolDefs,
    toolExecutors,
    toolRenderers,
  }
}
