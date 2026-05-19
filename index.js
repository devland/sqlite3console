const { spawn } = require("child_process");
module.exports = function (args) {
  let output = '';
  let data = '';
  let errorData = '';
  let queryResolve;
  let queryReject;
  const handle = (error, result) => {
    if (error && typeof queryReject == 'function') {
      queryReject(error);
    }
    else if (typeof queryResolve == 'function') {
      queryResolve(result);
    }
    queryReject = null;
    queryResolve = null;
  }
  const computeParams = (map = []) => {
    let params = '';
    for (let key of Object.keys(map)) {
      if (typeof map[key] == 'undefined') {
        continue;
      }
      params += `.parameter set :${key} "${map[key]}"\n`;
    }
    return params;
  }
  this.run = (query, map) => {
    data = '';
    return new Promise((resolve, reject) => {
      queryResolve = resolve;
      queryReject = reject;
      const params = computeParams(map);
      shell.stdin.write(params + query + ';\n');
    });
  }
  this.end = () => {
    return new Promise((resolve, reject) => {
      queryResolve = resolve;
      queryReject = reject;
      shell.stdin.end();
    });
  }
  shell = spawn('sqlite3', ['-json'].concat(args));
  shell.stdout.setEncoding('utf8');
  shell.stderr.setEncoding('utf8');
  shell.stdout.on('data', (chunk) => {
    data += chunk;
    try {
      output = JSON.parse(data);
      handle(null, output);
    }
    catch (error) {
      // JSON.parse error due to partial data; safe to ignore;
      // console.log(error);
    }
  });
  shell.stderr.on('data', (chunk) => {
    handle(chunk);
  });
  shell.on('close', (code) => {
    handle(null, code);
  });
}
