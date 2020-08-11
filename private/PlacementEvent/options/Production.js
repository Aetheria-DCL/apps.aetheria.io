const fs = require('fs');

module.exports = {
    key: fs.readFileSync('/etc/letsencrypt/live/aetheria.io/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/aetheria.io/cert.pem'),
    port: 10002,
    _https: true
}