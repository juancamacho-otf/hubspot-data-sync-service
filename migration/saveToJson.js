const fs = require('fs');

function saveToJson(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Archivo ${filename} guardado con éxito.`);
}

module.exports = { saveToJson };
