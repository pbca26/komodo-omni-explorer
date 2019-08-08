const fs = require('fs');
const ac = JSON.parse(fs.readFileSync('./acParams.json'));

for (let i = 0; i < ac.length; i++) {
  console.log(`${ac[i].ac_name}: ${ac[i].ac_supply}`);
}