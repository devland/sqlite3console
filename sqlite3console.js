const { spawn } = require("child_process");
module.exports = (args) => {
  return new Promise((dbResolve, dbReject) => {
    try {
      let output = '';
      let data = '';
      let sql = {};
      let queryResolve;
      let queryReject;
      const handle = (error, result) => {
        if (error && typeof queryReject == 'function') queryReject(error);
        else if (typeof queryResolve == 'function') queryResolve(result);
        queryReject = null;
        queryResolve = null;
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
        catch(error) {
          // JSON.parse error due to partial data; safe to ignore;
          //console.log(error);
        }
      });
      shell.stderr.on('data', (chunk) => {
        handle(chunk);
      });
      shell.on('close', (code) => {
        handle(null, code);
      });
      sql.run = (query) => {
        data = '';
        return new Promise((resolve, reject) => {
          queryResolve = resolve;
          queryReject = reject;
          shell.stdin.write(query);
        });
      }
      sql.end = (callback) => {
        return new Promise((resolve, reject) => {
          queryResolve = resolve;
          queryReject = reject;
          shell.stdin.end();
        });
      }
      dbResolve(sql);
    }
    catch(error) {
      dbReject(error);
    }
  });
}
