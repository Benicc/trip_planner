import React, { use, useEffect, useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";
import Cost from "~/pages/costs/[tripId]";
import MessageList from "./messageList";
import { string } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { get } from "http";
import { caPrompt } from "~/pages/prompts/caPrompt";



interface CostAssistantProps {
    setPeople: (people: {personId: string, name: string}[]) => void;
    setExpenses: (expenses: {
        id: string,
        tripId: string,
        description: string,
        amount: number,
        paidBy: string,
        sharedWith: {personId: string, amount: number}[],
    }[]) => void;
    getPeople: any;
    getExpenses: any;
    getAssistantData: any;
    people: {personId: string, name: string}[];
    expenses: {
        id: string,
        tripId: string,
        description: string,
        amount: number,
        paidBy: string,
        sharedWith: {personId: string, amount: number}[],
    }[];
    toggleRevert: boolean;
    setToggleRevert: () => void;
    toggleApply: boolean;
}

function stableStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  
    if (Array.isArray(obj)) {
      return `[${obj.map(stableStringify).join(',')}]`;
    }
  
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = sortedKeys.map(key => 
      `"${key}":${stableStringify(obj[key])}`
    );
  
    return `{${sortedObj.join(',')}}`;
}

  
const compareArrays = (arr1: any[], arr2: any[]) => {
    const map1 = new Map<string, number>();
    const map2 = new Map<string, number>();

    // Count occurrences of each object (stringified) in arr1
    for (const obj of arr1) {
      const key = stableStringify(obj);
      map1.set(key, (map1.get(key) || 0) + 1);
    }

    // Count occurrences in arr2
    for (const obj of arr2) {
      const key = stableStringify(obj);
      map2.set(key, (map2.get(key) || 0) + 1);
    }

    let created = 0;
    let deleted = 0;

    // Check what’s been deleted or changed
    for (const [key, count1] of map1.entries()) {
      const count2 = map2.get(key) || 0;
      if (count2 < count1) {
        deleted += count1 - count2;
      }
    }

    // Check what’s been newly created
    for (const [key, count2] of map2.entries()) {
      const count1 = map1.get(key) || 0;
      if (count2 > count1) {
        created += count2 - count1;
      }
    }
    console.log(map1, map2);
    console.log("Created: ", created, "Deleted: ", deleted)
    return created + deleted;
};

const CostAssistant: React.FC<CostAssistantProps> = ({ setPeople, setExpenses, 
    getPeople, getExpenses, getAssistantData, people, expenses, 
    toggleRevert, setToggleRevert, toggleApply}) => {
    const router = useRouter();
    const {tripId} = router.query;

    const [toggleAssistant, setToggleAssistant] = useState(false);

    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]); //
    const [backendMessages, setBackendMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]); //
    const [newMessage, setNewMessage] = useState("");
    const [historyString, setHistoryString] = useState(""); //
    const [changed, setChanged] = useState(false); //
    const [inputValue, setInputValue] = useState('');
    const ollamaResponse = api.chatGPT.getResponse.useQuery(historyString, {enabled:false,});
    const updateAssistant = api.costAssistant.updateAssistant.useMutation();

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
    
    //handle revert
    useEffect(() => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const handleRevert = async () => {
            updateAssistant.mutate({
                tripId: String(tripId),
                costMessages: [],
                costBackendMessages: [],
                costPeople: [],
                costExpenses: [],
                costHistoryString: "",
                costChanged: false,
            });

            setMessages([]);
            setBackendMessages([]);
            setPeople([]);
            setExpenses([]);
            setHistoryString("");
            setChanged(false);

            getPeople.refetch();
            getExpenses.refetch();
            getAssistantData.refetch();
            setToggleRevert();

            await delay(2000);
            window.location.reload();
        };

        if (toggleRevert) {
            handleRevert();
        }
    }, [toggleRevert]);

    //handle apply assistant changes
    useEffect(() => {
        if (toggleApply) {
            setToggleAssistant(false);
        }
    }, [toggleApply]);

    useEffect(() => {
        if (getAssistantData.data && !getAssistantData.isLoading) {
            setMessages(getAssistantData.data.costMessages);
            setBackendMessages(getAssistantData.data.costBackendMessages);
            setPeople(getAssistantData.data.costPeople);
            setExpenses(getAssistantData.data.costExpenses);
            setHistoryString(getAssistantData.data.costHistoryString);
            setChanged(getAssistantData.data.costChanged);

            if (!getAssistantData.data.costChanged) {
                updateAssistant.mutate({
                    tripId: String(tripId),
                    costMessages: messages,
                    costBackendMessages: backendMessages,
                    costPeople: getPeople.data,
                    costExpenses: getExpenses.data,
                    costHistoryString: historyString,
                    costChanged: false,
                });
            }
        }
    }
    , [getAssistantData.data, getPeople.data, getExpenses.data]);

    const handleUpdateAssistant = async () => {
        updateAssistant.mutate({
            tripId: String(tripId),
            costMessages: messages,
            costBackendMessages: backendMessages,
            costHistoryString: historyString,
            costPeople: people,
            costExpenses: expenses,
            costChanged: true,
        });
    }

    useEffect(() => {
        if (messages.length || backendMessages.length || historyString.length) {
            handleUpdateAssistant();
        }
    }, [messages, backendMessages]);


    useEffect(() => {
        if (ollamaResponse.data) {

        let res = ""
        
        try {
            const stringRes = JSON.parse(ollamaResponse.data);
            let idMap: { [key: string]: string } = {};
            res = stringRes.response

            console.log("Ollama response: ", stringRes);

            //dont send whole data only send required operations
            // stringRes = {response: , addPeople:[], removePeople:[], addExpenses:[], removeExpenses:[]}

            let updatedPeople = structuredClone(people);
            updatedPeople = updatedPeople.map((person: { personId: string; name: string }) => {
                idMap[person.name] = person.personId;
                return person;
            });

            let updatedExpenses = structuredClone(expenses);

            if ("removePeople" in stringRes) {
                stringRes.removePeople.forEach((person: string) => {
                    const index = updatedPeople.findIndex((p) => p.name === person);
                    if (index !== -1) {
                        updatedPeople.splice(index, 1);
                    }
                });
            }

            if ("addPeople" in stringRes) {
                stringRes.addPeople.forEach((person: string) => {
                    if (person) {
                        let newId = uuidv4();
                        idMap[person] = newId;
                        updatedPeople.push({ personId: newId, name: person });
                    }
                });
            }

            if ("removeExpenses" in stringRes) {
                stringRes.removeExpenses.forEach((expense: string) => {
                    const index = updatedExpenses.findIndex((exp) => exp.description === expense);
                    if (index !== -1) {
                        updatedExpenses.splice(index, 1);
                    }
                });
            }

            if ("addExpenses" in stringRes) {
                stringRes.addExpenses.forEach((expense: any) => {
                    if (expense.expenseName && expense.amount && expense.paidBy && expense.sharedWith) {
                        updatedExpenses.push({
                            id: uuidv4(),
                            tripId: String(tripId),
                            description: expense.expenseName,
                            amount: Number(expense.amount),
                            paidBy: idMap[expense.paidBy] ?? "",
                            sharedWith: expense.sharedWith.map((shared: any) => ({
                                personId: idMap[shared.personName] ?? "",
                                amount: Number(shared.amount)
                            })),
                        });
                    }
                });
            }

            // console.log(res)
            if (updatedPeople) {
                const actionCountPeople = compareArrays(
                    people.map((person: { personId: string; name: string }) => person.name),
                    updatedPeople.map((person: { personId: string; name: string }) => person.name),
                );
                setActionMutation.mutateAsync({
                    tripId: String(tripId),
                    type: "AI",
                    count: actionCountPeople,
                });
                setCostActionMutation.mutateAsync({
                    tripId: String(tripId),
                    type: "AI",
                    count: actionCountPeople,
                });
                setPeople(updatedPeople);
            }
            if (updatedExpenses) {  
                const actionCountExpenses = compareArrays(
                    expenses,
                    updatedExpenses
                );
                setActionMutation.mutateAsync({
                    tripId: String(tripId),
                    type: "AI",
                    count: actionCountExpenses,
                });
                setCostActionMutation.mutateAsync({
                    tripId: String(tripId),
                    type: "AI",
                    count: actionCountExpenses,
                });
                setExpenses(updatedExpenses);
            }
        } catch (error) {
            res = ollamaResponse.data
        }

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', content: res},
        ]);
        setBackendMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', content: ollamaResponse.data},
        ]);
        }
    }, [ollamaResponse.data]);

    const addMessage = () => {
        if (newMessage.trim() !== "") {
          //console.log(historyString)
          // Add the user message first using functional setMessages
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', content: newMessage },
          ]);
          setBackendMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', content: newMessage},
          ]);
          
          // Now, fetch the Ollama response
          setInputValue("");
          ollamaResponse.refetch()
        }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        let recentMessages = backendMessages.slice(-2) 
        let recentMessagesSize = recentMessages.length 
        let newString = "" 
        for (let i=0; i < recentMessagesSize; i++) { 
          // if (recentMessages[i]?.sender == "bot") {
          //   newString += recentMessages[i]?.sender + ": " + recentMessages[i]?.content.slice(0, 100) + "..." + "\n"
          // } else {
          // if (recentMessages[i]?.sender == "bot") {
          //   newString += recentMessages[i]?.sender + ": " + JSON.parse(recentMessages[i]?.content || "{\"response\": \"error\"}").response + "\n"
          // } else {
          newString += recentMessages[i]?.sender + ": " + recentMessages[i]?.content + "\n"
          // }
          // // }
          
        } 
        newString += "user: " + e.target.value + "\n"
        let prompt = caPrompt(newString, people, expenses);
        
  
        setHistoryString(prompt);
        setNewMessage(e.target.value)
    };
  

    return(
        <div className="fixed bottom-0 right-8 w-[500px] z-50">
            <button className="flex items-center justify-between h-[30px] w-full bg-gray-800 px-4 border-x border-t border-[#121212]"
                onClick={() => setToggleAssistant(!toggleAssistant)}>
                <h1 className="text-white text-lg">Assistant</h1>
                <div className="right-0">
                    {!toggleAssistant && <svg fill="#FFFFFF" height="15" width="15" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.735 511.735"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M508.788,371.087L263.455,125.753c-4.16-4.16-10.88-4.16-15.04,0L2.975,371.087c-4.053,4.267-3.947,10.987,0.213,15.04 c4.16,3.947,10.667,3.947,14.827,0l237.867-237.76l237.76,237.76c4.267,4.053,10.987,3.947,15.04-0.213 C512.734,381.753,512.734,375.247,508.788,371.087z"></path> </g> </g> </g></svg>}
                    {toggleAssistant && <svg fill="#FFFFFF" height="15" width="15" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.735 511.735" transform="rotate(180)" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M508.788,371.087L263.455,125.753c-4.16-4.16-10.88-4.16-15.04,0L2.975,371.087c-4.053,4.267-3.947,10.987,0.213,15.04 c4.16,3.947,10.667,3.947,14.827,0l237.867-237.76l237.76,237.76c4.267,4.053,10.987,3.947,15.04-0.213 C512.734,381.753,512.734,375.247,508.788,371.087z"></path> </g> </g> </g></svg>}
                </div>
            </button>

            {toggleAssistant && 
                <div className="w-full bg-neutral-800 h-[550px] border-x border-[#121212]">
                    <div className="w-full h-[70%] flex justify-center mb-1">
                        <MessageList messages={messages}/>
                    </div>
                    {!ollamaResponse.isFetching && <div className="sticky flex text-gray-500 pt-4"/>}
                    {ollamaResponse.isFetching && (
                        <div className="sticky flex text-gray-500 ml-[13%]">
                            <h3 className="text-white text-sm">Generating</h3>
                            <span className="animate-bounce text-white text-xl delay-[200ms]">.</span>
                            <span className="animate-bounce text-white text-xl delay-[800ms]">.</span>
                            <span className="animate-bounce text-white text-xl delay-[1600ms]">.</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center w-full">
                        <div className="w-[80%] h-[90%] px-4 py-2 rounded-3xl shadow-sm focus:outline-none bg-[#202123] text-white">
                            <textarea
                                value={inputValue}
                                onChange={handleInputChange}
                                disabled={ollamaResponse.isFetching}
                                placeholder="Ask anything"
                                className="w-[100%] h-[55%] px-4 py-2 rounded-3xl shadow-sm focus:outline-none bg-[#202123] text-white resize-none"
                                style={{
                                    minHeight: '50px', // Set a minimum height for the textarea
                                    maxHeight: '120px', // Limit the height to a max value
                                    overflowY: 'auto', // Enable vertical scrolling when content overflows
                                    transition: 'height 0.2s ease', // Smooth transition for height change
                                }}
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={addMessage} disabled={ollamaResponse.isFetching}>
                                    <svg width="35" height="35" fill="#000000" viewBox="0 0 24 24" id="up-arrow-circle" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><circle id="primary" cx="12" cy="12" r="10" fill="#ffffff"></circle><path id="secondary" d="M14.83,9.5,12.69,6.38a.82.82,0,0,0-1.38,0L9.17,9.5A1,1,0,0,0,9.86,11H11v6a1,1,0,0,0,2,0V11h1.14A1,1,0,0,0,14.83,9.5Z" fill="#202123"></path></g></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>}
                {/* <button className="text-white" onClick={() => setPeople([{personId:"test", name:"bill"}, {personId:"test2", name:"test"}])}>Set People</button>
                <button className="text-white" onClick={() => setExpenses([{id:"test", tripId: String(tripId), description:"test", amount: 50, paidBy: "test", sharedWith:[{personId:"test", amount: 10}]}])}>Set Expenses</button> */}
        </div>
    );
};


export default CostAssistant;