const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ accessToken: process.env.MIRROR_TOKEN });

const upsertContact = async (req, res, next) => {
  try {
    const {
      character_id,
      firstname,
      lastname,
      character_species,
      character_gender,
      status_character,
      location_id
    } = req.body;

    if (!character_id) {
      return res.status(400).json({ error: 'character_id is required' });
    }

    const contactProps = {
      character_id: character_id.toString(),
      firstname,
      lastname,
      character_species,
      character_gender,
      status_character
    };

    // Limpieza: elimina propiedades null/undefined excepto character_id
    const cleanUpdateProps = { ...contactProps };
    delete cleanUpdateProps.character_id;
    Object.keys(cleanUpdateProps).forEach(
      key => (cleanUpdateProps[key] == null) && delete cleanUpdateProps[key]
    );

    // Buscar contacto por character_id
    const contactSearchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'character_id',
          operator: 'EQ',
          value: character_id.toString()
        }]
      }],
      properties: ['character_id', 'firstname', 'lastname']
    };

    console.log(`🔍 Searching for contact with character_id: ${character_id}`);
    const searchRes = await hubspotClient.crm.contacts.searchApi.doSearch(contactSearchPayload);

    let contactId = null;
    let action = '';

    const existingContact = searchRes.results.find(contact =>
      contact.properties.character_id?.toString() === character_id.toString()
    );

    if (existingContact) {
      contactId = existingContact.id;
      await hubspotClient.crm.contacts.basicApi.update(contactId, { properties: cleanUpdateProps });
      action = 'updated';
      console.log(`✅ Contact ${contactId} UPDATED`);
    } else {
      try {
        const created = await hubspotClient.crm.contacts.basicApi.create({ properties: contactProps });
        contactId = created.id;
        action = 'created';
        console.log(`✅ Contact ${contactId} CREATED`);
      } catch (createErr) {
        if (createErr.message.includes('already has that value')) {
          console.log(`⚠️ Duplicate detected. Retrying search and update...`);
          const retrySearch = await hubspotClient.crm.contacts.searchApi.doSearch(contactSearchPayload);
          const retryContact = retrySearch.results[0];
          if (retryContact) {
            contactId = retryContact.id;
            await hubspotClient.crm.contacts.basicApi.update(contactId, { properties: cleanUpdateProps });
            action = 'updated';
            console.log(`✅ Contact ${contactId} UPDATED after duplicate`);
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }
    }

    // Asociación con compañía SOLO si location_id está definido y no vacío
    let companyId = null;
    let associated = false;

    if (location_id) {
      console.log(`🔍 Searching for company with exact location_id: ${location_id}`);

      const companySearch = await hubspotClient.crm.companies.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'location_id',
            operator: 'EQ',
            value: location_id.toString()
          }]
        }],
        properties: ['location_id', 'name']
      });

      console.log(`🔎 Company search results:`, companySearch.results);

      const matchedCompany = companySearch.results.find(company => {
        const compLocationId = company.properties.location_id;
        return compLocationId && compLocationId.toString() === location_id.toString();
      });

      if (matchedCompany) {
        companyId = matchedCompany.id;
        try {
          await hubspotClient.crm.associations.v4.batchApi.create('contacts', 'companies', {
            inputs: [{
              _from: { id: contactId },
              to: { id: companyId },
              types: [{
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 1
              }]
            }]
          });
          associated = true;
          console.log(`✅ Associated contact ${contactId} with company ${companyId}`);
        } catch (assocErr) {
          console.warn(`❌ Association failed: ${assocErr.message}`);
        }
      } else {
        console.log(`❌ No exact company found with location_id ${location_id}`);
      }
    }

    return res.status(200).json({
      message: `Contact ${action} successfully`,
      action,
      character_id,
      contactId,
      companyId,
      associated
    });

  } catch (error) {
    console.error(`❌ Fatal error in upsertContact: ${error.message}`);
    return next(error);
  }
};

module.exports = { upsertContact };
