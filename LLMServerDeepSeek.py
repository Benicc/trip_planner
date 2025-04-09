from openai import OpenAI
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

def query_deepSeek(input_text):
    client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
    )

    completion = client.chat.completions.create(
    extra_headers={
    },
    extra_body={},
    model="deepseek/deepseek-v3-base:free",
    messages=[
        {
        "role": "user",
        "content": input_text,
        }
    ]
    )
    print(completion.choices[0].message.content)
    return (completion.choices[0].message.content)
    
@app.route('/query', methods=['GET'])
def handle_query():
    """
    Handle GET requests to the /query endpoint.
    """
    # Get the query parameter from the request
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Missing query parameter 'q'"}), 400

    # Call the query_llama function
    output = query_deepSeek(query)

    # Return the output as a JSON response
    print(query)
    return jsonify({"query": query, "response": output})

if __name__ == '__main__':
    # Run the Flask app on all interfaces (0.0.0.0) and port 5000
    query_deepSeek("hello")
    app.run(host='0.0.0.0', port=5000)
    app.run(host='localhost', port=5000)

