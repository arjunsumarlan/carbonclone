import { Browser } from 'playwright';
import { WebVoyager, TestResult } from '../types';
import path from 'path';

async function largeFileUploadTest(browser: Browser, webVoyager: WebVoyager): Promise<TestResult> {
  const page = await browser.newPage();
  await page.goto('https://video-converter.com/');

  // We'll simulate a large file by modifying the file input
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      value: [new File([''], 'large_file.mp4', { type: 'video/mp4' })],
      writable: false
    });
    const fileInput = input as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      Object.defineProperty(fileInput.files[0], 'size', {
        value: 5 * 1024 * 1024 * 1024, // 5GB
        writable: false
      });
    }
  });

  await webVoyager.navigate(page, `
    1. Attempt to upload the large file (5GB).
    2. Look for any error messages related to file size.
    3. Verify that the upload is rejected due to size limitations.
  `);

  await page.screenshot({ path: 'large_file_test_result.png' });

  const errorMessage = await page.$eval('body', (el) => el.innerText.includes('file is too large') || el.innerText.includes('size limit exceeded'));

  await page.close();

  return {
    name: 'Large File Upload Test',
    status: errorMessage ? 'Success' : 'Fail', // We expect this to fail, so finding an error message is a success for our test
    failedSteps: errorMessage ? [] : ['No error message found for large file upload'],
    details: errorMessage ? 'Large file upload was correctly rejected' : 'Large file upload did not produce expected error',
  };
}

export default largeFileUploadTest;
