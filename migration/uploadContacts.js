const fs = require('fs');
const path = require('path');
const hubspot = require('@hubspot/api-client');
require('dotenv').config();

const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_MAIN
});

async function uploadContacts() {
  try {
    const raw = await fs.promises.readFile(path.join(__dirname, '../data/contacts.json'), 'utf8');
    const contacts = JSON.parse(raw);
    const chunkSize = 72;
    const results = [];

    for (let i = 0; i < contacts.length; i += chunkSize) {
      const chunk = contacts.slice(i, i + chunkSize);
      const payload = { inputs: chunk };

      const res = await hubspotClient.crm.contacts.batchApi.create(payload);
      console.log(`Uploaded chunk ${i / chunkSize + 1}`);
      results.push(...res.results);
    }

    await fs.promises.writeFile(
      path.join(__dirname, '../data/contactsresponse.json'),
      JSON.stringify(results, null, 2)
    );

    console.log(`Upload complete. Total: ${results.length} contacts`);

  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
}

uploadContacts();
