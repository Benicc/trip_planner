import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ExpensesPopup from "~/components/expenses";
import TripView from "~/components/navbar";
import PeoplePopup from "~/components/people";
import { api } from "~/utils/api";


export default function Cost() {
    const router = useRouter()
    const {tripId} = router.query
    const [togglePeople, setTogglePeople] = useState(false);
    const [toggleExpense, setToggleExpense] = useState(false);
    const [toggleDelete, setToggleDelete] = useState(false);

    const [people, setPeople] = useState<{personId: string, name: string}[]>([]);
    const [expenses, setExpenses] = useState<{
        tripId: string,
        description: string,
        amount: number,
        paidBy: string,
        sharedWith: {personId: string, amount: number}[],
    }[]>([]);

    const getPeople = api.cost.getPeople.useQuery({tripId: String(tripId)});

    useEffect(() => {
        if (getPeople.data) {
            setPeople(
                getPeople.data
                .map((person) => ({
                    personId: person.personId,
                    name: person.name,
                    inDB: true,
                })),
            );
        }
    }, [getPeople.data]);

    const getExpenses = api.cost.getExpenses.useQuery({tripId: String(tripId)});

    useEffect(() => {
        if (getExpenses.data) {
            setExpenses(
                getExpenses.data.map((expense) => ({
                    tripId: expense.tripId,
                    description: expense.description,
                    amount: expense.amount,
                    paidBy: expense.paidBy,
                    sharedWith: expense.sharedWith as {personId: string, amount: number}[],
                })),
            );
        }
    }, [getExpenses.data]);

    useEffect(() => {

        const refetchBoth = () => {
            getPeople.refetch();
            getExpenses.refetch();
        };
        const interval = setInterval(refetchBoth, 5000); // Refetch every 5 seconds
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const calculateExpenses = (personId: string) => {
        let paidByName = people.find(person => person.personId === personId);

        const expensesForPerson = expenses.filter(expense => expense.sharedWith.some(shared => shared.personId === personId));
        let owing = [] as {paidBy: string, paidByName: string, amount: number}[];
        let res = [] as {paidBy: string, paidByName: string, amount: number}[];
        let totalExpenses = 0;

        expensesForPerson.forEach((expense) => {
            const owingDetails = expense.sharedWith.find(shared => shared.personId === personId);
            if (owingDetails) {
                owing.push({paidBy: expense.paidBy, paidByName: people.find(person => person.personId === expense.paidBy)?.name ?? "", amount: owingDetails.amount});
            }
        });

        owing.forEach((item) => {
            const existing = res.find((resItem) => resItem.paidBy === item.paidBy);
            if (existing) {
                existing.amount += item.amount;
            } else {
                res.push(item);
            }
            totalExpenses += item.amount;
        });


        return {owing: res.filter(expense => expense.paidBy !== personId), total: totalExpenses};
    }

    return (
        <div className="min-w-[1200px] h-screen bg-[#121212]">
            <div className="flex justify-between items-center">
                <TripView tripId={String(tripId)} tripName={""} navType="Costs"/>
                
                <div className="flex space-x-2 mr-2">
                    <button 
                    className="flex items-center space-x-2 bg-neutral-800 px-4 py-2 rounded-xl"
                    onClick={() => setTogglePeople(!togglePeople)}>
                        <svg height="21" width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16.9699 14.44C18.3399 14.67 19.8499 14.43 20.9099 13.72C22.3199 12.78 22.3199 11.24 20.9099 10.3C19.8399 9.59004 18.3099 9.35003 16.9399 9.59003" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.99994 14.44C5.62994 14.67 4.11994 14.43 3.05994 13.72C1.64994 12.78 1.64994 11.24 3.05994 10.3C4.12994 9.59004 5.65994 9.35003 7.02994 9.59003" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.46997 11.91 9.46997C13.34 9.46997 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        <div className="text-white text-sm">Manage People</div>
                    </button>
                    <button 
                        className="flex items-center space-x-2 bg-neutral-800 px-4 py-2 rounded-xl"
                        onClick={() => setToggleExpense(!toggleExpense)}>
                        <svg height="21" width="21" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.7003 17.1099V18.22C12.7003 18.308 12.6829 18.395 12.6492 18.4763C12.6156 18.5576 12.5662 18.6316 12.504 18.6938C12.4418 18.7561 12.3679 18.8052 12.2867 18.8389C12.2054 18.8725 12.1182 18.8899 12.0302 18.8899C11.9423 18.8899 11.8551 18.8725 11.7738 18.8389C11.6925 18.8052 11.6187 18.7561 11.5565 18.6938C11.4943 18.6316 11.4449 18.5576 11.4113 18.4763C11.3776 18.395 11.3602 18.308 11.3602 18.22V17.0801C10.9165 17.0072 10.4917 16.8468 10.1106 16.6082C9.72943 16.3695 9.39958 16.0573 9.14023 15.6899C9.04577 15.57 8.99311 15.4226 8.99023 15.27C8.99148 15.1842 9.00997 15.0995 9.04459 15.021C9.0792 14.9425 9.12927 14.8718 9.19177 14.813C9.25428 14.7542 9.32794 14.7087 9.40842 14.679C9.4889 14.6492 9.57455 14.6359 9.66025 14.6399C9.74504 14.6401 9.82883 14.6582 9.90631 14.6926C9.98379 14.7271 10.0532 14.7773 10.1102 14.8401C10.4326 15.2576 10.8657 15.5763 11.3602 15.76V13.21C10.0302 12.69 9.36023 11.9099 9.36023 10.8999C9.38027 10.3592 9.5928 9.84343 9.9595 9.44556C10.3262 9.04769 10.8229 8.79397 11.3602 8.72998V7.62988C11.3602 7.5419 11.3776 7.45482 11.4113 7.37354C11.4449 7.29225 11.4943 7.21847 11.5565 7.15625C11.6187 7.09403 11.6925 7.04466 11.7738 7.01099C11.8551 6.97732 11.9423 6.95996 12.0302 6.95996C12.1182 6.95996 12.2054 6.97732 12.2867 7.01099C12.3679 7.04466 12.4418 7.09403 12.504 7.15625C12.5662 7.21847 12.6156 7.29225 12.6492 7.37354C12.6829 7.45482 12.7003 7.5419 12.7003 7.62988V8.71997C13.0724 8.77828 13.4289 8.91103 13.7485 9.11035C14.0681 9.30967 14.3442 9.57137 14.5602 9.87988C14.6555 9.99235 14.7117 10.1329 14.7202 10.28C14.7229 10.3662 14.7084 10.4519 14.6776 10.5325C14.6467 10.613 14.6002 10.6867 14.5406 10.749C14.481 10.8114 14.4096 10.8613 14.3306 10.8958C14.2516 10.9303 14.1665 10.9487 14.0802 10.95C13.99 10.9475 13.9013 10.9257 13.8202 10.886C13.7391 10.8463 13.6675 10.7897 13.6102 10.72C13.3718 10.4221 13.0575 10.1942 12.7003 10.0601V12.3101L12.9503 12.4099C14.2203 12.9099 15.0103 13.63 15.0103 14.77C14.9954 15.3808 14.7481 15.9629 14.3189 16.3977C13.8897 16.8325 13.3108 17.0871 12.7003 17.1099ZM11.3602 11.73V10.0999C11.1988 10.1584 11.0599 10.2662 10.963 10.408C10.8662 10.5497 10.8162 10.7183 10.8203 10.8899C10.8173 11.0676 10.8669 11.2424 10.963 11.3918C11.0591 11.5413 11.1973 11.6589 11.3602 11.73ZM13.5502 14.8C13.5502 14.32 13.2203 14.03 12.7003 13.8V15.8C12.9387 15.7639 13.1561 15.6427 13.3123 15.459C13.4685 15.2752 13.553 15.0412 13.5502 14.8Z" fill="#FFFFFF"></path> <path d="M18 3.96997H6C4.93913 3.96997 3.92172 4.39146 3.17157 5.1416C2.42142 5.89175 2 6.9091 2 7.96997V17.97C2 19.0308 2.42142 20.0482 3.17157 20.7983C3.92172 21.5485 4.93913 21.97 6 21.97H18C19.0609 21.97 20.0783 21.5485 20.8284 20.7983C21.5786 20.0482 22 19.0308 22 17.97V7.96997C22 6.9091 21.5786 5.89175 20.8284 5.1416C20.0783 4.39146 19.0609 3.96997 18 3.96997Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        <div className="text-white text-sm">Create Expense</div>
                    </button>
                </div>
            </div>
            <div className="">
                {/* <CostTable tripId={String(tripId)}/> */}
                {/* <h2 className="text-white text-md px-4 pt-4">Search People:</h2>
                <input className="text-white bg-neutral-800 rounded-md ml-4 w-[50%] px-2"></input> */}
                {expenses.length > 0 && <h1 className="text-white text-xl px-4 pt-4">Expenses</h1>}
                <div className="flex justify-center w-full overflow-y-auto overflow-x-auto max-h-[300px]">
                    {expenses.length > 0 &&
                    <table className="table-auto border-separate border-spacing-0 border-gray-300">
                        <thead className="sticky top-0 bg-neutral-800 z-10">
                            <tr className="text-white bg-neutral-800">
                                <th className="border border-white p-4">Description</th>
                                <th className="border border-white p-4">Amount</th>
                                <th className="border border-white p-4">Paid By</th>
                                <th className="border border-white p-4">Shared With</th>
                                <th className="p-4 bg-[#121212]"></th>
                                <th className="p-4 bg-[#121212]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) =>
                                    <tr className="text-white">
                                        <td className="border border-white p-4">{expense.description}</td>
                                        <td className="border border-white p-4">${expense.amount}</td>
                                        <td className="border border-white p-4">{people.find(person => person.personId === expense.paidBy)?.name ?? ""}</td>
                                        <td className="border border-white p-4 w-[300px] break-words whitespace-normal">
                                            {expense.sharedWith
                                                .filter(person => person.personId !== expense.paidBy)
                                                .map(shared => `${people.find(person => person.personId === shared.personId)?.name ?? ""} ($${shared.amount.toFixed(2)})`)
                                                .join(", ")}
                                        </td>
                                        <td>
                                            <button className="p-4">
                                                <svg height="21" width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                            </button>
                                        </td>
                                        <td>
                                            <button className="p-4">
                                                <svg height="21" width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                            </button>
                                        </td>
                                    </tr>
                            )}
                        </tbody>
                    </table>
            }
                </div>
                <h1 className="text-white text-xl px-4 pt-4">People</h1>
                <div className="grid grid-cols-4 gap-4 px-4 pt-2 h-full overflow-y-auto">
                    {people.map( (person) => 
                        <div className="bg-neutral-800 text-white p-4 rounded-lg">
                            <h1 className="font-bold text-lg">{person.name}</h1>

                            <div className="flex flex-col justify-between mt-4">
                                <div className="h-[200px] overflow-y-auto">
                                    {calculateExpenses(person.personId).owing.map((expense) => 
                                        <div className="text-sm text-neutral-400">Owes {expense.paidByName}: ${expense.amount.toFixed(2)}</div>  
                                    )}
                                </div>

                                <div className="text-sm text-neutral-400 mt-4">Total Expenditure: ${calculateExpenses(person.personId).total.toFixed(2)}</div>
                            </div>

                        </div>)
                    }
                </div>
            </div>
            {togglePeople && <PeoplePopup onClose={() => setTogglePeople(!togglePeople)} getPeople={getPeople}/>}
            {toggleExpense && <ExpensesPopup onClose={() => setToggleExpense(!toggleExpense)} getPeople={getPeople}/>}
        </div>
    );
};