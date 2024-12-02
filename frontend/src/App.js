import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

const App = () => {
  const [query, setQuery] = useState("(example AND query)");
  const [instructions, setInstructions] = useState("");
  const [updatedQuery, setUpdatedQuery] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("idle");

  useEffect(() => {
    if (sessionStatus === "idle") {
      const startSession = async () => {
        setSessionStatus("loading");
        try {
          const response = await fetch("http://127.0.0.1:5000/start-session", {
            method: "POST",
            credentials: "include",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          console.log("Session started:", data);
          setSessionId(data.sessionId);
          setSessionStatus("success");
        } catch (error) {
          console.error("Error starting session:", error);
          setSessionStatus("error");
        }
      };
      startSession();
    }
  }, [sessionStatus]);

  const handleSend = async () => {
    if (!query || !instructions || !sessionId) {
      alert("Query, instructions, and session ID are required!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/update-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query, instructions, sessionId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.updatedQuery) {
        setUpdatedQuery(data.updatedQuery);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error updating query:", error);
      alert(
        "Failed to update the query. Please check the console for details."
      );
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom align="center">
        Boolean Query Builder
      </Typography>

      {/* Session Status */}
      {sessionStatus === "loading" && (
        <Box sx={{ textAlign: "center", marginBottom: 2 }}>
          <CircularProgress />
          <Typography>Starting session...</Typography>
        </Box>
      )}
      {sessionStatus === "error" && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          Failed to start the session. Please check the server connection.
        </Alert>
      )}

      {/* Top Controls */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {/* Dropdowns and Text Fields */}
        <FormControl fullWidth>
          <InputLabel>Select a Template</InputLabel>
          <Select>
            <MenuItem value="template1">Template 1</MenuItem>
            <MenuItem value="template2">Template 2</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Enter Industry Info"
          placeholder="Write some context..."
        />
        <FormControl fullWidth>
          <InputLabel>Select a Previous Conversation</InputLabel>
          <Select>
            <MenuItem value="conversation1">Conversation 1</MenuItem>
            <MenuItem value="conversation2">Conversation 2</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Select Tender Type</InputLabel>
          <Select>
            <MenuItem value="tender1">Tender Type 1</MenuItem>
            <MenuItem value="tender2">Tender Type 2</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Translate to:</InputLabel>
          <Select>
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="spanish">Spanish</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Tone of Conversation</InputLabel>
          <Select>
            <MenuItem value="formal">Formal</MenuItem>
            <MenuItem value="technical">Technical</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Content Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          marginBottom: 4,
        }}
      >
        {/* Current Query */}
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h6">Current Query</Typography>
          <TextField
            multiline
            rows={8}
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ marginTop: 2 }}
          />
        </Paper>

        {/* Generated Query */}
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h6">Generated Query</Typography>
          <TextField
            multiline
            rows={8}
            fullWidth
            value={updatedQuery}
            disabled
            sx={{ marginTop: 2 }}
          />
        </Paper>
      </Box>

      {/* Guidelines Section */}
      <Paper elevation={2} sx={{ padding: 2 }}>
        <Typography variant="h6">Enter Your Guidelines</Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Add guidelines such as 'include safety measures, certifications, etc.'"
          sx={{ marginTop: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{ marginTop: 2 }}
        >
          Send to Chatbot
        </Button>
      </Paper>
    </Box>
  );
};

export default App;
