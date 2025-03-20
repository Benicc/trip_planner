import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    onSendMessage(input);
    setInput(""); // Clear input after sending
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded-lg bg-[#202123] text-white focus:outline-none"
      />
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 rounded-lg"
      >
        Send
      </button>
    </div>
  );
}