#!/bin/bash
source passphrase
source mmcoinsexport
pkill -15 marketmaker
./marketmaker "{\"gui\":\"nogui\",\"client\":1, \"userhome\":\"/${HOME#"/"}\", \"passphrase\":\"$passphrase\", \"coins\":$coins}" &
sleep 3
curl --url "http://127.0.0.1:7783" --data "{\"userpass\":\"470f8d83cf4389502d7cf20de971e61cbeb836365e8daca4df0131fa7e374a60\",\"method\":\"getcoins\"}"
sleep 3
curl "http://46.20.235.46:8111/api/mm/coins/start"
sleep 10
curl "http://46.20.235.46:8111/api/mm/prices/start"
sleep 5
curl "http://46.20.235.46:8111/api/mm/orderbook/start"