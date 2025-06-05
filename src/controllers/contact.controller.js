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

    const contactProps = {
      character_id,
      firstname,
      lastname,
      character_species,
      character_gender,
      status_character
    };

    const searchPayload = {
      filterGroups: [{
        filters: [{ propertyName: 'character_id', operator: 'EQ', value: character_id }]
      }],
      properties: ['character_id']
    };

    const searchRes = await hubspotClient.crm.contacts.searchApi.doSearch({ body: searchPayload });
    let contactId = null;
    let action = '';

    if (searchRes.results.length > 0) {
      contactId = searchRes.results[0].id;
      await hubspotClient.crm.contacts.basicApi.update(contactId, { properties: contactProps });
      action = 'updated';
    } else {
      const created = await hubspotClient.crm.contacts.basicApi.create({ properties: contactProps });
      contactId = created.id;
      action = 'created';
    }

    let companyId = null;
    if (location_id) {
      const companySearch = await hubspotClient.crm.companies.searchApi.doSearch({
        body: {
          filterGroups: [{
            filters: [{ propertyName: 'location_id', operator: 'EQ', value: location_id }]
          }],
          properties: ['location_id']
        }
      });

      if (companySearch.results.length > 0) {
        companyId = companySearch.results[0].id;
      }
    }

    let associated = false;
    if (contactId && companyId) {
      try {
        const response = await hubspotClient.crm.associations.v4.batchApi.create(
          'contacts',
          'companies',
          {
            inputs: [{
              _from: { id: contactId },
              to: { id: companyId },
              types: [{
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 1
              }]
            }]
          }
        );

        associated = response?.status === 'COMPLETE' ||
          (response?.results && response.results.length > 0);
      } catch (assocErr) {
        console.error('Error creating association:', assocErr.message);
      }
    }

    return res.status(200).json({
      message: `Contact ${action} successfully`,
      associated,
      contactId,
      companyId: companyId || null
    });
  } catch (error) {
    console.error(`Error in upsertContact: ${error.message}`);
    next(error);
  }
};

module.exports = { upsertContact };
