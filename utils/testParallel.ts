import { test as base, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Extend the test fixture to include parallel execution data
export type TestOptions = {
    page: Page;
    sheetName: string;
    testResultsDir: string;
};

// Create a test fixture with parallel data
export const test = base.extend<TestOptions>({
    sheetName: ['', { option: true }],
    testResultsDir: async ({}, use) => {
        const dir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await use(dir);
    }
});

// Helper function to create parallel tests
export function createParallelTests(testFunction: (options: TestOptions) => Promise<void>, sheetNames: string[]) {
    // Create a test for each sheet
    for (const sheetName of sheetNames) {
        test(`Test_${sheetName}`, async ({ page, testResultsDir }) => {
            await testFunction({ page, sheetName, testResultsDir });
        });
    }
} 