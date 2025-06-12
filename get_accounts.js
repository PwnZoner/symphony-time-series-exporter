// Helper script to find and list your Composer Account IDs

import axios from 'axios';

// --- CONFIGURATION ---

// Paste the Authentication Token from your browser here.
// You only need to run this script once, or whenever you add a new account.
const AUTH_TOKEN = 'PASTE_YOUR_BEARER_TOKEN_HERE';

// --- SCRIPT ---

async function findAccounts() {
  console.log("🔍 Finding your accounts...");

  if (AUTH_TOKEN === 'PASTE_YOUR_BEARER_TOKEN_HERE') {
    console.error("\n❌ ERROR: Please paste your AUTH_TOKEN into the script before running.");
    return;
  }

  const headers = { 'Authorization': AUTH_TOKEN };
  const url = 'https://app-api.composer.trade/api/v1/user-identities';

  try {
    const response = await axios.get(url, { headers });
    
    // The response contains a list of identities, each with account details
    const accounts = response.data.map(identity => identity.alpaca_account);
    
    if (accounts && accounts.length > 0) {
      console.log(`\n✅ Found ${accounts.length} accounts:`);
      console.log('--------------------------------');
      for (const account of accounts) {
        console.log(`Account Name: ${account.name}`);
        console.log(`Account ID:   ${account.id}`);
        console.log('--------------------------------');
      }
      console.log("\nCopy the Account IDs and paste them into the ACCOUNTS_TO_EXPORT array in the main export.js file.");
    } else {
      console.log("Could not find any accounts associated with this token.");
    }

  } catch (error) {
    const errorMsg = error.response ? `Status ${error.response.status}` : error.message;
    console.error(`\n❌ Failed to fetch account information. Reason: ${errorMsg}`);
    console.error("This usually means your AUTH_TOKEN is incorrect or has expired.");
  }
}

findAccounts();
