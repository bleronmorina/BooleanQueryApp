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
