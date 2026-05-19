const shell = require('../index.js');
let sql = new shell(['db.sqlite3']);
let benchStart;
let benchEnd;
benchStart = performance.now();
sql.run('select random() from generate_series(1, 2000);\n')
.then((result) => {
  benchEnd = performance.now();
  console.log(`>>> sql random() result done in ${benchEnd - benchStart} ms`);
  console.log(result);
  benchStart = performance.now();
  return sql.run('select * from users where name = :name', { name: 'admin' });
})
.then((result) => {
  benchEnd = performance.now();
  console.log(`>>> sql named parameter result done in ${benchEnd - benchStart} ms`);
  console.log(result);
  benchStart = performance.now();
  /* WARNING!!!
   * Since write queries like insert, update and delete do not output anything in the sqlite3 cli
   * remember to follow them with a select query
   * so that the shell stdout has something to print
   * so that the promise can resolve */
  return sql.run(`
insert into users (name, key) values (:name, :key);
select * from users where name = :name`, {
    name: 'new_user',
    key: 'some key 123'
  });
})
.then((result) => {
  benchEnd = performance.now();
  console.log(`>>> sql insert & select done in ${benchEnd - benchStart} ms`);
  console.log(result);
  benchStart = performance.now();
  return sql.run(`
delete from users where name = :name;
select count(*) as user_count from users`, { name: 'new_user' });
})
.then((result) => {
  benchEnd = performance.now();
  console.log(`>>> sql delete & select done in ${benchEnd - benchStart} ms`);
  console.log(result);
  return sql.end(); // ends shell process
})
.then((result) => {
  console.log(result == 0 ? '>>> done' : 'shell not closed...');
})
.catch((error) => {
  console.log('>>> query error');
  console.log(error);
  process.exit(1);
});
