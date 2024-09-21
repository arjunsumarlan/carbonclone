import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { runTests, getTestResults } from "./testRunner";
import { generateCSV } from "./utils/csvGenerator";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/run-tests", async (_req: Request, res: Response) => {
  try {
    await runTests();
    res.status(200).json({ message: "Tests started successfully" });
  } catch (error) {
    console.error("Failed to start tests:", error);
    res.status(500).json({ error: "Failed to start tests" });
  }
});

app.get("/api/test-results", async (_req: Request, res: Response) => {
  try {
    const results = await getTestResults();
    res.status(200).json(results);
  } catch (error) {
    console.error("Failed to fetch test results:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});

app.get("/api/export-csv", async (_req: Request, res: Response) => {
  try {
    const results = await getTestResults();
    const csv = await generateCSV(results);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=test_results.csv"
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Failed to generate CSV:", error);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
