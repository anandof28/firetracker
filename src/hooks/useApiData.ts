import { useEffect, useState } from 'react'

interface UseApiDataResult<T> {
  data: T[]
  loading: boolean
  error: string
  refetch: () => void
}

export function useApiData<T>(endpoint: string): UseApiDataResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      setError('')
      const response = await fetch(endpoint)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError(`Failed to fetch data from ${endpoint}`)
      }
    } catch (err) {
      setError(`Failed to fetch data from ${endpoint}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [endpoint])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

export function useMultipleApiData(endpoints: string[]) {
  const [data, setData] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAllData = async () => {
    try {
      setError('')
      setLoading(true)
      
      const requests = endpoints.map(endpoint => 
        fetch(endpoint).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}`)
          }
          return response.json()
        })
      )

      const results = await Promise.all(requests)
      
      const dataObject = endpoints.reduce((acc, endpoint, index) => {
        const key = endpoint.split('/').pop() || endpoint
        acc[key] = results[index]
        return acc
      }, {} as Record<string, any[]>)

      setData(dataObject)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [endpoints.join(',')])

  return {
    data,
    loading,
    error,
    refetch: fetchAllData
  }
}
