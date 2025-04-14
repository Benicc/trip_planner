import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import TripPopup from "~/components/createTrip";

import { api } from "~/utils/api";

export default function Home() {

  const [showPopup, setShowPopup] = useState(false);

  const { data: trips, isLoading, error, refetch} = api.database.getTrips.useQuery();

  useEffect(() => {
      const interval = setInterval(refetch, 10000); // Refetch every 10 seconds
  
      return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-[#121212]">
      <div className="flex flex-col space-y-4 justify-center items-center">
        <h1 className="text-3xl text-white font-bold">Trip Planner</h1>
        <p className="text-white">Trip planner application with integrated AI.</p>
        <p className="text-white">Click the button below to create a new trip.</p>
        <button onClick={togglePopup} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
          New Trip
        </button>
        {isLoading ? (
              <p className="text-white">Loading...</p>
            ) : error ? (
              <p className="text-white">Error loading bases</p>
            ) : (
              <ul className="space-y-2">
                {trips?.map((trip) => (
                  <li key={trip.tripId} className="w-[500px]">
                    <div className="flex justify-between w-full">
                      <Link href={`/assistant/${trip.tripId}`}>
                        <button className="text-white hover:underline w-full h-full">
                          {trip.tripName}
                        </button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        {showPopup && (
          <TripPopup onClose={togglePopup}/>
        )}
      </div>
    </div>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
