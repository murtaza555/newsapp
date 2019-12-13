import tag from 'html-tag-js';
import Title from './title';

/**
 * @typedef {object} page
 * @property {function():void} show
 * @property {function():void} hide
 * @property {function(string):void} setTitle
 * @property {HTMLDivElement} container
 * @property {function():void} beforeHide
 */

/**
 * 
 * @param {string} titleText 
 * @returns {HTMLDivElement & page}
 */
function Page(titleText) {
    document.title = titleText;
    const title = Title(titleText, {
        lead: tag('i', {
            className: 'lead icon arrow_back_ios',
            onclick: function () {
                if (history.length === 1) return setLocation('/');
                history.back();
            }
        })
    });
    const container = tag('div', {
        className: 'container'
    });
    const page = tag('div', {
        className: 'page',
        children: [
            title,
            container
        ]
    });

    function show() {
        main.style.display = 'none';
        document.body.appendChild(page);
    }


    function hide() {
        if (page.beforeHide) {
            page.beforeHide();
        }
        main.style.display = null;
        page.classList.add('hide');
        setTimeout(() => {
            page.remove();
        }, 300);
    }

    page.beforeHide = null;
    page.show = show;
    page.hide = hide;
    page.setTitle = title.setTitle;
    page.container = container;
    page.append = container.append;

    return page;
}

export default Page;