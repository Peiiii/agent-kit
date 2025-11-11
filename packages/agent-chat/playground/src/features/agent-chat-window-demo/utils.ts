export const tryParseJson = <T>(json: string): T | null => {
    if (typeof json !== 'string') {
        return json as T
    }
    try {
        return JSON.parse(json) as T
    } catch (error) {
        return null
    }
}