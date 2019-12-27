const cypto = require('crypto');
const bcrypt = require('bcrypt');
/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */


let check = 0;
var response = {
    status: 'ok',

};

function login(req, res) {
    const {
        email,
        password
    } = req.body;
    const errMsg = 'cannot process your request right now, please try again later';


    if (!email) {
        res.status(400).send('Email required');
    } else if (!password) {
        res.status(400).send('Password required');
    } else {
        const query = `select  password, user_id from users where email=?`;
        con.query(query, [email], (err, result) => {

            try {
                if (email === email) {

                    bcrypt.compare(password, result[0].password).then(equal => {
                        response = {
                            status: 'ok_admin',
                            email1: email
                        };


                    });
                }
            } catch (err) {
                console.log("no email found");
            }
            // if (check == 1) {

            //     console.log("here at murtaza3")
            //     var response1 = {
            //         status: 'ok_admin',
            //         email1: email
            //     };
            //     res.send(response1);


            // }
            if (err) {
                console.log(err);
                res.status(500).send(errMsg);
            } else if (result.length !== 1) {
                res.send({
                    status: 'error',
                    msg: 'User not found',
                    errorCode: 'NOT_FOUND_ERR'
                });
            } else {

                bcrypt.compare(password, result[0].password).then(equal => {
                    if (!equal) {
                        return res.send({
                            status: 'error',
                            msg: 'Incorrect password',
                            errorCode: 'INVALID_CREDENTIALS_ERR'
                        });
                    }
                    cypto.randomBytes(50, (err, buffer) => {
                        if (err) {
                            console.log(err);
                        }
                        const token = buffer.toString('base64');
                        const userid = result[0].user_id;
                        const path = '/';
                        const maxAge = new Date(Date.now() + 3600000 * 24 * 7).getTime();
                        const query = 'insert into logins (user_id, token, device, expire) values(?, ?, ?, ?)';
                        con.query(query, [userid, token, '', maxAge], (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(errMsg);
                            }
                            if (response.status == 'ok_admin') {

                                response = {
                                    status: 'ok',
                                    msg: 'Login success',
                                    loginType: 'mainadmin'
                                };

                            } else {
                                response = {
                                    status: 'ok',
                                    msg: 'Login success',
                                    loginType: 'admin'
                                };
                            }



                            res.cookie('token', token, {
                                maxAge,
                                path
                            });
                            res.cookie('user', userid, {
                                maxAge,
                                path
                            });

                            res.send(response);
                        });
                    });
                });
            }


        });
    }
}

module.exports = login;