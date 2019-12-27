import tag from 'html-tag-js';
import Page from "../../components/page";
import mustache from 'mustache';
import autosize from 'autosize';

import template from '../../templates/postForm.hbs';
import editor from '../../libs/editor';
import dialogs from '../../components/dialogs';
import toast from '../../components/toast';
import ajax from '../../libs/ajax';
import Toast from '../../components/toast';

export default Post;

function Post() {
    let categories = ['loading...'];
    /**
     * @type {HTMLOptionElement}
     */
    let $category;
    /**
     * @type {HTMLDivElement}
     */
    let $form;

    const page = Page(`${app.name} - admin`);
    page.beforeHide = function() {
        if ($form) {
            const body = $form.get('#description').innerHTML;
            const title = $form.get('#title').value;
            const category = $form.get('#category').value;

            if (!body && !title) return;

            localStorage.setItem('draft', JSON.stringify({
                body,
                title,
                category
            }));
            Toast('saved as draft');
        }
    };

    render();

    ajax({
            url: '/category',
            response: true
        })
        .then(res => {
            if (Array.isArray(res)) {
                categories = res;
                if ($category) {
                    $category.textContent = '';
                    categories.map(category => {
                        addOption($category, category);
                    });
                    if (localStorage.draft) {
                        const draft = JSON.parse(localStorage.draft);
                        $form.get('#description').innerHTML = draft.body;
                        $form.get('#title').value = draft.title;
                        $form.get('#category').value = draft.category;
                    }
                }
            } else {
                dialogs.alert('ERROR', 'Something went wrong, please try again');
            }
            setTimeout(() => {
                loader.classList.add('hide');
            }, 1000);
        })
        .catch(err => {
            console.log(err);
            if (typeof err !== 'string') err = "Something is not right";
            if (!alert(err)) location.href = '/';
        });

    page.show();

    function render() {
        const data = {
            category: categories
        };
        const html = mustache.render(template, data);

        $form = tag.parse(html);
        page.append($form);

        editor($form);

        $category = $form.get('#category');
        const $addCategory = $form.get('#addcategory');

        autosize($form.get('#title'));

        $addCategory.onclick = function(e) {
            addCategory.bind(this)(e, $category);
        };

        $form.onsubmit = function(e) {
            submit.bind(this)(e, $form, $category);
        };
    }

    return page;
}

/**
 * 
 * @param {HTMLElement} $description 
 */
function parseBody($description) {
    $description = tag.parse($description.outerHTML);

    const $images = $description.querySelectorAll('img');
    const images = {};
    for (let i = 0; i < $images.length; ++i) {
        const imageName = `image_${i}`;
        images[imageName] = $images[i].src;

        $images[i].src = ``;
        $images[i].setAttribute('data-src', imageName);
    }

    if (Object.keys(images).length === 0) {
        const reg = /^https:\/\/(www\.)?youtube\.com\/(embed\/|watch\?v=)(.+)/;
        const $iframes = $description.querySelectorAll('iframe');
        for (let i = 0; i < $iframes.length; ++i) {
            const src = $iframes[i].src;
            const match = reg.exec(src);
            if (match) {
                images.youtube = `https://img.youtube.com/vi/${match[3]}/0.jpg`;
                break;
            }
        }
    }

    return {
        body: $description.innerHTML,
        images
    };
}

/**
 * 
 * @param {HTMLSelectElement} $el 
 * @param {string} option 
 */
function addOption($el, option, value = '') {
    $el.appendChild(tag('option', {
        value: value || option,
        textContent: option
    }));
}

/**
 * @this {HTMLButtonElement}
 * @param {MouseEvent} e 
 * @param {HTMLSelectElement} $category 
 */
function addCategory(e, $category) {
    dialogs.prompt('Enter category name: ').then(res => {
        if (res) {
            const body = {
                category: res
            };
            this.classList.add('loading');
            ajax({
                    url: '/category',
                    method: 'post',
                    contentType: 'application/json',
                    data: body,
                    onloadend: () => {
                        this.classList.remove('loading');
                    }
                })
                .then(res => {
                    const options = {
                        type: ''
                    };
                    if (res.status !== 'ok')
                        options.type = 'error';
                    else {
                        addOption($category, body.category);
                    }
                    toast(res.msg, options);
                })
                .catch(err => {
                    toast(typeof err === 'string' ? err : 'Something went wrong', {
                        type: 'error'
                    });
                    console.log(err);
                });
        }
    });
}

/**
 * @this HTMLButtonElement
 * @param {Event} e 
 */
function submit(e, $form, $category) {
    e.preventDefault();
    const button = e.target.querySelector('button[type=submit]');
    button.classList.add('loading');
    const data = {
        category: null,
        title: null,
        body: null,
        images: [],
        views1: null,
        likes1: null
    };
    const $body = $form.get('#description');
    const $title = $form.get('#title');
    let $viewsinput1 = $form.get('#viewsinput');
    let $likesinput1 = $form.get('#likesinput');



    data.category = $category.value;
    data.title = $title.value;
    data.likes1 = $likesinput1.value;
    data.views1 = $viewsinput1.value;


    const parsedBody = parseBody($body);

    data.images = parsedBody.images;
    data.body = parsedBody.body;

    const toast = Toast('Uploading your post', {
        progressbar: true
    });

    ajax({
            url: '/post',
            method: 'post',
            xhr: xhr => {
                xhr.onloadstart = e => {
                    toast.updateProgress(0, 'Uploading...');
                };
                xhr.upload.onprogress = e => {
                    let percent = Math.ceil((e.loaded / e.total) * 100);
                    percent = percent > 100 ? 100 : percent;
                    toast.updateProgress(percent, `${percent}% uploaded`);
                };
                xhr.onload = e => {
                    toast.updateProgress(100, 'file saved');
                    toast.hide();
                    localStorage.removeItem('draft');
                };

                xhr.onloadend = () => {
                    button.classList.remove('loading');
                };
            },
            contentType: 'application/json',
            data
        })
        .then(res => {
            if (res.status === 'ok') {
                $body.textContent = '';
                $title.value = '';
                $likesinput1.value = '';
                $viewsinput1.value = '';
                Toast(res.msg);

            } else if (res.status === 'error') {
                if (res.errorCode === 'LOGIN_ERR') {
                    location.href = '/login';
                }

                dialogs.alert('ERROR', res.msg);
            }
        })
        .catch(err => {
            console.log(err);
            Toast('unable to save post, image may be too large.');
        });
}