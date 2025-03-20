import requests
import discord
from dotenv import load_dotenv
import os

load_dotenv()

#LLM
api_url = "http://localhost:11434/api/generate"  # Ollama 3.2 API endpoint

# Initialize an empty conversation history
conversation_history = ""

def query_llama(input_text):
    global conversation_history  # Use the global conversation history

    # Append the new input to the conversation history
    conversation_history += f"\nUser: {input_text}\n"
    
    # Sending a POST request to the Ollama API with the updated conversation history as the prompt
    response = requests.post(api_url, json={
        "model": "llama3.2",  # Specify the model you're using
        "prompt": conversation_history,  # Provide the entire conversation as context
        "stream": False        # Specify whether to stream or not
    }, timeout=180)

    # Check if response is successful and return the result
    if response.status_code == 200:
        bot_response = response.json().get("response", "No response received")
        
        # Append the bot's response to the conversation history
        conversation_history += f"Bot: {bot_response}\n"
        
        return bot_response
    else:
        return f"Error {response.status_code}: {response.text}"



#when new message on prisma
#query llm
#send llm response back to prisma db