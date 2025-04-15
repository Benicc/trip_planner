import React, { useEffect, useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";
import { v4 as uuidv4 } from 'uuid';


interface PopupProps {
    onClose: () => void;
    getPeople: any;
}

const ExpensesPopup: React.FC<PopupProps> = ({onClose, getPeople}) => {
    const [currentPeople, setCurrentPeople] = useState<{personId: string, name: string}[]>([]);

    const [selected, setSelected] = useState<{personId: string, name: string, amount: number}[]>([]);
    const [splitWith, setSplitWith] = useState(currentPeople[0] ? JSON.stringify(currentPeople[0]) : "{}");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);
    const [paidBy, setPaidBy] = useState("");

    useEffect(() => {
        if (getPeople.data) {
            setCurrentPeople(
                getPeople.data,
            );
            setSplitWith(getPeople.data[0] ? JSON.stringify(getPeople.data[0]) : "{}");
        }
    }, [getPeople.data]);

    const handleSelect = () => {
        if (splitWith === "{}") return;

        const {personId, name} = JSON.parse(splitWith);
        const selectedSize = selected.length;
        let newSelected = []
        for (let i = 0; i < selectedSize; i++) {
            if (selected[i]) {
                newSelected.push({amount: (amount / selectedSize + 1), personId: selected[i]?.personId, name: selected[i]?.name});
            }
        }
        newSelected.push({amount: (amount / selectedSize + 1), personId: personId, name: name});
        setSelected(newSelected);
    }

    const splitEqually = () => {
        const selectedSize = selected.length;
        let newSelected = []
        for (let i = 0; i < selectedSize; i++) {
            if (selected[i]) {
                newSelected.push({amount: (amount / selectedSize), personId: selected[i]?.personId ?? "", name: selected[i]?.name ?? ""});
            }
        }
        setSelected(newSelected);
    }

    const handleChange = (index: number, value: string) => {
        const newSelected = [...selected];
        if (newSelected[index]) {
            newSelected[index].amount = parseFloat(value) || 0;
        }
        setSelected(newSelected);
    };


    return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="flex flex-col justify-between bg-white p-8 rounded-lg shadow-lg space-y-4">
            <h1 className="text-xl font-bold">Create Expense</h1>

            <div className="flex items-center justify-center space-x-4">
                <div>Expense Name:</div>
                <input 
                    type="text" 
                    placeholder="Name" 
                    className="border border-2 px-8 py-2" 
                    onChange={(e) => setDescription(e.target.value)}/>
            </div>

            <div className="flex mt-8 left-0 space-x-4 items-center">
                <div>Payer:</div>
                <select className="border border-2 w-48 py-2" name="Payer" id="payer" onChange={(e) => setPaidBy(e.target.value)}>
                    {currentPeople.map((person) => <option value={JSON.stringify({personId: person.personId, name: person.name})}>{person.name}</option>)}
                </select>
            </div>
            
            <div className="flex mt-8 left-0 space-x-4 items-center">
                <div>Amount Paid: </div>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="$0.00"
                    className="border border-2 px-8 py-2" 
                    onChange={(e) => setAmount(Number(e.target.value))}>
                </input>
            </div>

            <div className="flex mt-8 left-0 space-x-4 items-center">
                <div>Split with:</div>
                <select className="border border-2 w-48 py-2" name="People" id="people" onChange={(e) => setSplitWith(e.target.value)}>
                    {currentPeople.map((person) =>
                        <option value={JSON.stringify({personId: person.personId, name: person.name})}>{person.name}</option>)}
                </select>
                <button 
                    className="border border-black p-2 px-4" 
                    onClick={() => handleSelect()}>+</button>
            </div>

            <div className="flex mt-8 left-0 space-x-4 items-center">
                <button onClick={() => {splitEqually()}}>Split Equally</button>

            </div>

            <div>
                {selected.map((person) => 
                
                <div key={uuidv4()} className="flex justify-between border border-2 px-4 py-2">
                    <div>
                        {person.name}
                    </div>

                    <div>
                        <input value={person.amount.toFixed(2)} onChange={(e) => handleChange(0, e.target.value)}></input>
                    </div>
                    
                </div>)}
            </div>

            
            <div className="flex justify-between items-center w-full">
                <button onClick={onClose} className="border border-2 px-4 py-2">Cancel</button>
                <button onClick={() => {}} className="border border-2 px-4 py-2">Update</button>
            </div>
        </div>
    </div>);
};

export default ExpensesPopup;