import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { fetchSessions, updateQuery } from "./services/api";
import InputField from "./components/InputField";
import DropdownSelect from "./components/DropdownSelect.js";

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
    (async () => {
      try {
        const sessionData = await fetchSessions();
        setSessions(sessionData);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Unable to fetch sessions. Please try again later.");
      }
    })();
  }, []);

  const handleSend = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await updateQuery({
        query,
        instructions,
        industryInfo,
        tone,
        sessionId: selectedSession || sessionId,
      });

      setUpdatedQuery(data.updatedQuery || "");
      setSessionId(data.sessionId || "");

      if (data.error) setError(data.error);
    } catch {
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

      {/* Input Controls */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 4,
        }}
      >
        <InputField
          label="Enter Industry Info"
          value={industryInfo}
          placeholder="Write some context..."
          onChange={(e) => setIndustryInfo(e.target.value)}
        />
        <DropdownSelect
          label="Select a Previous Conversation"
          value={selectedSession}
          options={sessions.map((session) => ({
            value: session.id,
            label: session.created_at,
          }))}
          onChange={(e) => setSelectedSession(e.target.value)}
        />
        <DropdownSelect
          label="Tone of Conversation"
          value={tone}
          options={[
            { value: "formal", label: "Formal" },
            { value: "technical", label: "Technical" },
          ]}
          onChange={(e) => setTone(e.target.value)}
        />
      </Box>

      {/* Query Section */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, mb: 4 }}
      >
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6">Current Query</Typography>
          <InputField
            multiline
            rows={8}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6">Generated Query</Typography>
          <InputField multiline rows={8} value={updatedQuery} disabled />
        </Paper>
      </Box>

      {/* Guidelines Section */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6">Enter Your Guidelines</Typography>
        <InputField
          multiline
          rows={4}
          placeholder="Add guidelines such as 'include safety measures, certifications, etc.'"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Send to Chatbot"}
        </Button>
      </Paper>
    </Box>
  );
};

export default App;
