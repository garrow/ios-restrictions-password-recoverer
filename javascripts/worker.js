importScripts('vendor/crypto.js');

var config = {};

function setup(new_config) {
  new_config['dec_key']  = CryptoJS.enc.Base64.parse(new_config.key);
  new_config['dec_salt'] = CryptoJS.enc.Base64.parse(new_config.salt);
  config                 = new_config;
  postMessage({state: 'ready'});
}

function attempt_decode(pass) {
  var decryptOptions = {keySize: 5, iterations: 1000},
      code  = CryptoJS.PBKDF2(pass, config.dec_salt, decryptOptions),
      state = 'failure';

  if (code.toString() == config.dec_key) {
    state = 'success';
  }
  postMessage({state: state, key: code.toString(), result: pass})
}

function handlePostMessage(e) {
  var message = e.data;

  if (message.task == 'setup') {
    setup(message);

  } else if (message.task == 'decode') {
    attempt_decode(message.pass);
  }
}

onmessage = handlePostMessage;
