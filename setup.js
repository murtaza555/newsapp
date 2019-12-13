const bcrypt = require('bcrypt');
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9216@fuckyoU',
    database: 'newsapp',
    charset: 'utf8mb4'
});

const password = bcrypt.hashSync('redeyenews123', 10);

con.connect(err => {
    if (err) console.log(err);
    con.query("insert into users (user_id, email, name, password) values('admin', 'redeyenews8@gmail.com', 'Shrichand Makhija', ?);", [password], (err) => {
        if (err) console.log(err);
        else console.log('done');
    });
});