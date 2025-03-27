interface Message {
    sender: 'user' | 'bot'; // Add a sender field
    content: string;           // Content of the message
  }
  
  interface MessageListProps {
    messages: Message[]; // Change messages type to Message[]
  }
  
  export default function MessageList({ messages }: MessageListProps) {
    return (
      <div className="flex-1 overflow-y-auto space-y-2 bg-[#121212] p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 bg-[#202123] rounded-lg w-fit max-w-[70%] text-white ${
              msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
    );
  }