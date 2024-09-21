import { Page } from "playwright";
import OpenAI from "openai";
import { WebVoyagerResult, Action, PageContent } from "./types";

export class WebVoyager {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  private async handleCookieConsent(page: Page): Promise<void> {
    try {
      const consentButton = await page.$('button:has-text("Accept Cookies")');
      if (consentButton) {
        await consentButton.click();
        console.log("Clicked cookie consent button");
        await page.waitForLoadState("networkidle");
      }
    } catch (error) {
      console.log("No cookie consent popup found or error handling it:", error);
    }
  }

  async navigate(page: Page, instructions: string): Promise<WebVoyagerResult> {
    await this.handleCookieConsent(page);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        console.log(`Attempt ${attempts + 1}:`);
        await page.screenshot({
          path: `debug_screenshot_attempt_${attempts + 1}.png`,
        });
        const pageContent = await this.getPageContent(page);
        console.log("Page Content:", pageContent);
        const action = await this.planAction(pageContent, instructions);
        console.log("Planned Action:", action);
        await this.executeAction(page, action);
        console.log("Action executed successfully");

        if (await this.isTaskComplete(page, instructions)) {
          console.log("Task completed successfully");
          return { success: true, details: "Task completed successfully" };
        }

        attempts++;
      } catch (error) {
        console.error(`Navigation error (attempt ${attempts + 1}):`, error);
        if (attempts === maxAttempts - 1) {
          return {
            success: false,
            failedSteps: [(error as Error).message],
            details: (error as Error).stack || "",
          };
        }
      }
    }

    console.error("Max attempts reached without completing the task");
    return {
      success: false,
      failedSteps: ["Max attempts reached"],
      details:
        "Failed to complete the task within the maximum number of attempts",
    };
  }

  private async getPageContent(page: Page): Promise<PageContent> {
    const content = await page.content();
    const text = await page.evaluate(() => {
      const mainContent = document.querySelector("main") || document.body;
      return mainContent.innerText.slice(0, 5000);
    });
    return { html: content.slice(0, 10000), text };
  }

  private async planAction(
    pageContent: PageContent,
    instructions: string
  ): Promise<Action> {
    const truncatedContent = pageContent.text.slice(0, 4000);
    const prompt = `
Page content summary: ${truncatedContent}

Instructions: ${instructions}

Based on the above summary and instructions, what should be the next action? Respond with a JSON object containing 'action' and 'selector' properties. The 'action' should be one of: 'click', 'type', 'select', or 'upload'. For the 'selector', provide a specific CSS selector or XPath. If multiple actions are needed, only return the first action. Keep your response concise.

Example response:
{
  "action": "click",
  "selector": "input[type='file']"
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a web navigation assistant. Plan the next action based on the current page content and instructions.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
    });

    return JSON.parse(response.choices[0].message.content || "{}") as Action;
  }

  private async executeAction(page: Page, action: Action): Promise<void> {
    console.log(`Executing action: ${JSON.stringify(action)}`);

    const timeout = 10000; // 10 seconds timeout

    switch (action.action.toLowerCase()) {
      case "click":
        try {
          // Try multiple selectors
          const selectors = [
            action.selector,
            'input[type="file"]',
            'button:has-text("Open file")',
            '[aria-label="Upload file"]',
            ".upload-button",
            "#file-input",
          ];

          for (const selector of selectors) {
            try {
              await page.click(selector, { timeout });
              console.log(`Successfully clicked: ${selector}`);
              return;
            } catch (error) {
              console.log(`Failed to click: ${selector}`);
            }
          }

          throw new Error("Failed to find clickable element");
        } catch (error) {
          console.error("Click action failed:", error);
          // Take a screenshot for debugging
          await page.screenshot({ path: `error-click-${Date.now()}.png` });
          throw error;
        }
        break;
      case "type":
        if (action.text) {
          await page.type(action.selector, action.text);
        }
        break;
      case "select":
        if (action.value) {
          await page.selectOption(action.selector, action.value);
        }
        break;
      case "upload":
        if (action.filePath) {
          const input = await page.$(action.selector);
          if (input) {
            await input.setInputFiles(action.filePath);
          }
        }
        break;
      default:
        console.warn(
          `Unrecognized action: ${action.action}. Attempting to click.`
        );
        await page.click(action.selector);
        break;
    }

    await page.waitForLoadState("networkidle", { timeout: 30000 });
  }

  private async isTaskComplete(
    page: Page,
    instructions: string
  ): Promise<boolean> {
    const pageContent = await this.getPageContent(page);
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a web navigation assistant. Determine if the task is complete based on the current page content and instructions.",
        },
        {
          role: "user",
          content: `Page content: ${JSON.stringify(
            pageContent
          )}\n\nInstructions: ${instructions}\n\nIs the task complete? Respond with 'yes' or 'no'.`,
        },
      ],
    });

    return (response.choices[0].message.content || "").toLowerCase() === "yes";
  }
}
