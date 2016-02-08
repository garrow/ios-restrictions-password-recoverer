importScripts('vendor/crypto.js');

worker = {
  config: {},

  setup: function(new_config) {
    new_config['dec_key']  = CryptoJS.enc.Base64.parse(new_config.key);
    new_config['dec_salt'] = CryptoJS.enc.Base64.parse(new_config.salt);
    config                 = new_config;
    postMessage({state: 'ready'});
  },

  attempt_decode: function(password) {
    var decryptOptions = {keySize: 5, iterations: 1000},
        code  = CryptoJS.PBKDF2(password, config.dec_salt, decryptOptions),
        state = 'failure';

    if (code.toString() == config.dec_key) {
      state = 'success';
    }
    postMessage({state: state, key: code.toString(), result: password})
  },

  handlePostMessage: function(e) {
    var message = e.data;

    if (message.task == 'setup') {
      worker.setup(message);

    } else if (message.task == 'decode') {
      worker.attempt_decode(message.pass);
    }
  }
};

onmessage = worker.handlePostMessage;
