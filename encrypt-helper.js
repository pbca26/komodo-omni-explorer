const iocane = require('iocane');
const session = iocane.createSession()
  .use('cbc')
  .setDerivationRounds(300000);

const encrypt = session.encrypt.bind(session);
const decrypt = session.decrypt.bind(session);
const dataToEncrypt = {
  key: 'test',
};
const pass = '123';

for (let key in dataToEncrypt) {
  encrypt(dataToEncrypt[key], pass)
  .then((res) => {
    console.log(`${key}: ${res}`);
  });
}