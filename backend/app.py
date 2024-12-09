from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

load_dotenv()

client = OpenAI()

mongo_uri = os.getenv("MONGO_URI")
client_db = MongoClient(mongo_uri)
db = client_db["boolean_query_db"]
sessions_collection = db["sessions"]

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.secret_key = os.getenv("FLASK_SECRET_KEY", os.urandom(24).hex())

@app.route('/update-query', methods=['POST'])
def update_query():
    try:
        data = request.json
        query = data.get("query", "")
        instructions = data.get("instructions", "")
        previous_conversation = data.get("previousConversation", "")
        translation = data.get("translation", "")
        tone = data.get("tone", "")
        session_id = data.get("sessionId", "")

        if not query or not instructions:
            return jsonify({"error": "Query and instructions are required"}), 400

        # Create a new session if no session ID provided
        if not session_id:
            session_data = {
                "messages": [
                    {"role": "system", "content": "You are an expert in crafting Boolean queries for tenders. Respond only with the result query."}
                ],
                "created_at": datetime.utcnow()
            }
            session = sessions_collection.insert_one(session_data)
            session_id = str(session.inserted_id)

        session = sessions_collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found."}), 400

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

        sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"messages": session['messages']}}
        )

        return jsonify({"updatedQuery": assistant_response, "sessionId": session_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get-all-sessions', methods=['GET'])
def get_all_sessions():
    try:
        sessions = sessions_collection.find({}, {"created_at": 1})
        session_list = [
            {"id": str(session["_id"]), "created_at": session["created_at"].strftime("%Y-%m-%d %H:%M:%S")}
            for session in sessions
        ]
        return jsonify({"sessions": session_list})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-session-details/<session_id>', methods=['GET'])
def get_session_details(session_id):
    try:
        session = sessions_collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found."}), 404

        messages = session.get("messages", [])
        if len(messages) < 2:
            return jsonify({"error": "Not enough messages in the session."}), 400

        # Extract the first user message and the last assistant response
        initial_query = next(
            (msg["content"] for msg in messages if msg["role"] == "user"), None
        )
        last_response = next(
            (msg["content"] for msg in reversed(messages) if msg["role"] == "assistant"), None
        )

        return jsonify({
            "initialQuery": initial_query,
            "lastResponse": last_response,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
