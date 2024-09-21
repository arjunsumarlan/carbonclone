import React from "react";
import TestRunner from "./components/TestRunner";
import TestResults from "./components/TestResults";
import ExportCSV from "./components/ExportCSV";

const App: React.FC = () => {
  return (
    <div>
      <h1>Web Voyager Test Suite</h1>
      <TestRunner />
      <TestResults />
      <ExportCSV />
    </div>
  );
};

export default App;
