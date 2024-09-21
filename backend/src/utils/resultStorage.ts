import fs from "fs/promises";
import path from "path";
import { TestResult } from "../types";

const RESULTS_FILE = path.join(__dirname, "../../test_results.json");

export async function saveTestResults(results: TestResult[]): Promise<void> {
  try {
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error saving test results:", error);
    throw error;
  }
}

export async function getTestResults(): Promise<TestResult[]> {
  try {
    const data = await fs.readFile(RESULTS_FILE, "utf8");
    return JSON.parse(data) as TestResult[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error("Error reading test results:", error);
    throw error;
  }
}
