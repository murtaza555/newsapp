import tag from 'html-tag-js';
import mustache from 'mustache';
import template from '../templates/readPost.hbs';

import Page from '../components/page';
import ajax from '../libs/ajax';
import toast from '../components/toast';
import share from '../libs/share';

export default readPost;

/**
 * 
 * @param {string} id 
 */
function readPost(id) {
    if (!id) {
        return;
    }

    const page = Page(app.name);
    page.show();

    loader.className = 'sec p';
    ajax({
            url: `/post/${id}`
        })
        .then(res => {
            if (res.err) {
                return toast(res.err);
            }

            const html = mustache.render(template, {
                title: res.title,
                views: res.views,
                likes: res.likes,
            });
            const $html = tag.parse(html);
            $html.map($el => {
                if ($el.id === 'readpost') {
                    $el.innerHTML = res.body;

                    const $images = [...$el.querySelectorAll('img')];

                    $images.map($image => {
                        const img = $image.getAttribute('data-src');
                        $image.src = `/img/${res.post_id}/${img}`;
                    });
                }

                page.append($el);
            });

            const action = page.get('.post-actions');

            action.addEventListener('click', function (e) {
                handelClick.bind(this)(e, res);
            });

            loader.className = 'hide';
        })
        .catch(err => {
            console.log(err);
            err = typeof err === 'string' ? err : 'Unable to get the post';
            toast(err);
        });

    return page;
}

/**
 * 
 * @param {MouseEvent} e 
 */
function handelClick(e, post) {
    const action = e.target.getAttribute('action');

    if (action) {

        if (action === 'like') {
            ajax({
                    url: '/like',
                    method: 'post',
                    contentType: 'application/json',
                    data: {
                        post_id: post.post_id
                    }
                })
                .then(res => {
                    if (res.status !== 'error') {
                        e.target.classList.add('thumb_up');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
            return;
        }

        const url = `${location.origin}/${post.post_id}`;
        const title = post.title;

        share(action, url, title);
    }
}