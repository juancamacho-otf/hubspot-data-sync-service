const fs = require('fs');
const path = require('path');
const hubspot = require('@hubspot/api-client');
require('dotenv').config();


const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_MAIN
});

async function uploadAssociations() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../data/associations.json'), 'utf8');
    const associations = JSON.parse(raw);

    const inputs = associations.map(a => ({
      _from: { id: a.from },
      to: { id: a.to },
      types: [
        {
          associationCategory: 'HUBSPOT_DEFINED',
          associationTypeId: 1
        }
      ]
    }));

    const response = await hubspotClient.crm.associations.v4.batchApi.create(
      'contacts',
      'companies',
      { inputs }
    );

    console.log(`Associations uploaded successfully: ${inputs.length}`);

  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
}

uploadAssociations();
