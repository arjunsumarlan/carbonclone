import { Page } from "playwright";

export interface TestResult {
  name: string;
  status: "Success" | "Fail";
  failedSteps: string[];
  details: string;
  aiDescription?: string;
}

export interface WebVoyagerResult {
  success: boolean;
  failedSteps?: string[];
  details: string;
}

export interface Action {
  action: string;
  selector: string;
  text?: string;
  value?: string;
  filePath?: string;
}

export interface PageContent {
  html: string;
  text: string;
}

export interface WebVoyager {
  navigate(page: Page, instructions: string): Promise<WebVoyagerResult>;
}
