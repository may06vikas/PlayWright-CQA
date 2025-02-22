# ACOM Automation

## Description
This project provides automated testing for ACOM using Playwright, a powerful testing framework. It encompasses a suite of test cases covering various aspects of ACOM functionality, ensuring its stability and reliability.

## Prerequisites

Before embarking on the testing journey, ensure that your system meets the following requirements:
1. **Node.js Installation:** Verify that Node.js is installed on your machine. You can download and install Node.js from the official website: https://nodejs.org/en/
2. **Forking the Repository:** Navigate to the GitHub repository and fork it into your personal account. This will create a copy of the project under your own account, allowing you to make changes without affecting the original repository.
3. **Cloning the Repository:** Clone your forked repository to your local machine using Git. This will download the project files onto your system.

## Available Workflows

The project encompasses four distinct workflows for automated testing:
1. **CC:** This workflow focuses on testing the CC Web application, ensuring its core functionalities and user interface elements.
2. **DC:** This workflow targets the DC Web application, validating its features and interactions with the DC platform.
3. **DX:** This workflow aims to test the DX Web application, guaranteeing its content and user experience.


```markdown
## Table of Contents

- [Setup](#setup)
- [Git Repository](#git-repository)
- [Command to Execute Test Cases](#command-to-execute-test-cases)
- [Playwright Arguments](#playwright-arguments)
- [User-Defined Parameters](#user-defined-parameters)
- [Reporting](#reporting)

## Setup

To install dependencies, run:

```bash
npm install
```


**Details:**


## Git Repository


[Link to Git Repository](https://github.com/may06vikas/PlayWright-CQA)


## Command to Execute Test Cases



### All Test Cases

```bash
npx playwright test workflows/cc/tests --headed --project=Chromium 
```

### Single Test Case

```bash
npx playwright test abc.test --headed --project=Chromium
```


## Playwright Arguments

### Arguments

| Name | Description |
|---|---|
| --workers=1 | Executes on one browser at a time (default: 4). |
| --config=playwright.config.ts | Specifies CC configuration. |
| --project=Chromium | Browser options - Chromium, Firefox, Webkit, MS-Edge. |
| --debug | Enable debug mode. |


## User-Defined Parameters

### Parameters

| Name | Description |
|---|---|
| LANG_Web=ALL GIO's | Future use. |
| ENV=prod | Supports 'stage' and 'prod' environments. |



## Reporting

To view the HTML report, use:

```bash
npx playwright show-report
```
Sure, here is an updated README file that includes the framework overview and folder structure information:


## ACOM Automation Framework

### Overview
The ACOM Automation Framework is a powerful and versatile framework built upon Playwright, a prominent Web APP testing tool. It empowers developers to automate testing of various ACOM Business Unit applications, ensuring their stability, reliability, and user experience. The framework offers a comprehensive suite of features, including:

- **Test Execution Flexibility:** Execute test cases in either headed or headless mode, catering to your testing preferences.

- **Cross-Browser Compatibility:** Seamlessly test across multiple browsers and devices, ensuring consistent performance and functionality.

- **User-Defined Customization:** Customize the testing environment by defining user-defined parameters, tailored to your specific testing needs.

- **Extensive Reporting:** Generate detailed reports in .XLSX, HTML and Allure formats, providing insights into test execution, pass/fail status, execution time, and error logs.


The `workflows` directory houses subdirectories for each ACOM Web application, each containing a set of test cases categorized by feature or functionality.

The `scripts` directory accommodates custom test execution scripts, enabling developers to implement unique testing scenarios.



## Executing Test Cases

To run the entire suite of test cases, simply execute the following command:
```
npx playwright test
```
This command will execute all test cases within the `workflows` directory.
To target a specific test case, use the following command format:
```
npx playwright test <test_case_name>.spec.ts
```
Replace `<test_case_name>` with the actual name of the test case file.


## Reporting
The framework supports two comprehensive reporting formats: HTML and Allure.
To generate an HTML report, employ the following command:

```
npx playwright show-report
```
This will generate an HTML file containing a detailed overview of the test execution, including pass/fail status, execution time, and error logs.
To produce an Allure report, utilize the following command:
```
allure generate --clean my-allure-results && allure open
```

This will generate an Allure report in the specified directory (`allure-results`). The Allure report provides a more in-depth analysis of the test execution, including screenshots, videos, and step-by-step logs.


## Conclusion

The ACOM Web Automation Framework stands out as a comprehensive and user-friendly tool for automating testing of all ACOM Business Unit applications. Its rich feature set, flexible folder structure, and extensive reporting capabilities make it an ideal choice for teams of all sizes. With its robust capabilities, developers can effectively automate testing, ensuring the quality and reliability of ACOM products.

