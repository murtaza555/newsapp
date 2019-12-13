//#region importing modules
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const compileScss = require('./server/utils/compileSCSS');
const validate = require('./server/utils/validate');
const getPost = require('./server/utils/getPost.js');

//#endregion

//#region declration
dotenv.config();
const ip = require('ip').address();
const res = path.join(__dirname, 'res');
const js = path.join(__dirname, 'public', 'js');
const app = express();
const PORT = process.env.PORT || 8006;
const con = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    charset: 'utf8mb4'
});

global.indexfiles = ['', 'index.html', '/', '/index.html'];
//#endregion

// database connection
con.connect(err => {
    if (err) console.log(err);
    else {
        global.con = con;
        console.log('Connected to database');
    }
});

//app configration
app.set('view engine', 'hbs');

//using statics
app.use(express.json({
    limit: '8mb'
}));
app.use(cookieParser());
app.use('/res', express.static(res, {
    maxAge: 3600000 * 24 * 30
}));
app.use('/js', express.static(js));

//serving compiled css from scss
app.get('/styles/*', (req, res) => {
    const name = req.params[0].replace('css', 'scss');
    const url = path.join(__dirname, 'public', 'styles', name);
    compileScss(url, res);
});

app.get('/img/*/*', (req, res) => {
    const name = req.params[0] + req.params[1];
    res.sendFile(path.join(__dirname, 'storage', 'images', name));
});

app.route('/post(/*)?')
    .post((req, res) => {
        validate(req, success, error);

        function success(result) {
            if (result.user_id !== 'admin') {
                return res.send({
                    status: 'error',
                    msg: 'user not logged in'
                });
            }
            require('./server/utils/savepost')(req, res);
        }

        function error(err) {
            console.log(err);
            res.status(err.code).send({
                status: 'error',
                msg: err.msg
            });
        }
    })
    .get(getPost)
    .delete((req, res) => {
        validate(req, success, error);

        function success(result) {
            if (result.user_id !== 'admin') {
                res.send({
                    status: 'error',
                    errorCode: 'LOGIN_ERR',
                    msg: 'user not logged in'
                });
            } else {
                require('./server/utils/deletePost')(req, res);
            }
        }

        function error(err) {
            res.status(err.code).send(err.msg);
        }
    })
    .put((req, res) => {
        validate(req, success, error);

        function error(err) {
            res.status(500).send('unable to process request');
            console.log(err);
        }

        function success(user) {
            if (user.user_id !== 'admin') return res.send({
                status: 'error',
                msg: 'Not a vliad user'
            });

            const moveTo = req.body.moveTo;
            const post_id = req.params[0].substr(1);

            const query = 'update posts set category=? where post_id=?';

            if (!moveTo || !post_id) return res.status(400).send('missing required parameters');

            con.query(query, [moveTo, post_id], (err, result) => {
                if (err) return res.status(500).send('unable to process request');
                if (result.affectedRows === 1) return res.send({
                    status: 'ok',
                    msg: 'post moved to ' + moveTo
                });
                else return res.send({
                    status: 'error',
                    msg: 'post not found'
                });
            });
        }
    });

app.get('/recents((/filter|/date)/*)?', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const limit = 10;
    const page = (req.query.page || 1) - 1;
    const current = page * limit;

    let query = `select * from posts order by created_at desc limit ${current}, ${limit}`;
    let values = [];

    if (req.params[1] === '/filter') {
        query = `select * from posts where category=? order by created_at desc limit ${current}, ${limit}`;
        values = [req.params[2]];
    } else if (req.params[1] === '/date') {
        query = `select * from posts where created_at like ? order by created_at desc limit ${current}, ${limit}`;
        values = [req.params[2] + '%'];
    }

    con.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                status: 'error',
                msg: 'unable process your request, please try again later',
                errorCode: 'UNCAUGHT_ERR'
            });
        }
        const posts = [];
        if (Array.isArray(result)) {
            if (result.length === 0) return res.send([]);
            result.map(post => {
                const images = JSON.parse(post.images);
                const keys = Object.keys(images);
                let thumbnail = '/img/default.jpeg/';
                if (keys.length > 0) {
                    if (keys[0] === 'youtube') {
                        thumbnail = images[keys];
                    } else {
                        thumbnail = `/img/${post.post_id}/${keys[0]}`;
                    }
                }
                const feed = {
                    post_id: post.post_id,
                    title: post.title,
                    category: post.category,
                    thumbnail,
                    likes: post.likes,
                    views: post.views,
                    date: post.created_at
                };
                posts.push(feed);
            });
            res.send(posts);
        } else {
            res.status(500).send({
                status: 'error',
                msg: 'unable process your request, please try again later',
                errorCode: 'UNCAUGHT_ERR'
            });
        }
    });
});

app.route('/category/?*')
    .get((req, res) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        let query = 'select category from categories order by category asc';
        con.query(query, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Cannot process your request, please try again later');
            }

            const categories = [];
            result.map(category => categories.push(category.category));

            res.send(categories);
        });
    })
    .post((req, res) => {
        validate(req, success, error);

        function success(result) {
            if (result.user_id !== 'admin') {
                return error('user not logged in');
            }
            const category = req.body.category;

            if (!category) return res.status(400).send('category name is required');

            let query = `insert into categories (category) values('${category}')`;
            con.query(query, (err, results) => {
                if (err) {
                    res.status(500).send({
                        status: 'error',
                        msg: err
                    });
                    return console.log(err);
                } else {
                    res.send({
                        status: 'ok',
                        msg: 'Category added'
                    });
                }
            });
        }

        function error(err) {
            res.send({
                status: 'error',
                msg: err
            });
        }
    })
    .delete((req, res) => {
        const category = req.params[0];

        if (category) {
            const query = 'delete from categories where category=?';
            con.query(query, [category], (err, result) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        msg: 'Unable to process your request, please try again later',
                        errorCode: 'UNCAUGHT_ERR'
                    });
                }
                res.send({
                    status: 'ok',
                    msg: 'post delted'
                });
            });
        } else {
            res.status(400).send({
                status: 'error',
                msg: 'category name required',
                errorCode: 'INSUFFICIENT_DATA_ERR'
            });
        }
    });

app.post('/login', (req, res) => {
    validate(req, onsuccess, onerror);

    function onsuccess(result) {
        res.send({
            status: 'ok',
            msg: 'user already logged in'
        });
    }

    function onerror(err) {
        require('./server/utils/login')(req, res);
    }
});

app.post('/logout', (req, res) => {
    const user = req.cookies.user;
    const token = req.cookies.token;

    if (user && token) {
        const query = 'delete from logins where user_id=? and token=?';
        con.query(query, [user, token], (err) => {
            if (err) console.log(err);
            res.clearCookie('user');
            res.clearCookie('token');
            res.send({
                status: 'ok'
            })
        });
    } else {
        res.send({
            status: 'ok'
        })
    }
});

app.post('/like', (req, res) => {
    const post_id = req.body.post_id;

    if (!post_id) {
        return res.send({
            status: 'error',
            errorCode: 'INSUFFICIENT_DATA_ERR'
        });
    }

    const query = 'update posts set likes = likes+1 where post_id=?';
    con.query(query, [post_id], (err, result) => {
        if (err) return res.send(500).send('unable to process request');
        res.send({
            status: 'ok'
        });
    });
});

app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/*', (req, res) => {
    if (/^\/?admin*/.test(req.params[0])) {
        return validate(req, successAdmin, errorAdmin);
    } else if (/^\/?login*/.test(req.params[0])) {
        return validate(req, successLogin, errorLogin);
    }

    render();

    function errorAdmin() {
        res.location('/login?admin').sendStatus(302);
    }

    function successAdmin(result) {
        if (result.user_id !== 'admin') return errorAdmin();
        render();
    }

    function successLogin() {
        res.location('back').sendStatus(302);
    }

    function errorLogin() {
        render();
    }

    function render() {
        let query = 'select * from categories';

        con.query(query, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    status: 'error',
                    msg: 'unbale get categories',
                    errorCode: 'UNCAUGHT_ERR'
                });
            }

            const links = [];

            if (Array.isArray(result)) {
                result.map(({
                    category
                }) => {
                    links.push({
                        text: category,
                        link: '/filter/' + category
                    });
                });
            }

            query = 'select * from posts order by created_at desc limit 20';

            con.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('unable to process request, please try again later');
                }

                const recents = [];
                if (Array.isArray(result)) {
                    result.map(feed => {
                        recents.push({
                            title: feed.title,
                            link: `/${feed.post_id}`
                        });
                    });
                }

                let og = {
                    title: 'Redeye News',
                    type: 'website',
                    description: 'Read recent news, watch videos on Redeye News and get updated.',
                    image: req.baseUrl + '/res/logo/logo.png',
                    site_name: 'Redeye News'
                };

                if (req.params[0] && /\d{13}.*/.test(req.params[0])) {
                    query = 'select * from posts where post_id=?';
                    con.query(query, [req.params[0]], (err, result) => {
                        if (err) console.log(err);
                        if (result.length === 1) {
                            const post = result[0];
                            const images = JSON.parse(post.images);
                            const keys = Object.keys(images);
                            let thumbnail = req.baseUrl + '/img/default.jpeg/';
                            if (keys.length > 0) {
                                if (keys[0] === 'youtube') {
                                    thumbnail = images[keys];
                                } else {
                                    thumbnail = req.baseUrl + `/img/${post.post_id}/${keys[0]}`;
                                }
                            }
                            og = {
                                title: post.title,
                                description: 'Read this article/news on redeyenews.com, visit now to read article',
                                image: thumbnail,
                                site_name: 'Redeye News'
                            };
                        }

                        send();
                    });
                } else {
                    send();
                }


                function send() {
                    res.render('index', {
                        title: 'REDEYE NEWS',
                        links,
                        recents,
                        og
                    });
                }
            });
        });
    }
});

app.listen(PORT, (err) => {
    if (err) return console.log(err);
    console.log('server started at http://' + ip + ':' + PORT);
});