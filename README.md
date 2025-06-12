# Symphony Time Series Exporter

A Node.js tool to automatically discover and export time series data for all your Composer symphonies into organized CSV files.

*Created by J-Pwn, vibe coding with Gemini.*

**Disclaimer:** This tool is a community project and is not affiliated with, endorsed, or supported by Composer.trade. It is provided as-is in the hope that it will be useful. Please use it at your own risk.

---

### Features

-   **Automatic Discovery:** No need to manually list your symphony IDs. The script connects to the API and finds every symphony in your specified accounts.
-   **Multi-Account Support:** Export data from multiple accounts (e.g., IRA, Taxable) in a single run.
-   **Organized Output:** Creates separate folders for each account and uses the symphony's name for clear, readable CSV filenames.
-   **Robust & Configurable:** Easily configure your accounts and authentication token. Includes a delay to respect API rate limits.

---

### Prerequisites

You must have **[Node.js](https://nodejs.org/en)** installed on your computer. You can download it from the official website.

---

### Setup Instructions

Follow these steps to get the tool running on your machine.

#### Step 1: Create Your Project Folder

Create a new folder on your computer for this project. For example, you could name it `composer-exporter`. Open this folder in your favorite code editor (like VS Code) and open a terminal/command line window inside it.

#### Step 2: Create the `package.json` File

This file tells Node.js about your project and its dependencies. Create a file named `package.json` inside your project folder and copy the following content into it:

```json
{
  "name": "symphony-time-series-exporter",
  "version": "1.0.0",
  "description": "A tool to export time series data from Composer.trade",
  "type": "module",
  "main": "export.js",
  "scripts": {
    "start": "node export.js",
    "get-accounts": "node get_accounts.js"
  },
  "keywords": [
    "composer",
    "trading",
    "finance"
  ],
  "author": "J-Pwn & Gemini",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.7.2",
    "papaparse": "^5.4.1"
  }
}
```

#### Step 3: Install Dependencies

In your terminal, run the following command. This will download and install the required libraries (`axios` for API calls and `papaparse` for creating CSV files).

```bash
npm install
```

---

### Configuration

Now you need to get your personal information (Authentication Token and Account IDs) to configure the scripts.

#### Step 4: Get Your Authentication Token

The script needs an authorization token to act on your behalf. This token is temporary and usually expires after a few hours. **You will need to repeat this step each time you run the script.**

1.  Open the Google Chrome browser (recommended).
2.  Go to **[app.composer.trade](https://app.composer.trade/)** and log in to your account.
3.  Open the **Developer Tools**. You can do this by pressing **F12**, or **Ctrl+Shift+I** (on Windows/Linux), or **Cmd+Option+I** (on Mac).
4.  Click on the **"Network"** tab within the Developer Tools.
5.  Click on any symphony or dashboard in the Composer app to generate network traffic. You will see a list of requests appearing in the Network tab.
6.  Look for any request going to **`stagehand-api.composer.trade`**. Click on it.
7.  A new panel will open. Stay in the **"Headers"** tab and scroll down until you see the **"Request Headers"** section.
8.  Find the header named `authorization`. Its value is your token. It will start with `Bearer ...`.
9.  **Copy the entire value**, including the word "Bearer" and the long string of characters that follows. This is your `AUTH_TOKEN`.

#### Step 5: Find Your Account IDs (Easy Method)

To make finding your Account IDs easy, we've included a helper script.

1.  Create a file named `get_accounts.js` in your project folder.
2.  Copy the code from the **`get_accounts.js`** file provided in this project.
3.  Paste your `AUTH_TOKEN` (from Step 4) into the `AUTH_TOKEN` variable at the top of this helper script.
4.  In your terminal, run the script:
    ```bash
    npm run get-accounts
    ```
5.  The script will print a list of all your accounts with their names and IDs. It will look something like this:
    ```
    ✅ Found 2 accounts:
    --------------------------------
    Account Name: IRA
    Account ID:   9c5cc1f7-6cdf-41f1-8753-7ba3311e4fc4
    --------------------------------
    Account Name: Stocks
    Account ID:   0e5fcc23-3404-487d-aec6-c56f2598bdaf
    --------------------------------
    ```
6.  Keep these IDs handy for the next step.

#### Step 6: Set Up the Main Exporter Script

1.  Create a file named `export.js` in your project folder.
2.  Copy the code from the **`export.js`** file provided in this project.
3.  Paste your `AUTH_TOKEN` (from Step 4) into the `AUTH_TOKEN` variable at the top of the `export.js` file.
4.  Update the `ACCOUNTS_TO_EXPORT` array with the Account IDs you found in Step 5.

---

### Running the Exporter

Once everything is set up and configured, run the main script from your terminal:

```bash
npm start
```

The script will now discover all the symphonies in each account and download the time series data into CSV files inside a `composer_csv_exports` folder.

---

### Customization (Advanced)

#### Changing Output to JSON

If you'd prefer to save the raw JSON data instead of CSV files, you can easily modify the `export.js` script.

1.  Find the `try {...}` block inside the main `for` loop (the one that starts with `// Step 2: Loop through...`).
2.  Replace the entire block with the following code. The key changes are removing the CSV conversion and saving the `timeseriesData` object directly.

```javascript
// --- Replacement block for JSON output ---
try {
  console.log(`   Fetching timeseries for: ${symphonyName}`);
  const timeseriesUrl = `https://stagehand-api.composer.trade/api/v1/portfolio/accounts/${account.accountId}/symphonies/${symphonyId}`;
  const timeseriesResponse = await axios.get(timeseriesUrl, { headers });
  const timeseriesData = timeseriesResponse.data;

  // Save the raw JSON data
  const jsonString = JSON.stringify(timeseriesData, null, 2); // The '2' makes the JSON readable
  const filePath = `${accountDir}/${safeFilename}.json`; // Note the .json extension
  await fs.writeFile(filePath, jsonString);
  console.log(`   -> ✅ Saved to ${filePath}`);

} catch (error) {
  // ... (error handling remains the same)
}
// ...
```

---

### Troubleshooting

* **`CRITICAL: Failed to discover symphonies...`**: This usually means your `AUTH_TOKEN` is incorrect or has expired. Repeat **Step 4** to get a fresh token.
* **`Failure for ... Reason: Status 429`**: This means you're making too many requests too quickly. Open `export.js` and increase the delay at the bottom of the script from `500` to a higher number like `1000` (1 second).

