const path = require('path');
const fixPath = require('fix-path');
const os = require('os');

module.exports = (api) => {
  api.pathsDaemons = () => {
    if (!api) api = { paths: {} };
    else if (!api.paths) api.paths = {};

    switch (os.platform()) {
      case 'darwin':
        fixPath();
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/osx'),
        api.paths.kmdDir = `${process.env.HOME}/Library/Application Support/Komodo`,
        api.paths.zcashParamsDir = `${process.env.HOME}/Library/Application Support/ZcashParams`;
        return api;
        break;

      case 'linux':
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/linux64'),
        api.paths.kmdDir = `${process.env.HOME}/.komodo`,
        api.paths.zcashParamsDir = `${process.env.HOME}/.zcash-params`;
        return api;
        break;

      case 'win32':
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/win64'),
        api.paths.komodocliDir = path.normalize(api.paths.komodocliDir),
        api.paths.kmdDir = `${process.env.HOME}/Komodo`,
        api.paths.kmdDir = path.normalize(api.paths.kmdDir),
        api.paths.zcashParamsDir = `${process.env.HOME}/ZcashParams`;
        api.paths.zcashParamsDir = path.normalize(api.paths.zcashParamsDir);
        return api;
        break;
    }
  }

  return api;
};
