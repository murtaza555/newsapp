import tag from 'html-tag-js';
import pages from './pages';
import ajax from './libs/ajax';

import './defines';
import datePicker from 'html-datepicker-js';


main();

function main() {
    ajax({
            url: '/updatevisit',
            method: 'post',
            contentType: 'application/json',
        })
        .then(res => {
            if (res.status === 'ok') {

                console.log("update done")

            }

            if (res.status === 'no') {
                console.log("update not done")



            }
        })
        .catch(err => {
            console.log(err);
        });

    window.addEventListener('popstate', e => {
        e.preventDefault();
        const event = new CustomEvent('locationchange');
        window.dispatchEvent(event);
    });
    window.cookies = cookieParser;
    window.setLocation = setLocation;

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            })
            .then(function(res) {
                console.log('Registration successful, scope is:', res.scope);
            })
            .catch(function(err) {
                console.log('Service worker registration failed, error:', err);
            });
    }

    window.addEventListener('load', run);
}


function run() {
    window.main = tag.get('main');
    let currentPage = null;

    const $sidenavToggler = tag.get('#sidenavToggler');
    const $sidenav = tag.get('header nav');
    const $mask = tag('span', {
        className: 'mask',
        onclick: togglesidenav,
        style: {
            zIndex: '0'
        }
    });
    const picker = datePicker('#datepicker');

    picker.onpick = function(date) {
        setLocation(`/date/${date.year}-${date.monthNumber}-${date.date}`);
        hideSidenav();
        picker.hide();
    };

    $sidenavToggler.onclick = togglesidenav;
    $sidenav.onclick = function(e) {
        hideSidenav();
        handelClick.call(this, e);
    };

    window.addEventListener('locationchange', route);
    route();

    function route() {
        const path = location.pathname.substr(1).split('/');
        const oldPage = currentPage;

        if (['login', 'newaccount'].indexOf(path[0]) > -1) {
            currentPage = pages.account(path[0]);
        } else if (path[0] in pages) {
            const arg = path.slice(1);
            const routes = arg.length ? arg : undefined;
            currentPage = pages[path[0]](routes, currentPage);
        } else {
            currentPage = pages.home(path[0] ? path : null);
        }

        if (oldPage) {
            oldPage.hide();
        }
    }

    function togglesidenav() {
        if (!$sidenav.visible) {
            $sidenav.parentElement.insertBefore($mask, $sidenav);
            $sidenav.classList.add('show');
            $sidenav.visible = true;
        } else {
            hideSidenav();
        }
    }

    function hideSidenav() {
        if ($sidenav.visible) {
            $mask.remove();
            $sidenav.classList.remove('show');
            $sidenav.visible = false;
        }
    }
}

function cookieParser() {
    if (!document.cookie) return {};

    let cookie = document.cookie.split(';');
    const cookies = {};
    let len = 0;

    cookie.map(data => {
        data = data.split('=');
        cookies[data[0].trim()] = data[1].trim();
        ++len;
    });

    return cookies;
}

function setLocation(href) {
    history.pushState(null, null, href);
    const event = new CustomEvent('locationchange');
    window.dispatchEvent(event);
}

/**
 * 
 * @param {MouseEvent} e 
 */
function handelClick(e) {
    const action = e.target.getAttribute('action');

    if (action === 'filter post') {
        e.preventDefault();
        setLocation(e.target.href);
    }
}