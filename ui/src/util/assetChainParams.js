import { sortObject } from 'agama-wallet-lib/src/utils';

const assetChainParams = sortObject({
  REVS: '-ac_supply=1300000 -addnode=78.47.196.146',
  SUPERNET: '-ac_supply=816061 -addnode=78.47.196.146',
  DEX: '-ac_supply=999999 -addnode=78.47.196.146',
  PANGEA: '-ac_supply=999999 -addnode=78.47.196.146',
  JUMBLR: '-ac_supply=999999 -addnode=78.47.196.146',
  BET: '-ac_supply=999999 -addnode=78.47.196.146',
  CRYPTO: '-ac_supply=999999 -addnode=78.47.196.146',
  HODL: '-ac_supply=9999999 -addnode=78.47.196.146',
  MSHARK: '-ac_supply=1400000 -addnode=78.47.196.146',
  BOTS: '-ac_supply=999999 -addnode=78.47.196.146',
  MGW: '-ac_supply=999999 -addnode=78.47.196.146',
  COQUI: '-ac_supply=72000000 -ac_ccactivate=200000 -addnode=78.47.196.146',
  WLC: '-ac_supply=210000000 -addnode=148.251.190.89',
  KV: '-ac_supply=1000000 -addnode=78.47.196.146',
  CEAL: '-ac_supply=366666666 -addnode=78.47.196.146',
  MESH: '-ac_supply=1000007 -addnode=78.47.196.146',
  MNZ: '-ac_supply=257142858 -addnode=51.15.138.138',
  AXO: '-ac_supply=200000000 -addnode=78.47.196.146',
  ETOMIC: '-ac_supply=100000000 -addnode=78.47.196.146',
  BTCH: '-ac_supply=20998641 -addnode=78.47.196.146',
  BEER: '-ac_supply=100000000 -addnode=78.47.196.146',
  PIZZA: '-ac_supply=100000000 -addnode=78.47.196.146',
  NINJA: '-ac_supply=100000000 -addnode=78.47.196.146',
  OOT: '-ac_supply=216000000 -addnode=174.138.107.226 -ac_sapling=5000000',
  BNTN: '-ac_supply=500000000 -addnode=94.130.169.205',
  CHAIN: '-ac_supply=999999 -addnode=78.47.146.222',
  PRLPAY: '-ac_supply=500000000 -addnode=13.250.226.125',
  DSEC: '-ac_supply=7000000 -addnode=185.148.147.30',
  GLXT: '-ac_supply=10000000000 -addnode=13.230.224.15',
  EQL: '-ac_supply=500000000 -addnode=46.101.124.153 -ac_ccactivate=205000',
  ZILLA: '-ac_supply=11000000 -addnode=54.39.23.248',
  RFOX: '-ac_supply=1000000000 -ac_reward=100000000 -addnode=78.47.196.146',
  SEC: '-ac_cc=333 -ac_supply=1000000000 -addnode=185.148.145.43',
  CCL: '-ac_supply=200000000 -ac_end=1 -ac_cc=2 -addressindex=1 -spentindex=1 -addnode=142.93.136.89 -addnode=195.201.22.89',
  MGNX: '-ac_supply=12465003 -ac_staked=90 -ac_reward=2000000000 -ac_halving=525960 -ac_cc=2 -ac_end=2629800 -addnode=142.93.27.180',
  CALL: '-ac_supply=52500000 -ac_reward=1250000000 -ac_end=4200000 -ac_halving=1400000 -addnode=185.162.65.14 -addnode=185.162.65.15',
  PIRATE: '-ac_supply=0 -ac_reward=25600000000 -ac_halving=77777 -ac_private=1 -addnode=136.243.102.225 -addnode=78.47.205.239',
  PUNGO: '-ac_supply=10000000 -ac_end=1 -addnode=190.114.254.104',
  DION: '-ac_supply=3900000000 -ac_reward=22260000000 -ac_staked=100 -ac_cc=1 -ac_end=4300000000 -addnode=51.75.124.34',
  KOIN: '-ac_supply=125000000 -addnode=3.0.32.10',
  KMDICE: '-ac_name=KMDICE -ac_supply=10500000 -ac_reward=2500000000 -ac_halving=210000 -ac_cc=2 -addressindex=1 -spentindex=1 -addnode=144.76.217.232',
  VRSC: '-ac_algo=verushash -ac_cc=1 -ac_veruspos=50 -ac_supply=0 -ac_eras=3 -ac_reward=0,38400000000,2400000000 -ac_halving=1,43200,1051920 -ac_decay=100000000,0,0 -ac_end=10080,226080,0 -ac_timelockgte=19200000000 -ac_timeunlockfrom=129600 -ac_timeunlockto=1180800 -addnode=185.25.48.236 -addnode=185.64.105.111',
  PTX: '-ac_supply=12000000 -ac_reward=1500000000 -ac_staked=50 -ac_end=12000000 -addnode=142.11.199.63',
  ZEX: '-ac_reward=13000000000 -ac_halving=525600 -ac_pubkey=039d4a50cc70d1184e462a22edb3b66385da97cc8059196f8305c184a3e21440af -ac_cc=2 -ac_founders=1 -addnode=5.9.102.210',
  LUMBER: '-ac_algo=verushash -ac_veruspos=80 -ac_cc=2 -ac_supply=1260000 -ac_reward=470000000 -ac_halving=2100000 -addnode=149.202.84.141',
  ILN: '-ac_supply=10000000000 -ac_cc=2 -addnode=51.75.122.83',
  KSB: '-ac_supply=1000000000 -ac_end=1 -ac_public=1 -addnode=37.187.225.231 -addnode=217.182.129.38',
  OUR: '-ac_reward=1478310502 -ac_halving=525600 -ac_cc=42 -ac_supply=100000000 -ac_perc=7700 -ac_staked=93 -ac_pubkey=02652a3f3e00b3a1875a918314f0bac838d6dd189a346fa623f5efe9541ac0b98c -ac_public=1 -addnode=37.187.225.231 -addnode=217.182.129.38',
  RICK: '-ac_supply=90000000000 -ac_reward=100000000 -ac_cc=3 -addnode=138.201.136.145',
  MORTY: '-ac_supply=90000000000 -ac_reward=100000000 -ac_cc=3 -addnode=138.201.136.145',
  VOTE2019: '-ac_supply=123651638 -ac_public=1 -addnode=95.213.238.98',
});

export default assetChainParams;