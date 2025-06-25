import { useEffect, useRef, useState } from "react";
import { Client, GatewayIntentBits } from 'discord.js';
import MessageInput from "~/components/message";
import MessageList from "~/components/messageList";
import 'dotenv/config';
import { api } from "~/utils/api";
import TripView from "~/components/navbar";
import { useRouter } from "next/router";
import AssistantTimetable from "~/components/assistantTimetable";
import { any } from "zod";
import { min } from "date-fns";
import { create } from "domain";
import { ttInitialPrompt, ttPrompt } from "../prompts/ttPrompt";


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

export default function Assistant() {
    // const events = [
    //   { date: "2025-03-25", startTime: "09:00", endTime: "11:00", planName: "Math Class", planId: "1", colour:"bg-blue-500"},
    //   { date: "2025-03-26", startTime: "10:00", endTime: "13:00", planName: "Science Lecture", planId: "2", colour:"bg-yellow-500" },
    //   { date: "2025-03-27", startTime: "14:00", endTime: "19:00", planName: "History Seminar", planId: "3", colour:"bg-green-500" },
    //   { date: "2025-03-29", startTime: "12:00", endTime: "14:00", planName: "Programming Workshop", planId: "4", colour:"bg-red-500"},
    // ];



    const router = useRouter()
    const {tripId} = router.query
    //handle messages

    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]); //
    const [backendMessages, setBackendMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]); //
    const [events, setEvents] = useState<{ date: string, startTime: string, endTime: string, planName: string, colour:string, planId:string, planType: string, notes: string}[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [historyString, setHistoryString] = useState(""); //
    const [changed, setChanged] = useState(false)
    const ollamaResponse = api.deepseek.getResponse.useQuery(historyString, {enabled:false,});

    const assistantData = api.database.getAssistantData.useQuery(String(tripId));
    const timetableData = api.database.getPlans.useQuery(String(tripId));

    const updateAssistant = api.database.saveAssistant.useMutation({
      onSuccess: assistantData => {
          console.log("success");
      },
    });

    const setActionMutation = api.action.set.useMutation(
      {
        onSuccess: () => {
          console.log("Set action count");
        },
      }
    );

    const setTimetableActionMutation = api.action.setTimetable.useMutation(
      {
        onSuccess: () => {
          console.log("Set action count");
        },
      }
    );

    // useEffect(() => {
    //   if (timetableData.data && !timetableData.isLoading) {
    //     const timetable = timetableData.data as { date: string, startTime: string, endTime: string, planName: string, colour:string, planId:string, planType: string}[];
    //     if (!changed && !(messages.length || backendMessages.length || historyString.length || events.length)) {
    //       updateAssistant.mutate({
    //           tripId: String(tripId),
    //           messages,
    //           backendMessages,
    //           historyString,
    //           events: timetable,
    //           changed: true,
    //       });
    //     }
    //   }
    // }, [timetableData.data]);

    useEffect(() => {
      if (assistantData.data && !assistantData.isLoading) {
        const assistantMessages = assistantData.data?.messages as { sender: 'user' | 'bot'; content: string }[] || []
        const assistantBackend =assistantData.data?.backendMessages as { sender: 'user' | 'bot'; content: string }[] || []
        const assistantHistory = assistantData.data?.historyString || ""
        const assistantEvents = assistantData.data?.events as { date: string, startTime: string, endTime: string, planName: string, colour:string, planId:string, planType: string, notes: string}[] || []
        const assistantChanged = assistantData.data?.changed || false;
        setMessages(assistantMessages);
        setBackendMessages(assistantBackend);
        setHistoryString(assistantHistory);
        setEvents(assistantEvents);
        setChanged(assistantChanged);

        if (!assistantChanged) {
          const timetable = timetableData.data as { date: string, startTime: string, endTime: string, planName: string, colour:string, planId:string, planType: string, notes: string}[];
          updateAssistant.mutate({
            tripId: String(tripId),
            messages,
            backendMessages,
            historyString,
            events: timetable, //[...assistantEvents, ...timetable],
            changed: true,
          });
        }
      }
    }, [assistantData.data]);

    const handleUpdateAssistant = async () => {
        updateAssistant.mutate({
            tripId: String(tripId),
            messages,
            backendMessages,
            historyString,
            events,
            changed,
        });
    }

    useEffect(() => {
      if (messages.length || backendMessages.length || historyString.length || events.length) {
        handleUpdateAssistant();
      }
    }, [messages, backendMessages, events]);
    

    useEffect(() => {
      if (ollamaResponse.data) {

        let res = ""

        try {
          const stringRes = JSON.parse(ollamaResponse.data);
          res = stringRes.response;

          console.log("Ollama response: ", stringRes);

          let newEvents = structuredClone(events);

          stringRes.remove.forEach((plan: any) => {
            const index = newEvents.findIndex((event) => event.planName === plan.planName);
            if (index !== -1) {
              newEvents.splice(index, 1);
            }
          });

          stringRes.add.forEach((plan: { date: string, startTime: string, endTime: string, planName: string, colour:string, planId:string, planType: string, notes: string}) => {
            newEvents.push(plan);
          });

          //for productivity: before setting events check if the number of changes and update counter
          const eventsProcessed = newEvents.map(({ planId, ...rest }) => rest);
          const actionCount = compareArrays(eventsProcessed, newEvents)
          setActionMutation.mutate({
            tripId: String(tripId),
            type: "AI",
            count: actionCount,
          });
          setTimetableActionMutation.mutate({
            tripId: String(tripId),
            type: "AI",
            count: actionCount,
          });
          setEvents(newEvents);
        } catch (error) {
          res = ollamaResponse.data;
        }
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', content: res},
        ]);
        setBackendMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', content: ollamaResponse.data},
        ]);
        console.log(events);
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


    //handle prompts
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
  
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
        try {
          newString += recentMessages[i]?.sender + ": " + JSON.parse(recentMessages[i]?.content || "{\"response\": \"error\"}").response + "\n"
        } catch (error) {
          newString += recentMessages[i]?.sender + ": " + recentMessages[i]?.content + "\n"
        }
        // }
        // // }
        
      } 
      newString += "user: " + e.target.value + "\n"
      let prompt = ""
      // if (recentMessagesSize <= 1) {
      prompt = ttInitialPrompt(newString, events);
      // } else {
      //   prompt = ttPrompt(newString, events);
      // }
      

      setHistoryString(prompt);
      setNewMessage(e.target.value)
    };

    useEffect(() => {
        if (inputRef.current) {
          // Reset the height to auto before calculating scrollHeight
          inputRef.current.style.height = 'auto';
          // Set the height to scrollHeight to expand based on content
          inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }, [inputValue]); // Trigger when the input value changes

    const handleRefresh = async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      updateAssistant.mutate({
          tripId: String(tripId),
          messages: [],
          backendMessages: [],
          historyString: "",
          events: [],
          changed: false,
      });

      setMessages([]);
      setBackendMessages([]);
      setHistoryString("");
      setEvents([]);
      setChanged(false);

      timetableData.refetch()
      assistantData.refetch()

      await delay(2000);
      window.location.reload();
    }
      
  
    return (
      <div className="flex w-full h-screen bg-[#121212]">
        <div className="w-[40%] min-w-[600px]">
          <div className="flex justify-between">
            <TripView tripId={String(tripId)} tripName="" navType="Assistant"/>
            <div className="text-white pr-[3%] pt-2">
              <button onClick={handleRefresh}>
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
              </button>
            </div>
          </div>
          <div className="w-[100%] h-[70%]">
            <div className="flex justify-center h-[96%] overflow-auto">
              <div className="w-[70%] h-[50%]">
                <MessageList messages={messages} />
              </div>
            </div>
            {ollamaResponse.isFetching && (
            <div className="sticky flex items-center gap-1 text-gray-500 pl-[12%] pt-1">
              <h3 className="text-white">Generating</h3>
              <span className="animate-bounce text-white text-xl delay-[200ms]">.</span>
              <span className="animate-bounce text-white text-xl delay-[800ms]">.</span>
              <span className="animate-bounce text-white text-xl delay-[1600ms]">.</span>
            </div>
            )}
          </div>

          <div className="flex justify-center pt-4">
              <div className="w-[80%] h-[15%] px-4 py-2 rounded-3xl shadow-sm focus:outline-none bg-[#202123] text-white">
                <textarea
                    // type="text"
                    //ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={ollamaResponse.isFetching}
                    placeholder="Ask anything"
                    className="w-[100%] h-[100%] px-4 py-2 rounded-3xl shadow-sm focus:outline-none bg-[#202123] text-white resize-none"
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
        </div>
        <div className="w-[60%]">
          {!timetableData.isLoading && !assistantData.isLoading && <AssistantTimetable plans={events}/>}
        </div>
      </div>
    );
  }
  