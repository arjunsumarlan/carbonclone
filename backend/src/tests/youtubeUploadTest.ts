import { Browser } from "playwright";
import { WebVoyager, TestResult } from "../types";

async function youtubeUploadTest(
  browser: Browser,
  webVoyager: WebVoyager
): Promise<TestResult> {
  const page = await browser.newPage();
  await page.goto("https://video-converter.com/");

  const youtubeUrl = 'https://www.youtube.com/watch?v=aWk2XZz_8lhA';

  const result = await webVoyager.navigate(page, `
    1. Look for a YouTube URL input field.
    2. If found, enter the URL: ${youtubeUrl}
    3. Click any button to start processing the YouTube video.
    4. Check for error messages related to YouTube uploads.
  `);

  await page.screenshot({ path: 'youtube_test_result.png' });

  const errorMessage = await page.$eval('body', (el) => el.innerText.includes('YouTube uploads are not supported') || el.innerText.includes('Error'));

  await page.close();

  return {
    name: "YouTube Upload Test",
    status: errorMessage ? "Success" : "Fail", // We expect this to fail, so finding an error message is a success for our test
    failedSteps: errorMessage ? [] : ['No error message found for YouTube upload'],
    details: errorMessage ? 'YouTube upload was correctly rejected' : 'YouTube upload did not produce expected error',
  };
}

export default youtubeUploadTest;
