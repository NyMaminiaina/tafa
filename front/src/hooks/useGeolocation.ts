import { useState, useEffect, useCallback } from 'react';
import { updateProfile } from '../api/api';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported' | null;
}

interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => void;
  updateUserLocation: () => Promise<boolean>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionStatus: null,
  });

  // Check if geolocation is supported
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Check permission status
  useEffect(() => {
    if (!isSupported) {
      setState(prev => ({ ...prev, permissionStatus: 'unsupported' }));
      return;
    }

    // Check if permissions API is available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permissionStatus: result.state as 'prompt' | 'granted' | 'denied' }));

        // Listen for permission changes
        result.onchange = () => {
          setState(prev => ({ ...prev, permissionStatus: result.state as 'prompt' | 'granted' | 'denied' }));
        };
      }).catch(() => {
        // Permissions API not fully supported, set to prompt
        setState(prev => ({ ...prev, permissionStatus: 'prompt' }));
      });
    } else {
      setState(prev => ({ ...prev, permissionStatus: 'prompt' }));
    }
  }, [isSupported]);

  // Request current location
  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        }));
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vous avez refusé l\'accès à votre localisation';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé';
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, [isSupported]);

  // Update user location on the backend
  const updateUserLocation = useCallback(async (): Promise<boolean> => {
    if (!state.latitude || !state.longitude) {
      return false;
    }

    try {
      const response = await updateProfile({
        latitude: state.latitude,
        longitude: state.longitude,
      });

      return !response.error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la localisation:', error);
      return false;
    }
  }, [state.latitude, state.longitude]);

  return {
    ...state,
    requestLocation,
    updateUserLocation,
  };
}

// Helper function to calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default useGeolocation;
