const API_URL = "http://localhost:3001/api";

export async function runTests() {
  const response = await fetch(`${API_URL}/run-tests`, { method: "POST" });
  if (!response.ok) {
    throw new Error("Failed to start tests");
  }
  return response.json();
}

export async function getTestResults() {
  const response = await fetch(`${API_URL}/test-results`);
  if (!response.ok) {
    throw new Error("Failed to fetch test results");
  }
  return response.json();
}

export async function exportCSV() {
  const response = await fetch(`${API_URL}/export-csv`);
  if (!response.ok) {
    throw new Error("Failed to export CSV");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "test_results.csv";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
