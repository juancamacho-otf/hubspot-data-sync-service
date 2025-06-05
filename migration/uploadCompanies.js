const fs = require('fs');
const path = require('path');
const hubspot = require('@hubspot/api-client');
require('dotenv').config();

const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_MAIN
});

async function uploadCompanies() {
  try {
    const raw = await fs.promises.readFile(path.join(__dirname, '../data/companies.json'), 'utf8');
    const companies = JSON.parse(raw);
    const chunkSize = 72;
    const results = [];

    for (let i = 0; i < companies.length; i += chunkSize) {
      const chunk = companies.slice(i, i + chunkSize);
      const payload = { inputs: chunk };

      const res = await hubspotClient.crm.companies.batchApi.create(payload);
      console.log(`Uploaded chunk ${i / chunkSize + 1}`);
      results.push(...res.results);
    }

    await fs.promises.writeFile(
      path.join(__dirname, '../data/companiesresponse.json'),
      JSON.stringify(results, null, 2)
    );

    console.log(`Upload complete. Total: ${results.length} companies`);

  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
}

uploadCompanies();
