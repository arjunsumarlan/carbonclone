import { chromium, Browser } from "playwright";
import OpenAI from "openai";
import { WebVoyager } from "./webVoyager";
import { saveTestResults, getTestResults } from "./utils/resultStorage";
import successUploadTest from "./tests/successUploadTest";
import youtubeUploadTest from "./tests/youtubeUploadTest";
import largeFileUploadTest from "./tests/largeFileUploadTest";
import { TestResult } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const webVoyager = new WebVoyager(openai);

async function runTests(): Promise<TestResult[]> {
  const browser: Browser = await chromium.launch();
  const results: TestResult[] = [];

  try {
    results.push(await successUploadTest(browser, webVoyager));
    results.push(await youtubeUploadTest(browser, webVoyager));
    results.push(await largeFileUploadTest(browser, webVoyager));
  } catch (error) {
    console.error("Error running tests:", error);
  } finally {
    await browser.close();
  }

  // Generate AI descriptions for each test result
  for (const result of results) {
    result.aiDescription = await generateAIDescription(result);
  }

  await saveTestResults(results);
  return results;
}

async function generateAIDescription(testResult: TestResult): Promise<string> {
  const prompt = `Generate a brief description of the following test result:
    Test name: ${testResult.name}
    Status: ${testResult.status}
    Failed steps: ${
      testResult.failedSteps.length > 0
        ? testResult.failedSteps.join(", ")
        : "None"
    }
    Details: ${testResult.details}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return (
      response.choices[0].message.content || "Failed to generate AI description"
    );
  } catch (error) {
    console.error("Error generating AI description:", error);
    return "Failed to generate AI description";
  }
}

export { runTests, getTestResults };
