const fs = require('fs');
const ac = JSON.parse(fs.readFileSync('./acParams.json'));

for (let i = 0; i < ac.length; i++) {
  let params = '';

  for (let key in ac[i]) {
    if (key === 'addnode') {
      for (let j = 0; j < ac[i].addnode.length; j++) {
        params += ` -addnode=${ac[i].addnode[j]}`;
      }
    } else {
      if (key !== 'ac_name') params += ` -${key}=${ac[i][key]},`;
    }
  }

  console.log(`${ac[i].ac_name}: '${params}'`);
}