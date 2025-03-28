import React, { useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";

interface PopupProps {
    onClose: () => void;
}

const PlanPopup: React.FC<PopupProps> = ({ onClose }) => {
    const router = useRouter();
    const {tripId} = router.query;

    const colours = ["red", "blue", "green", "yellow", "black"];

    const [planType, setPlanType] = useState("Activity");
    const [planName, setPlanName] = useState("");
    const [colour, setColour] = useState("bg-blue-500");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const createPlanMutation = api.database.createPlan.useMutation({
        onSuccess: newPlan => {
            console.log("success");
        },
        });

    const handleCreateTrip = async () => {
        createPlanMutation.mutate({
            tripId: String(tripId),
            planType,
            planName,
            colour,
            date,
            startTime,
            endTime,
            additional: {},
        });
    
        onClose()
    }
    
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col justify-between bg-white p-8 rounded-lg shadow-lg space-y-4">
                <h1 className="text-xl font-bold">New Plan</h1>

                <div className="space-y-2">
                <h3>Plan type:</h3>
                <select className="w-full" onChange={(e) => setPlanType(e.target.value)}>
                    <option className="p-4" value="Activity">Activity</option>
                    <option className="p-4" value="Flight">Flight</option>
                    <option className="p-4" value="Accomodation">Accomodation</option>
                    <option className="p-4" value="Restaurant">Restaurant</option>
                </select>
                </div>
                
                <div>
                    <h3>Plan name:</h3>
                    <input 
                    type="text" 
                    className="border border-gray-300 rounded-md p-2 w-full" 
                    placeholder="Enter plan name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <h3>Colour:</h3>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="color"
                            value="bg-blue-500"
                            className="hidden peer"
                            onChange={() => setColour("bg-blue-500")}
                        />
                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-transparent peer-checked:border-black"></div>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="color"
                            value="bg-red-500"
                            className="hidden peer"
                            onChange={() => setColour("bg-red-500")}
                        />
                        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-transparent peer-checked:border-black"></div>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="color"
                            value="bg-green-500"
                            className="hidden peer"
                            onChange={() => setColour("bg-green-500")}
                        />
                        <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-transparent peer-checked:border-black"></div>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="color"
                            value="bg-yellow-500"
                            className="hidden peer"
                            onChange={() => setColour("bg-yellow-500")}
                        />
                        <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-transparent peer-checked:border-black"></div>
                    </label>
                </div>

                <div>
                    <h3>Date:</h3>
                    <input 
                    type="date" 
                    className="border border-gray-300 rounded-md p-2 w-full" 
                    placeholder="Enter plan name"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div>
                    <h3>Start time:</h3>
                    <input 
                    type="time" 
                    className="border border-gray-300 rounded-md p-2 w-full" 
                    placeholder="Enter plan name"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>

                <div>
                    <h3>End time:</h3>
                    <input 
                    type="time" 
                    className="border border-gray-300 rounded-md p-2 w-full" 
                    placeholder="Enter plan name"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
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

export default PlanPopup;