# OpenTrade is the best opensource cryptocurrency exchange!

Live version: https://trade.multicoins.org/


Step-by-step install instructions:

1. Register on the VPS hosting like this https://m.do.co/c/b7bfce81f64d
2. Create "Droplet" Ubuntu 18 x64 / 2GB / 1vCPU / 50 GB SSD
3. Log in to Droplet over SSH (You will receive a email with IP, username and password)



```
sudo apt-get update
sudo apt-get install build-essential libssl-dev curl -y
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh
bash install_nvm.sh
reboot
```
### After Rebooting
```
nvm install 12.6.0

git clone --recurse-submodules https://github.com/sumpool/opentrade.git
cd opentrade/accountsserver
git checkout master
cd ..

sudo npm install 
sudo npm update
sudo npm install -g forever
```

## Here is an example of the file ~/opentrade/server/modules/private_constants.js Edit with your configs.
```
'use strict';

exports.recaptcha_priv_key = 'YOUR_GOOGLE_RECAPTCHA_PRIVATE_KEY';
exports.password_private_suffix = 'LONG_RANDOM_STRING1';
exports.SSL_KEY = '../ssl_certificates/privkey.pem'; //change to your ssl certificates private key
exports.SSL_CERT = '../ssl_certificates/fullchain.pem'; //change to your ssl certificates fullchain

exports.walletspassphrase = {
    'MC' : 'LONG_RANDOM_STRING2',
    'BTC' : 'LONG_RANDOM_STRING3',
    'DOGE' : 'LONG_RANDOM_STRING4'
};
```

**You MUST change default value exports.password_private_suffix !**

**After modifying, you can run exchange**

RAW
```
cd ~/opentrade/databaseServer
forever start main.js
cd ..

cd ~/opentrade/accountsserver
forever start main.js
cd ..

cd  ~/opentrade/server
forever start main.js
cd ..
```

### Navigate to exchange

In your browser address bar, type https://127.0.0.1
You will see OpenTrade.

The first registered user will be exchange administrator. 

# Add trade pairs

For each coin you should create ~/.coin/coin.conf file

This is common example for ~/.sumcoin/sumcoin.conf

```
server=1
daemon=1
rpcuser=long_random_string_one
rpcpassword=long_random_string_two
rpcport=3332
rpcclienttimeout=10
rpcallowip=127.0.0.1
#rpcallowip=Your_Sumcoin_Daemon_IP
upnp=0
rpcworkqueue=1000
enableaccounts=1
litemode=1
staking=0

#sumnode.io Map
addnode=134.209.173.235
#addnode=ANY_OTHER_NODE_IP

```

### Encrypt Wallet
Also, you must encrypt your cryptocurrency wallet with this command.

```
./sumcoin-cli encryptwallet random_long_string_SAME_AS_IN_FILE_private_constants.js

```

*If coin have no "coin-cli" file then try something like "coind" instead*

*If coin is not supported by encryption (like ZerroCash and it forks) the coin can not be added to OpenTrade.*

## Adding Coins to Exchange
Add coin details to OpenTrade

1. Register on exchange. The first registered user will be exchange administrator.

2. Go to "Admin Area" -> "Coins" -> "Add coin"

3. Fill up all fields and click "Confirm"

4. Fill "Minimal confirmations count" and "Minimal balance" and uncheck and check "Coin visible" button

5. Click "Save"

6. Check RPC command for the coin. If it worked then coin was added to the exchange!

All visible coins should be appear in the Wallet. You should create default coin pairs now.


### Creating trade Pairs
File ~/opentrade/server/constants.js have settings that you can change

Resource:
https://github.com/sumpool/opentrade/blob/master/server/constants.js

```
sudo nano opentrade/server/constants.js
```
```
exports.NOREPLY_EMAIL = 'no-reply@email.com'; //change no-reply email
exports.SUPPORT_EMAIL = 'support@email.com'; //change to your valid email for support requests
const DOMAIN = 'localhost'; //Change to your domain name

exports.TRADE_MAIN_COIN = "Marycoin"; //change Marycoin to your main coin pair
exports.TRADE_DEFAULT_PAIR = "Litecoin"; //change Litecoin to your default coin pair
exports.share.TRADE_COMISSION = 0.001; //change trade comission percent
exports.share.DUST_VOLUME = 0.000001; //change minimal order volume

exports.recaptcha_pub_key = "6LeX5SQUAAAAAKTieM68Sz4MECO6kJXsSR7_sGP1"; //change to your recaptcha public key

```

File ~/opentrade/static_pages/chart.html

```
const PORT_SSL = 40443; //change to your ssl port (usualy 443)
const MAIN_COIN = 'Marycoin'; //change Marycoin to your main coin pair same as in constants.js
const DEFAULT_PAIR = 'Litecoin'; //change Litecoin to your default coin pair same as in constants.js
      
const TRADE_COMISSION = 0.001;
```

After that, your added coin should appear on the main page.



**Donate**
If you find this script is useful then consider donate please

Bitcoin 36WA1WESULub6Q434bQcnmpnk62oLD7vuQ

Marycoin M9dKNcBYgrbbE2f4tz3ud32KLKj1i9FrmN

Dogecoin DCJRhs9Pjr2FBrrUbKvFeWcYC6ZaF2GTAx

Litecoin LTbDdTijroJEyXt27apQSnuMY4RoXyjdq2

# License

OpenTrade is released under the terms of the MIT license. See LICENSE for more information or see https://opensource.org/licenses/MIT.



