import tag from 'html-tag-js';
import Page from "../components/page";
import template from '../templates/account.hbs';
import mainadmin from '../templates/mainadmin.hbs';

import ajax from '../libs/ajax';
import Toast from '../components/toast';
import parseQuery from '../libs/parseQuery';

export default Account;

/**
 * 
 * @param {'login' | 'newaccount'} type 
 */
function Account(type) {
    const name = (type === 'login' ? 'Login' : 'Create account');
    const page = Page(app.name + '- ' + name);
    page.show();

    const $form = tag.parse(template);
    const $autofill = $form.get('#autoFillDetector');
    const $email = $form.get('#email');
    const $password = $form.get('#password');
    const $error = $form.get('#error');
    const $button = $form.get('button[type=submit]');

    $form.get('#account-title').textContent = name;

    page.append($form);

    $email.onfocus = $password.onfocus = onfocus;

    $form.onsubmit = function(e) {
        e.preventDefault();
        $button.classList.add('loading');
        $error.textContent = '';
        let valid = true;

        if ($email.value === '') {
            $email.parentElement.classList.remove('warning');
            setTimeout(() => {
                $email.parentElement.classList.add('warning');
            }, 0);
            valid = false;
            $error.textContent = "Username is required";
        }

        if ($password.value === '') {
            $password.parentElement.classList.remove('warning');
            setTimeout(() => {
                $password.parentElement.classList.add('warning');
            }, 0);
            if (valid) $error.textContent = "Password is required";
            valid = false;
        }

        if (!valid) return;

        const body = {
            email: $email.value,
            password: $password.value
        };

        ajax({
                url: '/' + type,
                method: 'post',
                contentType: 'application/json',
                data: body,
                onloadend: () => {
                    $button.classList.remove('loading');
                }
            })
            .then(res => {

                if (res.status !== 'ok') {
                    $error.textContent = res.msg;
                }
                // if (res.status === 'ok_admin') {
                //     console.log("here at account.hbs");
                //     localStorage.setItem('mainadmin_storage', res.email1);
                //     location.replace('/mainadmin');

                // }
                else {
                    let redirect = parseQuery().redirect;

                    if (type === 'login') {
                        Toast('login success', {
                            type: 'success'
                        });

                        if (res.loginType === 'mainadmin') {
                            location.replace('/admin');
                        } else {
                            location.replace(redirect || '/');
                        }
                    } else {
                        Toast('New account created!');
                        location.replace('/login' + (redirect ? '?' + redirect : ''));
                    }

                }
            })
            .catch(err => {
                console.log(err);
                if (typeof err === 'string') $error.textContent = err;
                else $error.textContent = 'Something went worng, please try again later';
            });
    };

    setTimeout(() => {
        const actualBG = window.getComputedStyle($autofill).backgroundColor;
        const $usernameStyle = window.getComputedStyle($email, ':-webkit-autofill');
        const $passwordStyle = window.getComputedStyle($email, ':-webkit-autofill');

        if ($usernameStyle.backgroundColor !== actualBG) $email.parentElement.classList.add('focus');
        if ($passwordStyle.backgroundColor !== actualBG) $password.parentElement.classList.add('focus');
    }, 100);

    setTimeout(() => {
        loader.classList.add('hide');
    }, 1000);

    return page;

    function onfocus() {
        this.parentElement.className = 'focus';
        this.onblur = onblur;
        $error.textContent = '';
    }

    function onblur() {
        if (this.value === '') {
            this.parentElement.className = null;
        } else {
            this.onfocus = null;
            this.onfocus = onfocus;
        }
    }
}