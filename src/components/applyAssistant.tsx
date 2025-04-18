import React, { useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";



interface PopupProps {
    onClose: () => void;
    plans: any[];
}

const ApplyChangesPopup: React.FC<PopupProps> = ({ onClose, plans }) => {
    const router = useRouter();
    const {tripId} = router.query;

    const createPlans = api.database.createPlans.useMutation( {
        onSuccess: (data) => {
            console.log("Plans created:", data);
        }
    })

    const deletePlans = api.database.deletePlans.useMutation( {
        onSuccess: (data => {
            console.log("Plans created:", data);
        })
    })
    
    const handleSubmit = async () => {
        await deletePlans.mutateAsync(String(tripId));
        await createPlans.mutateAsync({tripId: String(tripId), plans});
        onClose();
    }
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl mb-4">Are you sure you want to delete current timetable data and apply these new changes?</h2>
                <div className='flex justify-between'>
                    <button
                    className="border border-2  px-4 py-2"
                    onClick={onClose}
                    >
                    Close
                    </button>
                    <button
                    className="border border-2 text-green-500 px-4 py-2"
                    onClick={handleSubmit}
                    >
                    Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyChangesPopup;