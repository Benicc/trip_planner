import React, { useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";


interface PopupProps {
    onClose: () => void;
    refetch: () => void;
    planId: string;
    planName: string;
}

const DeletePopup: React.FC<PopupProps> = ({ onClose, refetch, planId, planName}) => {

    const router = useRouter();
    const {tripId} = router.query;
    

    const { mutate: deletePlan,  isError, isSuccess,} = api.database.deletePlan.useMutation({
        onSuccess: () => {
          // Redirect to another page after deletion (e.g., the home page)
          router.push(`/timetable/${tripId}`); // Replace with the path you want to redirect to
        },
        onError: (err) => {
          // Handle the error, maybe show a message
          console.error('Error deleting base:', err.message);
        },
      });

    const handleDelete = async () => {
        deletePlan({ planId });
        onClose();
        refetch();
    };
    
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl mb-4">Are you sure you want to delete &quot;{planName}&quot; plan?</h2>
            <div className='flex justify-between'>
                <button
                className="border border-2  px-4 py-2"
                onClick={onClose}
                >
                Close
                </button>
                <button
                className="border border-2 text-red-500 px-4 py-2"
                onClick={handleDelete}
                >
                Delete
                </button>
            </div>
      </div>
        </div>
    );

};
export default DeletePopup;