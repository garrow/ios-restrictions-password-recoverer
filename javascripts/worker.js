importScripts('vendor/crypto.js');

var crypto = {
  options: { keySize: 5, iterations: 1000 },

  encryptPassword: function(password, salt) {
    return CryptoJS.PBKDF2(password, salt, this.options).toString();
  },

  parseBase64: function(str) {
    return CryptoJS.enc.Base64.parse(str);
  }
};

var worker = {
  knownKey: "",
  salt: "",

  setup: function(new_config) {
    this.knownKey = crypto.parseBase64(new_config.keyBase64);
    this.salt     = crypto.parseBase64(new_config.saltBase64);

    postMessage({state: 'ready'});
  },

  attempt_decode: function(password) {
    var state = 'failure',
        encryptedKey = crypto.encryptPassword(password, this.salt);

    if (encryptedKey == this.knownKey) {
      state = 'success';
    }
    postMessage({state: state, key: encryptedKey, result: password})
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
