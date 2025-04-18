import React, { useEffect, useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";
import Cost from "~/pages/costs/[tripId]";
import MessageList from "./messageList";
import { string } from "zod";
import { v4 as uuidv4 } from 'uuid';



interface CostAssistantProps {
    setIsPaused: () => void;
    setPeople: (people: {personId: string, name: string}[]) => void;
    setExpenses: (expenses: {
        id: string,
        tripId: string,
        description: string,
        amount: number,
        paidBy: string,
        sharedWith: {personId: string, amount: number}[],
    }[]) => void;
}

const CostAssistant: React.FC<CostAssistantProps> = ({ setIsPaused, setPeople, setExpenses}) => {
    const router = useRouter();
    const {tripId} = router.query;

    const [toggleAssistant, setToggleAssistant] = useState(false);

    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]); //
    const [backendMessages, setBackendMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]); //
    const [newMessage, setNewMessage] = useState("");
    const [historyString, setHistoryString] = useState(""); //
    const ollamaResponse = api.ollama.getResponse.useQuery(historyString, {enabled:false,});

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (ollamaResponse.data) {

        let res = ""
        
        try {
            const stringRes = JSON.parse(ollamaResponse.data.response);
            let idMap: { [key: string]: string } = {};
            res = stringRes.response
            // console.log(res)
            if (stringRes.people) {
                stringRes.people.forEach((person: string) => {
                    idMap[person] = uuidv4();
                });
                setPeople(stringRes.people.map((person: string) => ({personId: idMap[person], name: person})));
            }
            if (stringRes.expenses) {
                setExpenses(stringRes.expenses.map((expense: any) => ({
                    id: uuidv4(), 
                    tripId: String(tripId), 
                    description: expense.expenseName, 
                    amount: Number(expense.amount), 
                    paidBy: idMap[expense.paidBy], 
                    sharedWith: expense.sharedWith.map((shared: any) => ({
                        personId: idMap[shared.personName], 
                        amount: Number(shared.amount)
                    })),
                })));
            }
        } catch (error) {
            res = ollamaResponse.data.response
        }

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', content: res},
        ]);
        setBackendMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', content: ollamaResponse.data.response},
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
          setIsPaused();
          ollamaResponse.refetch()
        }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        let recentMessages = backendMessages.slice(-8) 
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
        let prompt = `
            You are a structured cost tracker. Your task is to process user requests, answer their questions or prompts, add/remove people, add/remove expenses and update their finances accordingly.

            The year is currently 2025 and the conversation history with the user is shown. This includes previous plans and any user instructions:

            ${newString}

            Your response must be **only** a valid JSON object **with no additional text, explanations, or preambles**. It must strictly follow this format:
            {
                "response": "Friendly response to the request (max 200 words).",
                "people": [personName]
                "expenses": [{
                    expenseName: string,
                    amount: number,
                    paidBy: string,
                    sharedWith: {personName: string, amount: number}[]
                }]
            }

            Rules
            - Each of the fields in expenses (expenseName, amount, paidBy) must all be populated with values other than an empty string.
            - You must **preserve all existing expenses/people exactly as they are**, unless the user has specifically requested a change or removal.
            - If any information is missing or unclear, respond with a clarification request in the \`response\` field and return the plans list unchanged.
        `
        // prompt = newString
        
  
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
                <div className="flex flex-col items-center w-full bg-neutral-800 h-[550px] border-x border-[#121212]">
                    <div className="w-full h-[75%] flex justify-center mb-4">
                        <MessageList messages={messages} />
                    </div>
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