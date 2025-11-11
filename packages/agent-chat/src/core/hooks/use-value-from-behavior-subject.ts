import { useEffect, useState } from "react"
import { BehaviorSubject, Observable } from "rxjs"

export function useValueFromBehaviorSubject<T>(behaviorSubject: BehaviorSubject<T>) {
    const [state, setState] = useState<T>(behaviorSubject.getValue())
    useEffect(() => {
        const subscription = behaviorSubject.subscribe(setState)
        return () => subscription.unsubscribe()
    }, [behaviorSubject])
    return state
}

export const useValueFromObservable = <T>(observable: Observable<T>, defaultValue: T) => {
    const [state, setState] = useState<T>(defaultValue)
    useEffect(() => {
        const subscription = observable.subscribe(setState)
        return () => subscription.unsubscribe()
    }, [observable])
    return state
}