import { useEffect, useRef, useState } from "react";

export default function Assistant() {
    //handle prompts
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
  
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
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
        <div className="w-screen h-[75%]"></div>
        <div className="flex justify-center ">
            <textarea
                // type="text"
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask anything"
                className="w-[80%] h-[80%] px-4 py-2 rounded-3xl shadow-sm focus:outline-none bg-[#202123] text-white"
                style={{
                    minHeight: '50px', // Set a minimum height for the textarea
                    maxHeight: '150px', // Limit the height to a max value
                    overflowY: 'auto', // Enable vertical scrolling when content overflows
                    transition: 'height 0.2s ease', // Smooth transition for height change
                  }}
            />
        </div>
      </div>
    );
  }
  