function deletePost(req, res) {
    const fs = require('fs');
    const postID = req.params[0].substr(1);
    let query = 'select * from posts where post_id=?';
    con.query(query, [postID], (err, result) => {
        if (err) {
            return error(err);
        }
        if (result.length !== 1) {
            return res.status(404).send({
                status: 'error',
                errorCode: 'NOTFOUND_ERR',
                msg: 'post not found'
            });
        }

        query = 'delete from posts where post_id=?';

        con.query(query, [postID], (err) => {
            if (err) {
                return error(err);
            }

            const images = JSON.parse(result[0].images);
            const key = Object.keys(images);

            key.map(k => {
                if (k === 'youtube') return;
                fs.unlink(images[k], err => {
                    if (err) console.log(err);
                });
            });

            res.send({
                status: 'ok',
                msg: 'post deleted'
            });
        });
    });

    function error(err) {
        console.log(err);
        return res.status(500).send({
            status: 'error',
            errorCode: 'UNCAUGHT_ERR',
            msg: 'unable to process request'
        });
    }
}

module.exports = deletePost;