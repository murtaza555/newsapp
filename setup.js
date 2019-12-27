const bcrypt = require('bcrypt');
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'newsapp',
    charset: 'utf8mb4'
});

const password = bcrypt.hashSync('123456798', 10);

con.connect(err => {
    if (err) console.log(err);
    con.query("insert into users (user_id, email, name, password) values('admin_taha', 'tahabadshah555@gmail.com', 'taha badshah', ?);", [password], (err) => {
        if (err) console.log(err);
        else console.log('done');
    });
});