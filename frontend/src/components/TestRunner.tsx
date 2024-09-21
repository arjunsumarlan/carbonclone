import React, { useState } from "react";
import { runTests } from "../api";

const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      await runTests();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <h2>Test Runner</h2>
      <button onClick={handleRunTests} disabled={isRunning}>
        {isRunning ? "Running Tests..." : "Run Tests"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default TestRunner;
