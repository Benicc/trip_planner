import React, { useEffect, useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";
import { v4 as uuidv4 } from 'uuid';


interface PopupProps {
    onClose: () => void;
    getPeople: any;
}

const PeoplePopup: React.FC<PopupProps> = ({getPeople, onClose}) => {
    const router = useRouter();
    const {tripId} = router.query;

    const [currentPeople, setCurrentPeople] = useState<{personId: string, name: string, inDB: boolean}[]>([]);
    const [deletedPeople, setDeletedPeople] = useState<string[]>([]);
    const [name, setName] = useState("");

    const addPerson = () => {
        if (name === "") return;
        setCurrentPeople([...currentPeople, {personId: String(uuidv4()), name, inDB: false}]);
        setName("");
    }

    const removePerson = (personId: string, inDB: boolean) => {
        const currentPplSize = currentPeople.length;
        if (currentPplSize === 0) return;
        const newPeople = currentPeople.filter((person) => person.personId !== personId);
        setCurrentPeople(newPeople);
        if (inDB) {
            setDeletedPeople([...deletedPeople, personId]);
        }
    }

    const createPeopleMutation = api.cost.createPeople.useMutation({
        onSuccess: newPeople => {
            console.log("success");
        },
    });

    const deletePeopleMutation = api.cost.deletePeople.useMutation({
        onSuccess: newPeople => {
            console.log("success")
        },
    })

    const setActionMutation = api.action.set.useMutation(
        {
          onSuccess: () => {
            console.log("Set action count");
          },
        }
    );

    const setCostActionMutation = api.action.setCost.useMutation(
        {
          onSuccess: () => {
            console.log("Set action count");
          },
        }
    );

    // const getPeople = api.cost.getPeople.useQuery({tripId: String(tripId)});

    const handleUpdate = () => {
        const action = (c: number) => {setActionMutation.mutateAsync({tripId: String(tripId), type: "GUI", count:c})};
        const actionCost = (c: number) => {setCostActionMutation.mutateAsync({tripId: String(tripId), type: "GUI", count:c})};
        const newPeople = currentPeople.filter((person) => person.inDB === false).map((person) => person.name);

        const nDeleted = deletedPeople.length
        const nPeople = newPeople.length

        action(nDeleted)
        actionCost(nDeleted)
        action(nPeople)
        actionCost(nPeople)

        deletePeopleMutation.mutateAsync(deletedPeople)
        createPeopleMutation.mutateAsync({
            people: newPeople,
            tripId: String(tripId),
        });

        setDeletedPeople([])
        setCurrentPeople([])
        getPeople.refetch()
        onClose()
        
    }

    useEffect(() => {
        if (getPeople.data) {
            setCurrentPeople(
                getPeople.data
                .map((person: { personId: string; name: string; }) => ({
                    personId: person.personId,
                    name: person.name,
                    inDB: true,
                })),
            );
        }
    }, [getPeople.data]);


    

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col justify-between bg-white p-8 rounded-lg shadow-lg space-y-4">
                <h1 className="text-xl font-bold">Manage People</h1>

                <div className="flex items-center justify-center space-x-4">
                    <div>Create new person:</div>
                    <input 
                        type="text" 
                        value={name} 
                        placeholder="Name" 
                        className="border border-2 px-8 py-2" 
                        onChange={(e) => setName(e.target.value)}/>
                    <button className="border border-black px-4 py-2" onClick={addPerson}>+</button>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {currentPeople?.map((person) => (
                    person && person.name && person.personId ? (
                        <div key={person.personId} className="flex items-center justify-between space-x-4">
                            <div>{person.name}</div>
                            <button className="px-4 py-2" onClick={() => removePerson(person.personId, person.inDB)}>
                                <svg height="21" width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            </button>
                        </div>
                    ) : null
                    ))}
                </div>

                
                <div className="flex justify-between items-center w-full">
                    <button onClick={onClose} className="border border-2 px-4 py-2">Cancel</button>
                    <button onClick={() => {handleUpdate()}} className="border border-2 px-4 py-2">Update</button>
                </div>
            </div>
        </div>
    );
};

export default PeoplePopup;