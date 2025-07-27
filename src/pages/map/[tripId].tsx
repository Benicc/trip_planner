import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import TripPopup from "~/components/createTrip";

import { api } from "~/utils/api";

import Map from '~/components/map';



export default function MapPage() {


  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-[#121212]">
        <div className="h-[80%] w-full">
            <Map />
        </div>
    </div>
  );
}
