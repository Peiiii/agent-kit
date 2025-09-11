import { useEffect, useState } from "react"
import { BehaviorSubject } from "rxjs"

export function useValueFromBehaviorSubject<T>(behaviorSubject: BehaviorSubject<T>) {
    const [state, setState] = useState<T>(behaviorSubject.getValue())
    useEffect(() => {
        const subscription = behaviorSubject.subscribe(setState)
        return () => subscription.unsubscribe()
    }, [behaviorSubject])
    return state
}