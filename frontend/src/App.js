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
  const [query, setQuery] = useState(
    '("window cleaning" OR "window cleaner") AND (building OR skyscraper OR office) AND clean* AND ("safety harness" OR "high-rise")'
  );
  const [instructions, setInstructions] = useState("");
  const [updatedQuery, setUpdatedQuery] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [industryInfo, setIndustryInfo] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-all-sessions");
      const data = await response.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/update-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          instructions,
          industryInfo,
          tone,
          sessionId: selectedSession || sessionId,
        }),
      });

      const data = await response.json();

      if (data.updatedQuery) {
        setUpdatedQuery(data.updatedQuery);
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom align="center">
        Boolean Query Builder
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Top Controls */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          marginBottom: 4,
        }}
      >
        <TextField
          fullWidth
          label="Enter Industry Info"
          placeholder="Write some context..."
          value={industryInfo}
          onChange={(e) => setIndustryInfo(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel>Select a Previous Conversation</InputLabel>
          <Select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <MenuItem>New Conversation</MenuItem>
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.created_at}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Tone of Conversation</InputLabel>
          <Select value={tone} onChange={(e) => setTone(e.target.value)}>
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
          disabled={loading}
          sx={{ marginTop: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Send to Chatbot"}
        </Button>
      </Paper>
    </Box>
  );
};

export default App;
