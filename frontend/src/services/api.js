export const fetchSessions = async () => {
  const response = await fetch("http://127.0.0.1:5000/get-all-sessions");
  const data = await response.json();
  return data.sessions || [];
};

export const updateQuery = async (payload) => {
  const response = await fetch("http://127.0.0.1:5000/update-query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return await response.json();
};

export const getSessionDetails = async (sessionId) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/get-session-details/${sessionId}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch session details");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching session details:", error);
    throw error;
  }
};
