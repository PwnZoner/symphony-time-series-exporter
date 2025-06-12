// Symphony Time Series Exporter

import axios from 'axios';
import fs from 'fs/promises';
import Papa from 'papaparse';

// --- CONFIGURATION ---

// 1. Paste the Authentication Token from your browser here.
const AUTH_TOKEN = 'PASTE_YOUR_BEARER_TOKEN_HERE';

// 2. Update this array with your account details from the get_accounts.js helper script.
const ACCOUNTS_TO_EXPORT = [
  { name: 'IRA', accountId: 'PASTE_YOUR_IRA_ACCOUNT_ID_HERE' },
  { name: 'Stocks', accountId: 'PASTE_YOUR_STOCKS_ACCOUNT_ID_HERE' }
  // Add more accounts here if you have them, like this:
  // { name: 'Another Account', accountId: '...' }
];

// --- SCRIPT ---

const baseOutputDir = './composer_csv_exports';

// Helper function to turn a symphony name into a valid filename
function slugify(text) {
    if (!text) return 'unknown-symphony';
    return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-')       // collapse whitespace and replace by -
        .replace(/-+/g, '-');        // collapse dashes
}

async function fetchAllData() {
  console.log(`🚀 Starting automated export using the 'symphony-stats-meta' endpoint...`);
  const headers = { 'Authorization': AUTH_TOKEN };
  
  try {
    await fs.mkdir(baseOutputDir, { recursive: true });
  } catch (e) {
    // Ignore error if directory already exists
  }

  for (const account of ACCOUNTS_TO_EXPORT) {
    const accountDir = `${baseOutputDir}/${account.name}`;
    await fs.mkdir(accountDir, { recursive: true });
    console.log(`\n--- Discovering Symphonies in Account: ${account.name} ---`);

    try {
      // Step 1: Call the confirmed "symphony-stats-meta" endpoint to get the list of all symphonies
      const listSymphoniesUrl = `https://stagehand-api.composer.trade/api/v1/portfolio/accounts/${account.accountId}/symphony-stats-meta`;
      const listResponse = await axios.get(listSymphoniesUrl, { headers });

      // Correctly access the array inside the 'symphonies' key
      const symphoniesInAccount = listResponse.data.symphonies; 
      if (!symphoniesInAccount) {
        throw new Error("Could not find 'symphonies' array in the API response.");
      }
      console.log(` -> Found ${symphoniesInAccount.length} symphonies.`);

      // Step 2: Loop through the discovered symphonies to get their time series
      for (const symphony of symphoniesInAccount) {
        // Use the correct field names from the data
        const symphonyId = symphony.id; 
        const symphonyName = symphony.name;
        const safeFilename = slugify(symphonyName);
        
        try {
          console.log(`   Fetching timeseries for: ${symphonyName}`);
          const timeseriesUrl = `https://stagehand-api.composer.trade/api/v1/portfolio/accounts/${account.accountId}/symphonies/${symphonyId}`;
          const timeseriesResponse = await axios.get(timeseriesUrl, { headers });
          const timeseriesData = timeseriesResponse.data;

          const rows = [];
          if (timeseriesData?.epoch_ms?.length > 0) {
              for (let i = 0; i < timeseriesData.epoch_ms.length; i++) {
                  rows.push({
                      date: new Date(timeseriesData.epoch_ms[i]).toISOString().split('T')[0],
                      series: timeseriesData.series[i],
                      deposit_adjusted_series: timeseriesData.deposit_adjusted_series[i],
                  });
              }
          }
          
          const csvString = Papa.unparse(rows);
          const filePath = `${accountDir}/${safeFilename}.csv`;
          await fs.writeFile(filePath, csvString);
          console.log(`   -> ✅ Saved to ${filePath}`);

        } catch (error) {
          const errorMsg = error.response ? `Status ${error.response.status}` : error.message;
          console.error(`   -> ❌ Failure for ${symphonyName}: ${errorMsg}`);
        }
        // Delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 500)); 
      }
    } catch (error) {
      const errorMsg = error.response ? `Status ${error.response.status}` : error.message;
      console.error(`❌ CRITICAL: Failed to discover symphonies for account ${account.name}. Reason: ${errorMsg}`);
    }
  }
  console.log('\n🎉 All accounts exported successfully!');
}

fetchAllData();

