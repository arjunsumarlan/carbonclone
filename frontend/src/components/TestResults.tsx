import React, { useState, useEffect } from "react";
import { getTestResults } from "../api";

interface TestResult {
  name: string;
  status: string;
  failedSteps: string[];
  details: string;
  aiDescription?: string;
}

const TestResults: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getTestResults();
      setResults(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2>Test Results</h2>
      <button onClick={fetchResults}>Refresh Results</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {results.map((result, index) => (
        <div key={index}>
          <h3>{result.name}</h3>
          <p>Status: {result.status}</p>
          <p>Details: {result.details}</p>
          {result.failedSteps.length > 0 && (
            <div>
              <p>Failed Steps:</p>
              <ul>
                {result.failedSteps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          {result.aiDescription && (
            <p>AI Description: {result.aiDescription}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestResults;
