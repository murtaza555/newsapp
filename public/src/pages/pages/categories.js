import template from '../../templates/categories.hbs';
import mustache from 'mustache';
import tag from 'html-tag-js';
import Page from "../../components/page";
import ajax from '../../libs/ajax';
import Toast from '../../components/toast';
import dialogs from '../../components/dialogs';

export default Categories;

function Categories() {
    const page = Page(app.name + ' - manage categories');
    const errMsg = 'Something is not right, please try again later';
    page.show();
    loader.className = 'sec p';

    ajax({
            url: '/category',
            onloadend: () => {
                loader.className = 'hide';
            }
        }).then(res => {
            if (Array.isArray(res)) {
                const html = mustache.render(template, res);
                const $html = tag.parse(html);
                $html.onclick = deleteCategory;
                page.append($html);
            } else if (res.status === 'error') {
                Toast(res.msg || errMsg, {
                    type: 'error'
                });
            }
        })
        .catch(err => {
            console.log(err);
            Toast(typeof err === 'string' ? err : errMsg, {
                type: 'error'
            });
        });
}

/**
 * 
 * @param {MouseEvent} e 
 */
function deleteCategory(e) {
    const action = e.target.getAttribute('action');
    if (action === 'delete') {
        const category = e.target.getAttribute('data-category');
        dialogs.confirm('ALERT', `Your all posts from ${category} will be delete! Delete any way?`)
            .then(() => {
                ajax({
                        url: '/category/' + category,
                        method: 'delete'
                    })
                    .then(res => {
                        if (res.status === 'ok') {
                            e.target.parentElement.remove();
                            Toast('Category deleted', {
                                type: 'success'
                            });
                        } else {
                            Toast(res.msg, {
                                type: 'error'
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        Toast(typeof err === 'string' ? err : 'Something not right, please try again later');
                    });
            });
    }
}