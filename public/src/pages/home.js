import template from '../templates/thumbnail.hbs';

import tag from 'html-tag-js';
import mustache from 'mustache';
import ajax from '../libs/ajax';
import dialogs from '../components/dialogs';
import toast from '../components/toast';
import readPost from './readPost';
import share from '../libs/share';
import Toast from '../components/toast';
import { __esModule } from 'caniuse-lite';




export default Home;



function Home(path) {

    let filter, value, url = '/recents',
        limit = 10;

    if (path && path.length === 1) {
        return readPost(path[0]);
    } else if (path && path.length === 2) {
        filter = path[0];
        value = path[1];
        main.textContent = '';
        tag.get('#title').textContent = decodeURI(value);
    } else {
        tag.get('#title').textContent = app.name;
    }

    const loadMore = tag.get('#load-feeds');

    if (navigator.onLine) {
        loader.className = 'sec';
        if (filter && value) {
            url += '/' + filter + '/' + value;
        }

        ajax({
                url
            })
            .then(data => {
                localStorage.setItem('feeds', JSON.stringify(data));

                if (Array.isArray(data)) {
                    buildFeed(data);
                    if (data.length >= limit) {
                        loadMore.style.display = null;
                        loadMore.onclick = function(e) {
                            loadPost.bind(this)(e, url, limit);
                        };
                    } else {
                        loadMore.style.display = 'none';
                    }
                }

                setTimeout(() => {
                    loader.className = 'hide';
                }, 100);
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        if (localStorage.feeds) {
            buildFeed(JSON.parse(localStorage.feeds));
        } else {
            dialogs.alert('ERROR', 'you are offline');
        }
    }
}


/**
 * 
 * @param {Feed[]} data 
 */
function buildFeed(data, loadmore) {
    const feeds = [];
    const isAdmin = cookies().user === 'admin';

    if (!loadmore) data = data.reverse();

    data.map(feed => {

        const prevEl = document.getElementById(feed.post_id);
        if (prevEl) {
            prevEl.querySelector('.data-likes').textContent = feed.likes;
            prevEl.querySelector('.data-views').textContent = feed.views;
            return;
        }

        const html = mustache.render(template, {
            thumbnail: feed.thumbnail,
            heading: feed.title,
            category: feed.category,
            likes: feed.likes,
            views: feed.views,
            date: new Date(feed.date).toDateString()
        });

        const id = feed.post_id;

        const $feed = tag.parse(html);
        $feed.href = `/${id}`;
        $feed.id = id;

        const actions = [];

        if (isAdmin) {
            const $delete = tag('i', {
                className: 'icon delete',
                attr: {
                    action: 'delete'
                }
            });
            const $moveTo = tag('i', {
                className: 'icon redo',
                attr: {
                    action: 'moveTo'
                }
            });

            actions.push($delete, $moveTo);
        }

        if (navigator.share) {
            const $share = tag('i', {
                className: 'icon share',
                attr: {
                    action: 'share'
                }
            });

            actions.push($share);
        }

        if (actions.length > 0) $feed.querySelector('.actions').append(...actions);
        $feed.addEventListener('click', function(e) {
            handelClick.bind(this)(e, feed);
        });

        if (loadmore) main.append($feed);
        else main.insertBefore($feed, main.firstChild);
    });

    return feeds;
}

/**
 * 
 * @param {MouseEvent} e 
 */
function handelClick(e, feed) {
    e.preventDefault();
    const action = e.target.getAttribute('action');
    const id = feed.post_id;
    const title = feed.title;
    switch (action) {
        case 'delete':
            dialogs.confirm('Delete this post?')
                .then(() => {
                    deletePost.bind(this)(`/post/${id}`);
                });
            break;
        case 'moveTo':
            moveTo.bind(this)(`/post/${id}`);
            break;

        case 'share':
        case 'facebook':
        case 'whatsapp':
        case 'twitter':
        case 'gmail':
            share(action, this.href, title);
            break;

        default:
            setLocation(this.href);

    }
}

function deletePost(url) {
    ajax({
            url,
            method: 'delete'
        })
        .then(res => {
            if (res.status === 'ok') {
                this.remove();
                toast(res.msg);
            } else {
                if (res.errorCode === 'LOGIN_ERR') {
                    dialogs.alert('ERROR', 'Please login to delete this post');
                } else {
                    toast(res.msg, {
                        type: 'error'
                    });
                }
            }
        })
        .catch(err => {
            console.log(err);
            err = typeof err === 'string' ? err : 'Post could not be delete, please try again later';
            toast(err, {
                type: 'error'
            });
        });
}

function moveTo(url) {
    const $categories = tag.getAll("[action='filter post'");
    const categories = [];
    $categories.map($category => {
        categories.push($category.textContent);
    });

    dialogs.select('Move to category: ', categories)
        .then(res => {
            ajax({
                    url,
                    contentType: 'application/json',
                    method: 'put',
                    data: {
                        moveTo: res
                    }
                })
                .then(res => {
                    if (res.status === 'ok') {
                        Toast(res.msg);
                    } else {
                        Toast(res.msg, {
                            type: 'error'
                        });
                    }
                })
                .catch(res => {
                    console.log(err);
                    Toast('Something went wrong', {
                        type: 'error'
                    });
                });
        });
}

/**
 * @this HTMLButtonElement
 * @param {MouseEvent} e 
 */
function loadPost(e, url, limit = 20) {
    const page = parseInt(this.getAttribute('data-page')) + 1;
    ajax({
            url: url + '?page=' + page
        })
        .then(res => {
            if (Array.isArray(res)) {
                this.setAttribute('data-page', page);
                if (res.length < limit) this.style.display = 'none';
                buildFeed(res, true);
            }
        })
        .catch(err => {
            console.log(err);
        });
}