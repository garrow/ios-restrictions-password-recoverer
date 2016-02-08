console.log('Begin');

var salt = 'dY8CSw==';
var key = 'jOWLQJsvys0v/1P5JrGvgvBrpLo=';

var config = {
  key: key,
  salt: salt
};

// ---

var searchRange = [];
var rangeStart  = 0;
var rangeEnd    = 9999;

var rangeStart  = 5250;
var rangeEnd    = 5255;

for (i = rangeStart; i <= rangeEnd; ++i) {
  searchRange.push(("000" + i).slice(-4));
}

// ---

var foundCode = null;

function handleWorkerFinish(e) {
  var state = e.data.state,
      result = e.data.result;

  if (state == 'success') {
    console.dir('success :: ' + result);
    foundCode = result;
  } else {
    triggerWorker(e.target);
  }
}

// ---

var poolSize = 8;
var workerPool = [];

for (i = 0; i < poolSize; ++i) {
  var worker = new Worker('javascripts/worker.js');
  worker.onmessage = handleWorkerFinish;
  worker.onerror = function(e){
    throw new Error(e.message + " (" + e.filename + ":" + e.lineno + ")");
  };
  workerPool.push(worker);
}

function triggerWorker(worker) {
  if (foundCode != null){ return; }

  var nextWorkItem = searchRange.pop();

  if (nextWorkItem) {
    worker.postMessage({task: 'decode', pass: nextWorkItem});
  }
}



workerPool.map(function(worker, _, _){
  worker.postMessage({task: 'setup', key: config.key, salt: config.salt});
  triggerWorker(worker);
});
