import React, { useState } from "react";
import { api } from '~/utils/api';

interface PopupProps {
  onClose: () => void;
}


const TripPopup: React.FC<PopupProps> = ({ onClose }) => {


    const [tripName, setTripName] = useState("");
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");  // Keep as Date object
    const [endDate, setEndDate] = useState("");      // Keep as Date object

    const createTripMutation = api.database.createTrip.useMutation({
        onSuccess: newTrip => {
          console.log("success");
        },
      });

    const handleCreateTrip = async () => {
        createTripMutation.mutate({
          tripName,
          destination,
          startDate,
          endDate,
        });
    
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col justify-between bg-white p-8 rounded-lg shadow-lg space-y-4">
                <h1 className="text-xl font-bold">New Trip</h1>

                <div>
                <h3>Trip name:</h3>
                <input 
                type="text" 
                className="border border-gray-300 rounded-md p-2 w-full" 
                placeholder="Enter trip name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                />
                </div>

                <div>
                <h3>Destination city:</h3>
                <input 
                    type="text" 
                    className="border border-gray-300 rounded-md p-2 w-full" 
                    placeholder="Enter destination city"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
                </div>
                
                <div>
                    <h3>Start date:</h3>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
                    />
                </div>

                <div>
                <h3>End date:</h3>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
                />
                </div>
    
    
                <div className="flex justify-between items-center w-[400px]">
                    <button onClick={onClose} className="border border-2 px-4 py-2">Cancel</button>
                    <button onClick={handleCreateTrip} className="border border-2 px-4 py-2">Create</button>
                </div>
            </div>
        </div>
    );
  };
  
  export default TripPopup;