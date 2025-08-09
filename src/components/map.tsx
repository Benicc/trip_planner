// src/components/Map.tsx
import React, { useRef, useState, useEffect, use } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from '@react-google-maps/api';
import { api } from '~/utils/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -33.8688,
  lng: 151.2093,
};

const locationsDefault = [
  { lat: -33.865143, lng: 151.209900 }, // Sydney
  { lat: -37.813629, lng: 144.963058 }, // Melbourne
  { lat: -27.469770, lng: 153.025131 }, // Brisbane
];

interface Props {
  tripId: string;
  toggle: () => void;
}

const Map: React.FC<Props> = ({ tripId, toggle}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: String(process.env.NEXT_PUBLIC_GOOGLE_API_KEY),
    libraries: ['places'] as ("places")[], // Required for Autocomplete
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(defaultCenter);
  const [locations, setLocations] = useState<{ lat: number; lng: number }[]>(locationsDefault);
  const [label, setLabel] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const createMarkerMutation = api.map.createMarker.useMutation({
          onSuccess: newTrip => {
            console.log("success");
          },
  });

  const getMarkersQuery = api.map.getMarkers.useQuery({ tripId });

  useEffect(() => {
    if (getMarkersQuery.data) {
      setLocations(getMarkersQuery.data.map(marker => ({ lat: marker.lat, lng: marker.lng })));
    }
  }, [getMarkersQuery.data]);


  const addMarker = (lat: number, lng: number, label: string) => {
    setLocations(prevLocations => [...prevLocations, { lat, lng }]);
    createMarkerMutation.mutate({
      tripId, lat, lng, label
    });
  }

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
        setLabel(place.name || place.formatted_address || 'Unknown Location');
        map?.panTo(location);
      }
    });
  }, [isLoaded, map]);

  useEffect(() => {
    console.log(center);
  }, [center]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="relative w-full h-[100%]">
      {/* Search Bar */}
      <div className='flex pl-[250px] pb-1.5'>
        <input
          type="text"
          placeholder="Search places..."
          ref={inputRef}
          className="absolute top-4 z-10 bg-white p-2 rounded shadow-md w-64"
        />
        <button className='absolute top-4 right-4 bg-blue-500 z-10 text-white px-4 py-2 rounded shadow-md mr-[50px]'
          onClick={() => addMarker(center.lat, center.lng, label)}
        >
          Add Marker
        </button>
        <button className='absolute top-4 right-4 bg-red-500 z-10 text-white px-4 py-2 rounded shadow-md mr-[185px]'
          onClick={() => toggle()}
        >
          Delete Markers
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {locations.map((location, index) => (
          <Marker
            key={`${location.lat}-${location.lng}`}
            position={location}
            zIndex={100}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Change color here
            }}
          />
        ))}
        {center && <Marker key={`${center.lat}-${center.lng}`} zIndex={10} position={center}/>}

      </GoogleMap>
    </div>
  );
};

export default Map;
