export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export function errorName(err: unknown): string | undefined {
    if (!isRecord(err)) return undefined
    const name = err['name']
    return typeof name === 'string' ? name : undefined
}

export function isAbortLikeError(err: unknown): boolean {
    const name = errorName(err)
    return name === 'AbortError' || name === 'APIUserAbortError'
}

export function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message
    if (isRecord(err) && typeof err['message'] === 'string') return err['message']
    return String(err)
}
