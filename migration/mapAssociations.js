const fs = require('fs');
const path = require('path');

async function mapAssociations() {
  try {
    // 1. Load characters
    const rawCharacters = await fs.promises.readFile(path.join(__dirname, '../data/characters.json'), 'utf8');
    const characters = JSON.parse(rawCharacters);
    const characterLocationMap = new Map(
      characters.map(c => [c.id.toString(), c.location?.url?.split('/').pop()])
    );

    // 2. Load companies from HubSpot response
    const rawCompanies = await fs.promises.readFile(path.join(__dirname, '../data/companiesresponse.json'), 'utf8');
    const companies = JSON.parse(rawCompanies);
    const companyIdMap = new Map(
      companies.map(c => [c.properties.location_id, c.id])
    );

    // 3. Load contacts from HubSpot response
    const rawContacts = await fs.promises.readFile(path.join(__dirname, '../data/contactsresponse.json'), 'utf8');
    const contacts = JSON.parse(rawContacts);

    // 4. Build associations
    const associations = [];

    for (const contact of contacts) {
      const characterId = contact.properties.character_id;
      const contactId = contact.id;
      const locationId = characterLocationMap.get(characterId);

      if (locationId && companyIdMap.has(locationId)) {
        const companyId = companyIdMap.get(locationId);
        associations.push({
          from: contactId,
          to: companyId,
          type: 'contact_to_company'
        });
      }
    }

    await fs.promises.writeFile(
      path.join(__dirname, '../data/associations.json'),
      JSON.stringify(associations, null, 2)
    );

    console.log(`Total associations generated: ${associations.length}`);

  } catch (error) {
    console.error('Error mapping associations:', error);
  }
}

mapAssociations();
