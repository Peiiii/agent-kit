import { useState, useEffect } from 'react'

interface UseLocalStorageOptions<T> {
  key: string
  initialValue: T
  onLoad?: (data: T) => void
  onSave?: (data: T) => void
}

export function useLocalStorage<T>({
  key,
  initialValue,
  onLoad,
  onSave,
}: UseLocalStorageOptions<T>) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [data, setData] = useState<T>(initialValue)

  // 初始化时从 localStorage 读取数据
  useEffect(() => {
    if (!isInitialized) {
      const savedData = localStorage.getItem(key)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          setData(parsed)
          onLoad?.(parsed)
        } catch (error) {
          console.error(`Failed to parse saved data for key ${key}:`, error)
        }
      }
      setIsInitialized(true)
    }
  }, [isInitialized, key, onLoad])

  // 当数据变化时保存到 localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        onSave?.(data)
      } catch (error) {
        console.error(`Failed to save data for key ${key}:`, error)
      }
    }
  }, [data, isInitialized, key, onSave])

  return {
    data,
    setData,
    isInitialized,
  }
} 