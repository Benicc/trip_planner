import React, { useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";



interface PopupProps {
    onClose: () => void;
    people: any[];
    expenses: any[];
}

const ApplyChangesPopup: React.FC<PopupProps> = ({ onClose, people, expenses }) => {
    const router = useRouter();
    const {tripId} = router.query;

    const createPeople = api.cost.createPeopleApply.useMutation( {
        onSuccess: (data) => {
            console.log("People created:", data);
        }
    })

    const createExpenses = api.cost.createExpenses.useMutation( {
        onSuccess: (data) => {
            console.log("Expenses created:", data);
        }
    })

    const deletePeople = api.cost.deletePeopleByTripId.useMutation( {
        onSuccess: (data => {
            console.log("People deleted:", data);
        })
    })
    
    const deleteExpenses = api.cost.deleteExpenses.useMutation( {
        onSuccess: (data => {
            console.log("Expenses deleted:", data);
        })
    })
    
    const handleSubmit = async () => {
        await deletePeople.mutateAsync({tripId: String(tripId)});
        await deleteExpenses.mutateAsync({tripId: String(tripId)});
        await createPeople.mutateAsync({people: people.map((person) => ({
            tripId: String(tripId),
            personId: person.personId,
            name: person.name,
            }))
        });
        
        await createExpenses.mutateAsync({
            expenses: expenses.map((expense) => ({
                tripId: String(tripId),
                description: expense.description,
                amount: expense.amount,
                paidBy: expense.paidBy,
                sharedWith: expense.sharedWith,
            }))
        });
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl mb-4">Are you sure you want to delete current cost data and apply these new changes?</h2>
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