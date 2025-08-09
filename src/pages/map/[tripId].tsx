import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import TripPopup from "~/components/createTrip";

import { api } from "~/utils/api";

import Map from '~/components/map';
import TripView from "~/components/navbar";
import { useRouter } from "next/router";
import { Marker } from "@react-google-maps/api";
import MarkersPopup from "~/components/manageMarkers";



export default function MapPage() {

  const router = useRouter()
  const {tripId} = router.query
  const [toggleMarkersPopup, setToggleMarkersPopup] = useState(false);

  const getMarkersQuery = api.map.getMarkers.useQuery({ tripId: String(tripId) });

   useEffect(() => {
      const interval = setInterval(getMarkersQuery.refetch, 10000); // Refetch every 10 seconds
  
      return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  return (
    <div className="flex flex-col left-0 w-screen h-screen bg-[#121212]">
      <TripView tripId={String(tripId)} tripName={""} navType="Map"/>
      <div className="h-[90%] w-full">
          <Map tripId={String(tripId)} toggle={() => setToggleMarkersPopup(!toggleMarkersPopup)}/>
      </div>
      {toggleMarkersPopup && <MarkersPopup onClose={() => setToggleMarkersPopup(false)} getMarkers={getMarkersQuery}/>}
    </div>
  );
}
