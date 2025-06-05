const fs = require('fs');
const path = require('path');

async function transformCharacters() {
  try {
    const rawData = await fs.promises.readFile(path.join(__dirname, '../data/characters.json'), 'utf8');
    const characters = JSON.parse(rawData);

    const transformed = characters.map(c => {
      const [firstname, ...rest] = c.name.split(' ');
      const lastname = rest.join(' ');

      return {
        properties: {
          character_id: c.id.toString(),
          firstname,
          lastname,
          status_character: c.status,
          character_species: c.species,
          character_gender: c.gender
        }
      };
    });

    await fs.promises.writeFile(
      path.join(__dirname, '../data/contacts.json'),
      JSON.stringify(transformed, null, 2)
    );

    console.log('Contacts transformed and saved to contacts.json');
    console.log(`Total contacts: ${transformed.length}`);

  } catch (err) {
    console.error('Error transforming characters:', err);
  }
}

transformCharacters();
