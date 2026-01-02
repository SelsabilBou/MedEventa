const db = require('./db');

const sql = `
  DESCRIBE inscription_workshop;
`;

db.query(sql, (err, results) => {
    if (err) {
        console.error('Error describing inscription_workshop:', err);
    } else {
        console.log('inscription_workshop:', results);
    }

    //   const sql2 = `DESCRIBE workshop;`;
    //   db.query(sql2, (err2, res2) => {
    //       if (err2) console.error(err2);
    //       else console.log('workshop:', res2);
    //       process.exit(0);
    //   });
    process.exit(0);
});
