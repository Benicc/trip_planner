// src/components/Map.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -33.8688,
  lng: 151.2093,
};

const Map: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: String(process.env.NEXT_PUBLIC_GOOGLE_API_KEY),
    libraries: ['places'], // Required for Autocomplete
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
      types: ['geocode', 'establishment'], // Optional
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        map?.panTo(location);
      }
    });
  }, [isLoaded, map]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="relative w-full h-full">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search places..."
        ref={inputRef}
        className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow-md w-64"
      />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {/* Optional: You can add a marker here */}
      </GoogleMap>
    </div>
  );
};

export default Map;
