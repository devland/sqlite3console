const shell = require('../index.js');
let sql;
shell(['db.sqlite3']) // sqlite3 db to use; other sqlite3 cli arguments can be provided as array items
  .then((result) => {
    sql = result;
    return sql.run('SELECT random() FROM generate_series(1,2000);\n');
  })
  .then((result) => {
    console.log('>>> sql run 1 result');
    console.log(result);
    return sql.run('select * from users;\n');
  })
  .then((result) => {
    console.log('>>> sql run 2 result');
    console.log(result);
    return sql.end(); // ends shell process
  })
  .then((result) => {
    console.log('>>> shell end result');
    console.log(result);
  })
  .catch((error) => {
    console.log('>>> query error');
    console.log(error);
  });
