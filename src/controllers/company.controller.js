const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ accessToken: process.env.MIRROR_TOKEN });

exports.handleCompanyUpsert = async (req, res, next) => {
  try {
    const {
      location_id,
      location_name,
      location_type,
      resident_count
    } = req.body;

    const companyData = {
      properties: {
        location_id,
        location_name,
        location_type,
        resident_count
      }
    };

    // 1. Search for existing company
    const searchResponse = await hubspotClient.crm.companies.searchApi.doSearch({
      body: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'location_id',
                operator: 'EQ',
                value: location_id
              }
            ]
          }
        ],
        properties: ['location_id']
      }
    });

    let companyId;
    let action;

    if (searchResponse.results.length > 0) {
      companyId = searchResponse.results[0].id;
      await hubspotClient.crm.companies.basicApi.update(companyId, { properties: companyData.properties });
      action = 'updated';
      console.log(`Company ${companyId} updated`);
    } else {
      const created = await hubspotClient.crm.companies.basicApi.create({ properties: companyData.properties });
      companyId = created.id;
      action = 'created';
      console.log(`Company ${companyId} created`);
    }

    return res.status(200).json({
      message: `Company ${action} successfully`,
      companyId
    });
  } catch (error) {
    console.error('Error while processing company:', error.message);
    next(error);
  }
};
