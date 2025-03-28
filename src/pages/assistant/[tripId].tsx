import { useEffect, useRef, useState } from "react";
import { Client, GatewayIntentBits } from 'discord.js';
import MessageInput from "~/components/message";
import MessageList from "~/components/messageList";
import 'dotenv/config';
import { api } from "~/utils/api";
import TripView from "~/components/navbar";
import { useRouter } from "next/router";

export default function Assistant() {
    const router = useRouter()
    const {tripId} = router.query
    //handle messages
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [historyString, setHistoryString] = useState("");
    const ollamaResponse = api.ollama.getResponse.useQuery(historyString, {enabled:false,});
    

    useEffect(() => {
      if (ollamaResponse.data) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', content: ollamaResponse.data.response},
        ]);
      }
    }, [ollamaResponse.data]);

    const addMessage = () => {
      if (newMessage.trim() !== "") {
        console.log(historyString)
        // Add the user message first using functional setMessages
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'user', content: newMessage },
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
      let recentMessages = messages.slice(-8) 
      let recentMessagesSize = recentMessages.length 
      let newString = "" 
      for (let i=0; i < recentMessagesSize; i++) { 
        if (recentMessages[i]?.sender == "bot") {
          newString += recentMessages[i]?.sender + ": " + recentMessages[i]?.content.slice(0, 100) + "..." + "\n"
        } else {
          newString += recentMessages[i]?.sender + ": " + recentMessages[i]?.content + "\n"
        }
        
      } 
      newString += "user: " + e.target.value + "\n"
      setHistoryString(newString);
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
      
  
    return (
      <div className="w-screen h-screen bg-[#121212]">
        <TripView tripId={String(tripId)} tripName="" navType="Assistant"/>
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
    );
  }
  