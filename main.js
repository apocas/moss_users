require('colors');

var Server = require('./lib/server'),
  async = require('async'),
  read = require('read');

var buildArray = function(num) {
  var out = [];
  for (var i = num - 1; i >= 0; i--) {
    out.push('user' + i);
  }
  return out;
};

var handler = function(passphrase) {
  var s = new Server('130.185.82.65', 22, 'root', process.env['HOME'] + '/.ssh/id_rsa', passphrase);

  s.on('ready', function() {
    console.log('Connected'.green);

    var iterator = function(user, callback) {
      s.run('useradd ' + user + '; echo \'mossiscte\' | passwd --stdin ' + user, function(stream) {

        stream.on('data', function(data, extended) {
          console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data);
        });

        stream.on('exit', function(code, signal) {
          callback();
        });
      });
    };

    async.mapSeries(buildArray(15), iterator, function(err, results){
      process.exit(0);
    });
  });
};


read({ prompt: 'passphrase: ', silent: true }, function(er, password) {
  handler(password);
});