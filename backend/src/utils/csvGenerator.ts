import { Parser } from "json2csv";
import { TestResult } from "../types";

export async function generateCSV(results: TestResult[]): Promise<string> {
  const fields = ["name", "status", "failedSteps", "aiDescription"];
  const opts = { fields };

  try {
    const parser = new Parser(opts);
    return parser.parse(results);
  } catch (err) {
    console.error("Error generating CSV:", err);
    throw err;
  }
}
