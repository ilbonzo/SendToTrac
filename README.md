SendToTrac
==========

Chrome extension for send Trello card to Trac enviroment

This extension depends to [TrelloToTrac](https://github.com/ilbonzo/TrelloToTrac) plugin.

## Install

    $ git clone https://github.com/ilbonzo/SendToTrac

    $ cd SendToTrac/config
    $ copy config.js.sample config.js

Edit config.js with your data.

    var config = {
        // agileTrac = false
        agileTrac: true,
        baseUrl: 'host.tld/trac/',
        protocol: 'https',
        user: '',
        password: '',
        // trello key
        key: 'xxxx',
        // trello token
        token: 'xxxx'
    }

Load the checkout folder how unpack extension in Chrome.
https://developer.chrome.com/extensions/getstarted#unpacked


### Screenshot

![screenshot](https://raw.githubusercontent.com/ilbonzo/SendToTrac/master/images/screenshot.png)
