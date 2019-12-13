export default share;

function share(to, url, title) {
    let href;
    switch (to) {
        case 'share':
            navigator.share({
                    title: title,
                    text: 'read more about this article on AmWeb News',
                    url
                })
                .then(() => console.log('shared'))
                .catch(err => console.log(err));
            break;
        case 'facebook':
            href = `https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&quote=${title}&u=${url}&ref=plugin&src=share_button`;
            popupWindow(href, 400, 600);
            break;

        case 'whatsapp':
            href = `whatsapp://send?text=${encodeURI(title + '\n' +url)}`;
            popupWindow(href, 400, 400);
            break;

        case 'twitter':
            href = `https://twitter.com/intent/tweet?text=${encodeURI(title + '\n' +url)}`;
            popupWindow(href, 400, 600);
            break;

        case 'gmail':
            href = `mailto:?subject=${encodeURI(title)}&body=${encodeURI(title + '\n' +url)}`;
            popupWindow(href, 400, 500);
            break;
    }
}

function popupWindow(url, w, h) {
    const title = 'AmWeb News';
    const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
    const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + y + ', left=' + x);
}