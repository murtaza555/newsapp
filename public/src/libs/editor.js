import dialogs from "../components/dialogs";
import Compressor from 'compressorjs';

export default editor;

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {Object} optons 
 */
function editor(element) {
    element.querySelector('.tools').addEventListener('click', handelAction);
    const textInput = element.get('#description');
    const fontColor = element.get('#fontColor');
    const bgColor = element.get('#bgColor');
    const image = element.get('#image');

    image.addEventListener('change', function () {
        textInput.focus();
        insertImage.call(this);
    });

    fontColor.addEventListener('change', updateFontColor);
    fontColor.parentElement.addEventListener('click', updateFontColor.bind(fontColor));
    bgColor.addEventListener('change', updateBgColor);
    bgColor.parentElement.addEventListener('click', updateBgColor.bind(bgColor));

    textInput.addEventListener('paste', function (e) {
        e.preventDefault();

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        if (html && text) {
            dialogs.select('Paste as', ['text', 'html']).then(res => {
                if (res === 'html')
                    exec('insertHTML', html);
                else
                    exec('insertText', text);
            });
        } else {
            exec('insertText', text);
        }
    });

    textInput.addEventListener('drop', function (e) {
        const data = e.dataTransfer;
        if (data.files) {
            if (data.files.length > 1) {
                dialogs.alert('ALERT', 'Only one file allowed at a time');
                return;
            }
            e.preventDefault();
            insertImage.call({
                files: data.files
            });
        }
    });

    textInput.addEventListener('input', oninput);

    function updateBgColor() {
        textInput.focus();
        this.parentElement.style.color = this.value;
        exec('hiliteColor', this.value);
    }

    function updateFontColor() {
        textInput.focus();
        this.parentElement.style.color = this.value;
        exec('foreColor', this.value);
    }


    /**
     * 
     * @param {MouseEvent} e 
     */
    function handelAction(e) {
        const action = e.target.getAttribute('action');

        if (!action) return;

        const excludeCommand = ['embed', 'hiliteColor', 'createLink', 'fontSize', 'formatBlock', 'foreColor', 'quote', 'insertImage', 'removeFormat'];
        if (!excludeCommand.includes(action))
            return exec(action);

        const selection = getSelection();

        switch (action) {
            case 'foreColor':
                exec(action, fontColor.value);
                break;

            case 'hiliteColor':
                exec(action, bgColor.value);
                break;

            case 'fontSize':
                const val = e.target.getAttribute('data-val');
                dialogs.select('Select font size', [1, 2, 3, 4, 5, 6, 7], {
                        default: val
                    })
                    .then(res => {
                        exec(action, parseInt(res));
                    });
                break;

            case 'formatBlock':
                const currentElement = getSelection().element;
                let block = 'aside';
                if (currentElement.tagName === 'ASIDE') {
                    block = 'div';
                }
                exec(action, block);
                break;

            case 'createLink':
                const range = document.createRange();
                const sel = selection.sel;
                range.setStart(selection.startNode, selection.start);
                range.setEnd(selection.endNode, selection.end);

                dialogs.prompt('Enter link: ', null, 'text', {
                    match: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
                    required: true,
                    reject: true
                }).then(link => {
                    sel.removeAllRanges();
                    sel.addRange(range);
                    textInput.focus();
                    exec(action, link);
                }).catch(res => {
                    if (res) console.log(res);

                    sel.removeAllRanges();
                    sel.addRange(range);
                    textInput.focus();
                });
                break;

            case 'embed':
                embed(textInput, selection);
                break;

            case 'removeFormat':
                textInput.focus();
                if (exec(action)) {
                    fontColor.parentElement.style.color = null;
                    bgColor.parentElement.style.color = null;
                    fontSize.value = 3;
                }
                break;

            default:
                break;
        }
    }
}

function exec(action, value) {
    const res = value ? document.execCommand(action, false, value) : document.execCommand(action, false);

    if (!res) {
        console.log(`Command status %c${action}${value?':'+value:''}`, 'font-weight:bold', res);
    }

    return res;
}

/**
 * 
 * @returns {selected}
 */
function getSelection() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const text = selection.toString();
    const startNode = selection.anchorNode;
    const node = selection.focusNode;
    const endNode = node;

    const start = range.startOffset;
    const end = range.endOffset;

    const element = range.endContainer.parentElement;

    return {
        start,
        end,
        text,
        element,
        node,
        sel: selection,
        startNode,
        endNode
    };
}
/**
 * @param {InputEvent} e 
 * @this HTMLDivElement
 */
function oninput(e) {
    if (e.inputType !== 'insertText' || e.data === null) {
        const children = [...this.children];
        let flag = 0;
        children.map(child => {
            if (child.tagName === 'ASIDE') {
                child.removeAttribute('class');
                const nextSibling = child.nextElementSibling;
                const isLast = !!!nextSibling;
                if (++flag === 1) {
                    child.classList.add('first');
                    flag = 1;
                }
                if (isLast || nextSibling.tagName !== 'ASIDE') {
                    child.classList.add('last');
                    flag = 0;
                }
            }
        });
    }
}

/**
 * 
 * @this HTMLInputElement
 */
function insertImage() {
    const img = this.files[0];

    if (!img) return;

    new Compressor(img, {
        quality: 0.1,
        success: function (result) {
            const filereader = new FileReader();

            filereader.onloadend = function (e) {
                const image = e.target.result;
                const type = image.split(';')[0].split(':')[1].split('/')[0];

                if (type === 'image') {
                    const imgtag = `<img src='${image}' style='max-width: 100%' alt='${img.name}'>`;
                    exec('insertHTML', imgtag);
                }
            };

            filereader.readAsDataURL(result);
        }
    });
}

function embed(input, selection) {
    dialogs.prompt('Enter code: ', null, 'text', {
            required: true
        })
        .then(res => {
            input.focus();
            const range = document.createRange();
            const sel = selection.sel;
            range.setStart(selection.node, selection.start);
            sel.removeAllRanges();
            sel.addRange(range);
            if (!res) return;

            exec('insertHTML', res);
        });
}