# Boolean Query Optimizer

This project demonstrates a web application using Flask for the backend and React for the frontend.

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (for the frontend)
- Python 3.x (for the backend)

## Installation

### Backend Setup (Flask)

1. Install the required Python libraries:

   pip install flask openai python-dotenv pymongo

2. Configure your MongoDB connection and API keys in an `.env` file.

### Frontend Setup (React)

1. Navigate to your React project directory.
2. Install the required dependencies:

   npm install @mui/material @emotion/react @emotion/styled

## Features

- Backend: Developed with Flask and uses MongoDB to save session data.
- Frontend: Built with React and styled using Material-UI (MUI).

## MongoDB Integration

Session data is stored in a MongoDB collection. Ensure your MongoDB instance is running and properly configured in the Flask application.

## Development

### Running the Backend

Start the Flask server:

flask run

### Running the Frontend

Start the React development server:

npm start

