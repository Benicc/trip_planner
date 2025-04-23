import React, { useEffect, useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";
import { v4 as uuidv4 } from 'uuid';


interface PopupProps {
    onClose: () => void;
    getPeople: any;
}

const ExpensesPopup: React.FC<PopupProps> = ({onClose, getPeople}) => {
    const router = useRouter();
    const tripId = router.query.tripId as string;
    const [currentPeople, setCurrentPeople] = useState<{personId: string, name: string}[]>([]);
    const [people, setPeople] = useState<{personId: string, name: string}[]>([]);

    const [selected, setSelected] = useState<{personId: string, name: string, amount: number}[]>([]);
    const [splitWith, setSplitWith] = useState(currentPeople[0] ? JSON.stringify(currentPeople[0]) : "{}");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);
    const [paidBy, setPaidBy] = useState(people[0] ? JSON.stringify(people[0]) : "{}");

    useEffect(() => {
        if (getPeople.data) {
            setCurrentPeople(
                getPeople.data,
            );
            setPeople(
                getPeople.data,
            );
            setSplitWith(getPeople.data[0] ? JSON.stringify(getPeople.data[0]) : "{}");
            setPaidBy(getPeople.data[0] ? JSON.stringify(getPeople.data[0]) : "{}");
        }
    }, [getPeople.data]);

    const handleSelect = () => {
        if (splitWith === "{}") return;
    
        const { personId, name } = JSON.parse(splitWith);
    
        const alreadySelected = selected.some(p => p.personId === personId);
        if (alreadySelected) return;
    
        setSelected((prevSelected) => [
            ...prevSelected,
            { amount: 0, personId, name }
        ]);
    
        setCurrentPeople((prevPeople) =>
            prevPeople.filter((person) => person.personId !== personId)
        );
    };

    useEffect(() => {
        if (currentPeople.length > 0) {
            setSplitWith(JSON.stringify(currentPeople[0]));
        } else {
            setSplitWith("{}");
        }
    }, [currentPeople]);

    const handleChange = (index: number, value: string) => {
        const newSelected = [...selected];
        if (newSelected[index]) {
            newSelected[index].amount = Number(value) || 0;
        }
        setSelected(newSelected);
        console.log(selected);
    };

    const splitEqually = () => {
        const selectedSize = selected.length;
        let newSelected = []
        for (let i = 0; i < selectedSize; i++) {
            if (selected[i]) {
                newSelected.push({amount: Number((amount / selectedSize).toFixed(2)), personId: selected[i]?.personId ?? "", name: selected[i]?.name ?? ""});
            }
        }
        setSelected(newSelected);

    }

    const handleRemove = (personId: string) => {
        setCurrentPeople((prevPeople) => [
            ...prevPeople,
            selected.find((person) => person.personId === personId)!,
        ]);
        setSelected((prevSelected) => prevSelected.filter((person) => person.personId !== personId));
    };

    const handleClose = () => {
        setSelected([]);
        setCurrentPeople(getPeople.data);
        setPeople(getPeople.data);
        setSplitWith(getPeople.data[0] ? JSON.stringify(getPeople.data[0]) : "{}");
        setDescription("");
        setAmount(0);
        setPaidBy(getPeople.data[0] ? JSON.stringify(getPeople.data[0]) : "{}");
        onClose();
    }

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

    const createExpenseMutation = api.cost.createExpense.useMutation({
        onSuccess: () => {
            getPeople.refetch();
            handleClose();
        },
    });

    const handleCreateExpense = () => {
        const action = () => {incrementActionMutation.mutateAsync({tripId: String(tripId), type: "GUI"})};
        const actionCost = () => {incrementCostActionMutation.mutateAsync({tripId: String(tripId), type: "GUI"})};
        const sharedWith = selected.map((person) => ({ personId: person.personId, amount: person.amount }));
        console.log({
            tripId,
            description,
            amount,
            paidBy: paidBy,
            sharedWith,
        });
        
        createExpenseMutation.mutate({
            tripId,
            description,
            amount,
            paidBy: JSON.parse(paidBy).personId,
            sharedWith,
        });
        action()
        actionCost()
        handleClose();
    }




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
                    {people.map((person) => <option value={JSON.stringify({personId: person.personId, name: person.name})}>{person.name}</option>)}
                </select>
            </div>
            
            <div className="flex mt-8 left-0 space-x-4 items-center">
                <div>Amount Paid: </div>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={0}
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
                <button className="border border-black p-2" onClick={() => {splitEqually()}}>Split Equally</button>

            </div>

            <div className="overflow-auto max-h-48">
                {selected.map((person, index) => 
                
                <div key={person.personId} className="flex justify-between items-center border border-2 px-4 py-2 mt-2">
                    <div>
                        {person.name}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div>$</div>
                        <input
                        value={person.amount}
                        
                        onChange={(e) => handleChange(index, e.target.value)}
                        type="decimal"
                        className="border border-2 w-[100px]"></input>
                        <button className="px-4 py-2" onClick={() => handleRemove(person.personId)}>-</button>
                    </div>
                    
                </div>)}
            </div>

            
            <div className="flex justify-between items-center w-full">
                <button onClick={handleClose} className="border border-2 px-4 py-2">Cancel</button>
                <button onClick={handleCreateExpense} className="border border-2 px-4 py-2">Update</button>
            </div>
        </div>
    </div>);
};

export default ExpensesPopup;