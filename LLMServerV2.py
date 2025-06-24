import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify

app = Flask(__name__)

load_dotenv()

def query_LLM(input_text):
    api_url = "http://localhost:11434/api/generate"
    response = requests.post(api_url, json={
        "model": "llama3.2",
        "prompt": input_text,
        "stream": False
    }, timeout=180)

    if response.status_code == 200:
        return response.json().get("response", "No response received")
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
    output = query_LLM(query)

    # Return the output as a JSON response
    return jsonify({"query": query, "response": output})


if __name__ == '__main__':
    # Load environment variables from .env file
    print(query_LLM("Hello, world!"))  # Test the LLM query function
    app.run(host='0.0.0.0', port=5000)
