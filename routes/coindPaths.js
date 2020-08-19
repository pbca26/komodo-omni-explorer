const path = require('path');
const fixPath = require('fix-path');
const os = require('os');

const pathsAgama = (api) => {
  if (!api) api = { paths: {} };
  else if (!api.paths) api.paths = {};

  if (global.USB_MODE) {
    if (os.platform() === 'darwin') fixPath()

    api.paths.VerusDesktopDir = `${global.HOME}/Verus-Desktop`;
    api.paths.agamaDir = `${global.HOME}/Verus-Desktop/appdata`;
    api.paths.backupDir = `${global.HOME}/Verus-Desktop/backups`;

    if (os.platform() === 'win32') {
      api.paths.VerusDesktopDir = path.normalize(api.paths.VerusDesktopDir);
      api.paths.agamaDir = path.normalize(api.paths.agamaDir);
      api.paths.backupDir = path.normalize(api.paths.backupDir);
    }

    return api;
  } else {
    switch (os.platform()) {
      case "darwin":
        fixPath();
        api.paths.VerusDesktopDir = `${global.HOME}/Library/Application Support/Verus-Desktop`;

        api.paths.agamaDir = `${global.HOME}/Library/Application Support/Verus-Desktop/appdata`;
        api.paths.backupDir = `${global.HOME}/Library/Application Support/Verus-Desktop/backups`;
        return api;
        break;

      case "linux":
        api.paths.VerusDesktopDir = `${global.HOME}/.verus-desktop`;

        api.paths.agamaDir = `${global.HOME}/.verus-desktop/appdata`;
        api.paths.backupDir = `${global.HOME}/.verus-desktop/backups`;
        return api;
        break;

      case "win32":
        api.paths.VerusDesktopDir = `${global.HOME}/Verus-Desktop`;
        api.paths.VerusDesktopDir = path.normalize(api.paths.VerusDesktopDir);

        api.paths.agamaDir = `${global.HOME}/Verus-Desktop/appdata`;
        api.paths.agamaDir = path.normalize(api.paths.agamaDir);

        api.paths.backupDir = `${global.HOME}/Verus-Desktop/backups`;
        api.paths.backupDir = path.normalize(api.paths.backupDir);
        return api;
        break;
    }
  }
};

const pathsDaemons = (api) => {
  if (!api) api = { paths: {} };
  else if (!api.paths) api.paths = {};

  if (global.USB_MODE) {
    switch (os.platform()) {
      case 'darwin':
        fixPath();
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/osx'),
        api.paths.kmdDir = `${global.HOME}/Komodo`,
        api.paths.vrscDir = `${global.HOME}/Komodo/VRSC`,
        api.paths.verusDir = `${global.HOME}/Verus`,
        api.paths.verusTestDir = `${global.HOME}/VerusTest`,
        api.paths.zcashParamsDir = `${global.HOME}/ZcashParams`,
        api.paths.chipsDir = `${global.HOME}/Chips`,
        api.paths.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/darwin/x64/marketmaker');
        return api;
        break;
  
      case 'linux':
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/linux64'),
        api.paths.kmdDir = `${global.HOME}/Komodo`,
        api.paths.vrscDir = `${global.HOME}/Komodo/VRSC`,
        api.paths.verusDir = `${global.HOME}/Verus`,
        api.paths.verusTestDir = `${global.HOME}/VerusTest`,
        api.paths.zcashParamsDir = `${global.HOME}/ZcashParams`,
        api.paths.chipsDir = `${global.HOME}/Chips`,
        api.paths.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/linux/x64/marketmaker');
        return api;
        break;
  
      case 'win32':
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/win64'),
        api.paths.komodocliDir = path.normalize(api.paths.komodocliDir),
        api.paths.kmdDir = `${global.HOME}/Komodo`,
        api.paths.kmdDir = path.normalize(api.paths.kmdDir),
        api.paths.vrscDir = `${global.HOME}/Komodo/VRSC`,
        api.paths.vrscDir = path.normalize(api.paths.vrscDir),
        api.paths.verusDir = `${global.HOME}/Verus`,
        api.paths.verusDir = path.normalize(api.paths.verusDir),
        api.paths.verusTestDir = `${global.HOME}/VerusTest`,
        api.paths.verusTestDir = path.normalize(api.paths.verusTestDir),
        api.paths.chipsDir = `${global.HOME}/Chips`,
        api.paths.chipsDir = path.normalize(api.paths.chipsDir);
        api.paths.zcashParamsDir = `${global.HOME}/ZcashParams`;
        api.paths.zcashParamsDir = path.normalize(api.paths.zcashParamsDir);
        api.paths.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/win32/x64/marketmaker.exe');
        api.paths.mmBin = path.normalize(api.paths.mmBin);
        return api;
        break;
    }
  } else {
    switch (os.platform()) {
      case 'darwin':
        fixPath();
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/osx'),
        api.paths.kmdDir = `${global.HOME}/Library/Application Support/Komodo`,
        api.paths.vrscDir = `${global.HOME}/Library/Application Support/Komodo/VRSC`,
        api.paths.verusDir = `${global.HOME}/Library/Application Support/Verus`,
        api.paths.verusTestDir = `${global.HOME}/Library/Application Support/VerusTest`,
        api.paths.zcashParamsDir = `${global.HOME}/Library/Application Support/ZcashParams`,
        api.paths.chipsDir = `${global.HOME}/Library/Application Support/Chips`,
        api.paths.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/darwin/x64/marketmaker');
        return api;
        break;
  
      case 'linux':
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/linux64'),
        api.paths.kmdDir = `${global.HOME}/.komodo`,
        api.paths.vrscDir = `${global.HOME}/.komodo/VRSC`,
        api.paths.verusDir = `${global.HOME}/.verus`,
        api.paths.verusTestDir = `${global.HOME}/.verustest`,
        api.paths.zcashParamsDir = `${global.HOME}/.zcash-params`,
        api.paths.chipsDir = `${global.HOME}/.chips`,
        api.paths.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/linux/x64/marketmaker');
        return api;
        break;
  
      case 'win32':
        api.paths.komodocliDir = path.join(__dirname, '../../assets/bin/win64'),
        api.paths.komodocliDir = path.normalize(api.paths.komodocliDir),
        api.paths.kmdDir = `${global.HOME}/Komodo`,
        api.paths.kmdDir = path.normalize(api.paths.kmdDir),
        api.paths.vrscDir = `${global.HOME}/Komodo/VRSC`,
        api.paths.vrscDir = path.normalize(api.paths.vrscDir),
        api.paths.verusDir = `${global.HOME}/Verus`,
        api.paths.verusDir = path.normalize(api.paths.verusDir),
        api.paths.verusTestDir = `${global.HOME}/VerusTest`,
        api.paths.verusTestDir = path.normalize(api.paths.verusTestDir),
        api.paths.chipsDir = `${global.HOME}/Chips`,
        api.paths.chipsDir = path.normalize(api.paths.chipsDir);
        api.paths.zcashParamsDir = `${global.HOME}/ZcashParams`;
        api.paths.zcashParamsDir = path.normalize(api.paths.zcashParamsDir);
        api.paths.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/win32/x64/marketmaker.exe');
        api.paths.mmBin = path.normalize(api.paths.mmBin);
        return api;
        break;
    }
  }
  
}

const setDaemonPath = (api, daemonName) => {
  if (!api) api = { paths: {} };
  else if (!api.paths) api.paths = {};

  let binName = daemonName + "Bin";
  switch (os.platform()) {
    case 'darwin':
      fixPath();
      api.paths[binName] = path.join(__dirname, `../../assets/bin/osx/${daemonName}/${daemonName}`);
      return api;
      break;
    case 'linux':
      api.paths[binName] = path.join(__dirname, `../../assets/bin/linux64/${daemonName}/${daemonName}`);
      return api;
      break;
    case 'win32':
      api.paths[binName] = path.join(__dirname, `../../assets/bin/win64/${daemonName}/${daemonName}.exe`),
      api.paths[binName] = path.normalize(api.paths[binName]);
      return api;
      break;
  }
}

const setCoinDir = (api, coin, dirNames, absolute = false) => {
  if (!api) api = { paths: {} };
  else if (!api.paths) api.paths = {};
  const { darwin, linux, win32 } = dirNames

  let dirName = coin + "Dir";
  switch (os.platform()) {
    case 'darwin':
      fixPath();
      api.paths[dirName] = absolute
        ? darwin
        : global.USB_MODE
        ? `${global.HOME}/${darwin}`
        : `${global.HOME}/Library/Application Support/${darwin}`;
      return api;
    case 'linux':
      api.paths[dirName] = absolute ? linux : `${global.HOME}/${linux}`
      return api;
    case 'win32':
      api.paths[dirName] = absolute ? win32 : `${global.HOME}/${win32}`,
      api.paths[dirName] = path.normalize(api.paths[dirName]);
      return api;
  }
}

module.exports = {
  pathsAgama,
  pathsDaemons,
  setDaemonPath,
  setCoinDir
};
