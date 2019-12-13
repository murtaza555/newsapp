import tag from 'html-tag-js';

/**
 * 
 * @param {string} titleText 
 * @param {object} options 
 * @param {HTMLElement} options.lead 
 * @param {HTMLElement} options.tail 
 */
function Title(titleText, options) {
    const titleTextEl = tag('span', {
        className: 'title-text',
        textContent: titleText
    });
    let lead = options.lead || tag('i', {
        className: 'lead icon arrow_back_ios'
    });
    let tail = options.tail || tag('i', {
        className: 'tail icon'
    });
    const title = tag('div', {
        className: 'bar flex title',
        children: [
            lead,
            titleTextEl,
            tail
        ]
    });

    function setTitle(text) {
        titleTextEl.textContent = text;
    }

    function setLead(newlead) {
        title.replaceChild(newlead, lead);
        lead = newlead;
    }

    function setTail(newTail) {
        title.replaceChild(newTail, tail);
        tail = tail;
    }

    title.setTitle = setTitle;
    title.setLead = setLead;
    title.setTail = setTail;

    return title;
}

export default Title;