import requests
import discord
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

load_dotenv()

#LLM
api_url = "http://localhost:11434/api/generate"  # Ollama 3.2 API endpoint

#add a dequeue

def query_llama(input_text):
    
    # Sending a POST request to the Ollama API with the updated conversation history as the prompt
    response = requests.post(api_url, json={
        "model": "llama3.2",  # Specify the model you're using "llama3.2"
        "prompt": input_text,  # Provide the entire conversation as context
        "stream": False        # Specify whether to stream or not
    }, timeout=180)

    # Check if response is successful and return the result
    if response.status_code == 200:
        bot_response = response.json().get("response", "No response received")
        
        return bot_response
    else:
        return f"Error {response.status_code}: {response.text}"
    
@app.route('/query', methods=['POST'])
def handle_query():
    """
    Handle GET requests to the /query endpoint.
    """
    # Get the query parameter from the request
    data = request.get_json()
    query = data.get('q')
    if not query:
        return jsonify({"error": "Missing query parameter 'q'"}), 400

    # Call the query_llama function
    output = query_llama(query)

    # Return the output as a JSON response
    return jsonify({"query": query, "response": output})

if __name__ == '__main__':
    # Run the Flask app on all interfaces (0.0.0.0) and port 5000
    app.run(host='0.0.0.0', port=5000)




#when new message on prisma
#query llm
#send llm response back to prisma db


#curl -G "http://192.168.1.103:5000/query" --data-urlencode "q=hello"