import React, { useState } from "react";
import { exportCSV } from "../api";

const ExportCSV: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      await exportCSV();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <h2>Export Results</h2>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export CSV"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ExportCSV;
