from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from bson.objectid import ObjectId

load_dotenv()

client = OpenAI()

mongo_uri = os.getenv("MONGO_URI") 
client_db = MongoClient(mongo_uri)
db = client_db["boolean_query_db"]
sessions_collection = db["sessions"]

app = Flask(__name__)
CORS(app, supports_credentials=True) 

app.secret_key = os.getenv("FLASK_SECRET_KEY", os.urandom(24).hex())  

@app.route('/start-session', methods=['POST'])
def start_session():
    try:
        session_data = {
            "messages": [
                {"role": "system", "content": "You are an expert in crafting Boolean queries for tenders, you respond only with the result Query."}
            ]
        }
        session = sessions_collection.insert_one(session_data)
        return jsonify({"message": "New session started.", "sessionId": str(session.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update-query', methods=['POST'])
def update_query():
    try:
        data = request.json
        query = data.get("query", "")
        instructions = data.get("instructions", "")
        template = data.get("template", "")
        industry_info = data.get("industryInfo", "")
        previous_conversation = data.get("previousConversation", "")
        tender_type = data.get("tenderType", "")
        translation = data.get("translation", "")
        tone = data.get("tone", "")
        session_id = data.get("sessionId", "")

        if not query or not instructions or not session_id:
            return jsonify({"error": "Query, instructions, and sessionId are required"}), 400

        session = sessions_collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found. Please start a session first."}), 400

        prompt = "Update the Boolean query based on the following inputs:\n"

        if query:
            prompt += f"Current Boolean query: {query}\n"
        if instructions:
            prompt += f"Instructions: {instructions}\n"
        if template:
            prompt += f"Template: {template}\n"
        if industry_info:
            prompt += f"Industry Info: {industry_info}\n"
        if previous_conversation:
            prompt += f"Previous Conversation: {previous_conversation}\n"
        if tender_type:
            prompt += f"Tender Type: {tender_type}\n"
        if translation:
            prompt += f"Translation: {translation}\n"
        if tone:
            prompt += f"Tone: {tone}\n"

        session['messages'].append({"role": "user", "content": prompt})

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=session['messages']
        )
        assistant_response = completion.choices[0].message.content.strip()

        session['messages'].append({"role": "assistant", "content": assistant_response})

        sessions_collection.update_one({"_id": ObjectId(session_id)}, {"$set": {"messages": session['messages']}})

        return jsonify({"updatedQuery": assistant_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-history', methods=['GET'])
def get_history():
    session_id = request.args.get('sessionId')
    if not session_id:
        return jsonify({"error": "sessionId is required"}), 400

    session = sessions_collection.find_one({"_id": ObjectId(session_id)})
    if not session:
        return jsonify({"error": "Session not found. Please start a session first."}), 400

    return jsonify({"history": session['messages']})


if __name__ == "__main__":
    app.run(debug=True)