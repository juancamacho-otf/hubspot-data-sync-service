const { getPrimeNumbersUpTo } = require('./primes');
const { saveToJson } = require('./saveToJson');


async function fetchAndSaveCharacters() {
  try {
    const baseUrl = 'https://rickandmortyapi.com/api/character';

    const firstPage = await fetch(baseUrl);
    const firstData = await firstPage.json();
    const totalCharacters = firstData.info.count;

    const primes = getPrimeNumbersUpTo(totalCharacters);
    console.log(`Total IDs to fetch (primes + Rick): ${primes.length}`);

    const results = [];
    const chunkSize = 50;

    for (let i = 0; i < primes.length; i += chunkSize) {
      const chunk = primes.slice(i, i + chunkSize);
      const res = await fetch(`${baseUrl}/${chunk.join(',')}`);
      const data = await res.json();
      results.push(...(Array.isArray(data) ? data : [data]));
    }

    console.log(`Total characters fetched: ${results.length}`);
    saveToJson('./data/characters.json', results);

  } catch (error) {
    console.error('Error fetching characters:', error);
  }
}

fetchAndSaveCharacters();
