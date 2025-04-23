import React, { useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";

interface PopupProps {
    onClose: () => void;
    action: () => void;
}

const DeleteExpensePopup: React.FC<PopupProps> = ({ onClose, action}) => {
    const router = useRouter();
    const { tripId } = router.query;

    const incrementActionMutation = api.action.increment.useMutation(
        {
        onSuccess: () => {
            console.log("Incremended action count");
        },
        }
    );

    const incrementCostActionMutation = api.action.incrementCost.useMutation(
        {
        onSuccess: () => {
            console.log("Incremended action count");
        },
        }
    );
    const prodAction = () => {incrementActionMutation.mutateAsync({tripId: String(tripId), type: "GUI"})};
    const actionCost = () => {incrementCostActionMutation.mutateAsync({tripId: String(tripId), type: "GUI"})};

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col justify-between bg-white p-8 rounded-lg shadow-lg space-y-4 text-black">
                <h1 className="text-xl font-bold">Delete Expense</h1>
                <p>Are you sure you want to delete this expense?</p>
                <div className="flex justify-between items-center w-[400px]">
                    <button onClick={onClose} className="border border-2 px-4 py-2">Cancel</button>
                    <button onClick={() => {action();prodAction();actionCost();onClose();}} className="border border-2 px-4 py-2 bg-red-500 text-white">Delete</button>
                </div>
            </div> 
        </div>
                
    );
};

export default DeleteExpensePopup;