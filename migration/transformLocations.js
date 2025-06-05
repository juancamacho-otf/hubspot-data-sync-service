const fs = require('fs');
const _ = require('lodash');
const path = require('path');


async function transformLocations() {
  try {
    const rawData = await fs.promises.readFile(path.join(__dirname, '../data/characters.json'), 'utf8');
    const characters = JSON.parse(rawData);

    const locations = characters.map(p => p.location);
    const uniqueLocations = _.uniqBy(locations, 'url');

    const companies = [];

    for (const loc of uniqueLocations) {
      if (!loc.url || !loc.url.includes('/location/')) {
        console.warn(`Invalid or empty URL: ${loc.url}`);
        continue;
      }

      const response = await fetch(loc.url);
      const locationData = await response.json();

      const createdDate = new Date(locationData.created);
      const timestamp = new Date(Date.UTC(
        createdDate.getUTCFullYear(),
        createdDate.getUTCMonth(),
        createdDate.getUTCDate()
      )).getTime();

      companies.push({
        properties: {
          location_id: locationData.id.toString(),
          name: locationData.name,
          location_type: locationData.type,
          dimension: locationData.dimension,
          creation_date: timestamp.toString()
        }
      });
    }

    fs.writeFileSync(
      path.join(__dirname, '../data/companies.json'),
      JSON.stringify(companies, null, 2)
    );

    console.log('companies.json saved successfully.');
    console.log(`Total companies: ${companies.length}`);

  } catch (error) {
    console.error('Error processing locations:', error);
  }
}

transformLocations();
