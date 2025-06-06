const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ accessToken: process.env.MIRROR_TOKEN });

exports.handleCompanyUpsert = async (req, res, next) => {
  try {
    const {
      location_id,
      name,
      location_type,
      dimension,
      creation_date
    } = req.body;

    const locationIdStr = location_id?.toString();
    let creationDateStr = undefined;
    if (creation_date) {
      creationDateStr = typeof creation_date === 'number'
        ? creation_date.toString()
        : creation_date;
    }

    const companyPropsBase = {
      name,
      location_type,
      dimension,
      creation_date: creationDateStr
    };

    console.log(`🔍 Buscando compañía con location_id: ${locationIdStr}`);

    // ✅ FIX: No uses `body:` aquí
    const searchResponse = await hubspotClient.crm.companies.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'location_id',
              operator: 'EQ',
              value: locationIdStr
            }
          ]
        }
      ],
      properties: ['location_id', 'name', 'location_type', 'dimension', 'creation_date']
    });

    const foundCompany = searchResponse.results.find(
      company => company.properties?.location_id === locationIdStr
    );

    let companyId;
    let action;

    if (foundCompany) {
      companyId = foundCompany.id;
      console.log(`✏️ Compañía encontrada (ID: ${companyId}), actualizando...`);

      await hubspotClient.crm.companies.basicApi.update(companyId, {
        properties: companyPropsBase
      });

      action = 'updated';
    } else {
      console.log('➕ No se encontró compañía, creando nueva...');

      const created = await hubspotClient.crm.companies.basicApi.create({
        properties: {
          ...companyPropsBase,
          location_id: locationIdStr // Solo al crear
        }
      });

      companyId = created.id;
      action = 'created';
    }

    return res.status(200).json({
      message: `Company ${action} successfully`,
      companyId
    });

  } catch (error) {
    console.error('❌ Error while processing company:', error?.body || error.message);
    next(error);
  }
};
