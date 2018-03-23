#!/bin/bash
source passphrase
source mmcoinsexport
npm start &
sleep 3

for i in `seq 1 9999`;
do
pkill -15 marketmaker
sleep 3
./marketmaker "{\"gui\":\"nogui\",\"client\":1, \"userhome\":\"/${HOME#"/"}\", \"passphrase\":\"$passphrase\", \"coins\":$coins}" &
sleep 3
curl --url "http://127.0.0.1:7783" --data "{\"userpass\":\"470f8d83cf4389502d7cf20de971e61cbeb836365e8daca4df0131fa7e374a60\",\"method\":\"getcoins\"}"
sleep 5
curl "https://www.atomicexplorer.com/api/mm/coins/start?override=0v3rr1d3"
sleep 10
curl "https://www.atomicexplorer.com/api/mm/prices/start?override=0v3rr1d3"
sleep 5
curl "https://www.atomicexplorer.com/api/mm/orderbook/start?override=0v3rr1d3"
echo "restart mm";
sleep 10800
done