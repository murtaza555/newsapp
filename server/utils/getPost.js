module.exports = getPost;
/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function getPost(req, res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const postID = req.params[0].substr(1);
    const user_id = req.cookies.user;

    if (postID) {
        let query = 'select * from posts where post_id=?';
        con.query(query, [postID], (err, result) => {
            if (err) {
                return res.status(500).send('unable to process request');
            }
            if (result.length !== 1) {
                return res.status(404).send({
                    status: 'error',
                    errorCode: 'NOTFOUND_ERR',
                    msg: 'post not found'
                });
            }

            query = 'update posts set views = views+1 where post_id=?';
            con.query(query, [postID], err => {
                if (err) console.log(err);
            });

            const post = result[0];
            delete post.images;

            res.send(post);
        });
    }
}