const NEW_BUFFER_STR = 'New Buffer';

const SHORTCUTS = [
    ['^X', 'Exit', 'x'], ['^O', 'Write Out', 'o']
]

/**
 * Creates nano document editor
 *
 * @param args User input array split on space
 */
function nano(args) {
    const filename = args[0];
    const dom = createNanoDom(filename);
    bindNanoEvents(dom);
    document.body.appendChild(dom.overlay);
    dom.editor.focus();
}

/**
 * Handles event listers
 *
 * @param dom nano dom elements reference
 */
function bindNanoEvents(dom) {
    // Resize nano overlay when virtual keyboard opens/closes on mobile
    const syncHeight = () => {
        dom.overlay.style.height = window.visualViewport.height + 'px';
        dom.overlay.style.top = window.visualViewport.offsetTop + 'px';
    };
    window.visualViewport.addEventListener('resize', syncHeight);
    window.visualViewport.addEventListener('scroll', syncHeight);

    // Handles all key presses
    dom.overlay.addEventListener('keydown', (event) => {
        // Open save document prompt
        if (event.ctrlKey && event.key === 'o') {
            if (dom.promptContainer.style.display === 'none') {
                event.preventDefault();
                dom.promptContainer.style.display = 'flex';
                dom.promptInput.focus();
            }
            // Exit Nano
        } else if (event.ctrlKey && event.key === 'x') {
            event.preventDefault();
            window.visualViewport.removeEventListener('resize', syncHeight);
            window.visualViewport.removeEventListener('scroll', syncHeight);
            dom.overlay.remove();
            appendPrompt();

            // Handle saving file
        } else if (event.key === `Enter` && dom.promptContainer.style.display === `flex`) {
            event.preventDefault();
            filesystem[dom.promptInput.value] = dom.editor.value;
            localStorage.setItem('filesystem', JSON.stringify(filesystem));
            dom.promptContainer.style.display = 'none';
            dom.editor.focus()

            // Cancel file save
        } else if (event.key === 'Escape' && dom.promptContainer.style.display === 'flex') {
            event.preventDefault();
            dom.promptContainer.style.display = 'none';
            dom.editor.focus();
        }

    });

    // Keeps text area in focus
    dom.overlay.addEventListener('mousedown', function (e) {
        if (e.target !== dom.editor && !e.target.closest('.nanoShortcut')) {
            e.preventDefault();
            dom.editor.focus();
        }
    })
}

/**
 * Creates dom elements for entire nano UI
 *
 * @param filename name of file being edited
 * @returns {{overlay: HTMLDivElement, editor: HTMLTextAreaElement, promptInput: HTMLInputElement,
 * promptContainer: HTMLDivElement}}
 */
function createNanoDom(filename) {
    // Create header contains nano version, and filename
    const header = document.createElement('header');
    header.id = "nanoHeader";

    const nanoVersion = document.createElement('span');
    nanoVersion.textContent = "GNU nano 8.5";

    const filenameElement = document.createElement('span');
    filenameElement.textContent = filename || NEW_BUFFER_STR;
    header.append(nanoVersion, filenameElement, document.createElement('span'));

    // Create top level container holding all elements
    const overlay = document.createElement('div');
    overlay.id = "nanoOverlay";

    // Create footer contains all the shortcuts
    const footer = document.createElement('footer')
    footer.id = "nanoFooter";
    SHORTCUTS.forEach(([key, label, keyChar]) => footer
        .appendChild(createShortcut(key, label, keyChar, overlay)));

    // Creates a prompt for when an empty buffer is saved, should be hidden initially and shown on save
    const nanoPromptContainer = document.createElement('div');
    nanoPromptContainer.id = "nanoPromptContainer";
    nanoPromptContainer.style.display = 'none';

    const nanoPrompt = document.createElement('span');
    nanoPrompt.id = "nanoPrompt";
    nanoPrompt.textContent = "Write to File: "

    const nanoPromptInput = document.createElement('input');
    nanoPromptInput.id = "nanoPromptInput";
    nanoPromptInput.value = filename || '';
    nanoPromptContainer.append(nanoPrompt, nanoPromptInput);

    // Create area where user types
    const editor = document.createElement('textarea');
    editor.id = "nanoInput"
    editor.value = filesystem[filename] || ''

    // Append all elements
    overlay.append(header, editor, nanoPromptContainer, footer);
    return {overlay: overlay, editor: editor, promptInput: nanoPromptInput, promptContainer: nanoPromptContainer};
}

/**
 * Creates shortcut elements to be displayed in nano editor
 *
 * @param key shortcut or hotkey
 * @param label label or short description of hotkey
 * @param keyChar character for key event tranlation
 * @returns {HTMLSpanElement}
 */
function createShortcut(key, label, keyChar, overlay) {
    const itemSpan = document.createElement('span');
    itemSpan.className = 'nanoShortcut';

    const keySpan = document.createElement('span')
    keySpan.className = 'nanoKey'
    keySpan.textContent = key

    const labelSpan = document.createElement('span');
    labelSpan.className = 'nanoLabel'
    labelSpan.textContent = label;

    itemSpan.append(keySpan, labelSpan);

    // Click events for mobile support
    itemSpan.addEventListener('click', () => {
        const event = new KeyboardEvent('keydown', { key: keyChar,
            ctrlKey: true, bubbles: true });
        overlay.dispatchEvent(event);
    });

    return itemSpan;
}
