#!/bin/bash
source passphrase
source coins
pkill -15 marketmaker;
cd ..;
./marketmaker "{\"gui\":\"nogui\",\"client\":1, \"userhome\":\"/${HOME#"/"}\", \"passphrase\":\"$passphrase\", \"coins\":$coins}" &
sleep 3;
curl --url "http://127.0.0.1:7783" --data "{\"userpass\":\"470f8d83cf4389502d7cf20de971e61cbeb836365e8daca4df0131fa7e374a60\",\"method\":\"getcoins\"}"
