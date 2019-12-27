import template from '../templates/admin.hbs';
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../components/page';
import pages from './pages/admin-pages';
import ajax from '../libs/ajax';

export default Admin;

function Admin(args, currentPage) {
    if (args && Array.isArray(args)) {
        return Admin(args.pop(), currentPage);
    } else if (typeof args === 'string' && args in pages) {
        if (currentPage) currentPage.hide();
        return pages[args]();
    }

    const page = Page(app.name + ' - admin');
    page.show();

    const nav = tag.parse(mustache.render(template, {
        mainAdmin: cookies()['user'] === 'admin'
    }));
    const links = [...nav.children];

    links.map(link => {
        link.onclick = function(e) {
            e.preventDefault();
            if (this.id !== 'logout') setLocation(this.href);
            else {
                ajax({
                        url: '/logout',
                        method: 'post'
                    })
                    .then(() => {
                        location.reload();
                    });
            }
        };
    });

    page.append(nav);


    setTimeout(() => {
        loader.classList.add('hide');
    }, 1000);
    return page;
}