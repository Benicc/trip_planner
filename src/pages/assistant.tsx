import { useState } from "react";

export default function Assistant() {

    const [inputValue, setInputValue] = useState('');
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };
  
    return (
      <div className="w-screen h-screen bg-[#121212]">
        <div className="w-screen h-[70%]"></div>
        <div className="flex justify-center">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask anything"
                className="w-[80%] h-10 px-4 py-2 rounded-md shadow-sm focus:outline-none bg-[#1a1a1a] text-white"
                />
        </div>
      </div>
    );
  }
  