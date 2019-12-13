/**
 * 
 * @param {import('express').Request} req 
 * @param {function(object):void} onsuccess 
 * @param {function(string)} onerror 
 */
function validate(req, onsuccess, onerror) {
    const {
        user,
        token
    } = req.cookies;
    if (!user || !token) {
        return onerror({
            code: 200,
            msg: 'user is not logged in',
            errorCode: 'LOGIN_ERR'
        });
    } else {
        const time = new Date().getTime();
        const query = 'select * from logins where user_id=? and token=? and expire>?';
        con.query(query, [user, token, time], (err, result) => {
            if (err) {
                console.log(err);
                return onerror({
                    code: 500,
                    msg: 'unable to process request',
                    errorCode: 'UNCAUGHT_ERR'
                });
            }

            if (result.length !== 1) {
                return onerror({
                    code: 200,
                    msg: 'validation failed, user is not logged in',
                    errorCode: 'LOGIN_ERR'
                });
            } else {
                return onsuccess(result[0]);
            }
        });
    }
}

module.exports = validate;