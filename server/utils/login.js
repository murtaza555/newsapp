const cypto = require('crypto');
const bcrypt = require('bcrypt');
/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
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
        const query = `select password, user_id from users where email=?`;
        con.query(query, [email], (err, result) => {
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
                            const response = {
                                status: 'ok',
                                msg: 'Login success',
                                loginType: undefined
                            };
                            if (userid === 'admin') {
                                response.loginType = 'admin';
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