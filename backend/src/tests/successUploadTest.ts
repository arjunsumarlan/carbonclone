import { Browser } from 'playwright';
import { WebVoyager, TestResult } from '../types';
import path from 'path';

async function successUploadTest(browser: Browser, webVoyager: WebVoyager): Promise<TestResult> {
  const page = await browser.newPage();
  await page.goto('https://video-converter.com/');

  const testFilePath = path.join(__dirname, '../../test_files/small_video.mp4');

  const steps = [
    { 
      instruction: 'Click on the file upload button or area. Look for elements with text like "Open file", "Choose file", or "Upload". The element might be an input[type="file"], a button, or a div acting as a button.',
      verification: async () => await page.$('input[type="file"]') !== null 
    },
    { 
      instruction: `Upload the file located at ${testFilePath}. This might involve setting the value of an input[type="file"] element.`,
      verification: async () => await page.$eval('input[type="file"]', (el: HTMLInputElement) => el.files?.length ?? 0 > 0)
    },
    { instruction: 'Select \'.avi\' as the output format.', verification: async () => await page.$('select[name="format"] option[value="avi"]:checked') !== null },
    { instruction: 'Choose the lowest HD quality option available.', verification: async () => await page.$('select[name="quality"] option:checked') !== null },
    { instruction: 'Click the convert or start button to begin the conversion process.', verification: async () => await page.$('button:has-text("Convert")') !== null },
    { instruction: 'Wait for the conversion to complete.', verification: async () => await page.waitForSelector('.conversion-complete', { timeout: 60000 }) },
    { instruction: 'Verify that a download link is available.', verification: async () => await page.$('a:has-text("Download")') !== null },
  ];

  const failedSteps = [];
  for (const [index, step] of steps.entries()) {
    console.log(`Executing step ${index + 1}: ${step.instruction}`);
    const result = await webVoyager.navigate(page, step.instruction);
    if (!result.success) {
      console.error(`Step ${index + 1} failed:`, result.details);
      failedSteps.push(`Step ${index + 1}: ${step.instruction}`);
      break;
    }
    const verified = await step.verification();
    if (!verified) {
      console.error(`Step ${index + 1} verification failed`);
      failedSteps.push(`Step ${index + 1} verification: ${step.instruction}`);
      break;
    }
  }

  await page.close();

  return {
    name: 'Success Upload Test',
    status: failedSteps.length === 0 ? 'Success' : 'Fail',
    failedSteps,
    details: failedSteps.length === 0 ? 'All steps completed successfully' : `Failed at: ${failedSteps.join(', ')}`,
  };
}

export default successUploadTest;
