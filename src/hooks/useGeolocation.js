import { useEffect, useState } from 'react'

export function useGeolocation() {
  const [state, setState] = useState({
    coords: null,
    error: null,
    loading: false,
  })

  const request = () => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: 'Geolokatsiya qo‘llab-quvvatlanmaydi', loading: false })
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        })
      },
      (err) => {
        setState({ coords: null, error: err.message, loading: false })
      },
      { timeout: 8000 }
    )
  }

  useEffect(() => {
    request()
  }, [])

  return { ...state, request }
}
