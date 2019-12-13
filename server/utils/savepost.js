module.exports = savepost;

function savepost(req, res) {

    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');

    const {
        images,
        body,
        title,
        category
    } = req.body;
    if (!body || !title || !category || !images) {
        return res.send({
            status: 'error',
            msg: 'missing required data',
            errorCode: 'INSUFFICIENT_DATA_ERR'
        });
    }
    const reg = /^data\:image\/(.+);base64,/;
    const len = Object.keys(images).length;
    const postID = new Date().getTime() + crypto.randomBytes(2).toString('hex');

    let inc = 0;
    let success = true;
    let movedImages = {};

    if (Object.keys(images).length === 0) return save();
    for (let key in images) {
        if (key === 'youtube') {
            movedImages.youtube = images.youtube;
            callback();
            continue;
        }
        if (!success) break;
        const image = images[key].replace(reg, '');
        const name = path.join(__dirname, '..', '..', 'storage', 'images', postID + key);
        movedImages[key] = name;
        fs.writeFile(name, image, 'base64', callback);
    }

    function callback(err) {
        if (err) {
            success = false;
        } else {
            ++inc;
        }

        if (success && inc === len) {
            save();
        } else if (!success && inc === len) {
            const moved = Object.keys(movedImages);

            moved.map(key => {
                if (key === 'youtube') return;
                const url = movedImages[key].url;
                fs.unlink(url, err => {
                    console.log(err);
                });
            });

            res.send({
                status: 'error',
                msg: 'Unable to save post because some files/images failed to upload',
                errorCode: 'FILE_ERR'
            });
        }
    }

    function save() {
        movedImages = JSON.stringify(movedImages);

        const query = 'insert into posts (post_id, title, body, category, images) values(?, ?, ?, ?, ?)';
        con.query(query, [postID, title, body, category, movedImages], (err, result) => {
            if (err) {
                let msg = 'Unable to proccess your request, please try again later';
                let errorCode = 'DB_ERR';
                let code = 500;
                if (err.errno === 1062) {
                    msg = `A post already exists with same title.`;
                    errorCode = 'DUPLICATE_ERR';
                    code = 200;
                } else {
                    console.log(err);
                }

                return res.status(code).send({
                    status: 'error',
                    msg,
                    errorCode
                });
            }

            res.send({
                status: 'ok',
                msg: 'post saved'
            });
        });
    }
}