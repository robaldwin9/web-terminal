var saved = false;


const shortcuts = [
    ['^X','Exit'], ['^O','Write Out']
]

function nano(args) {

    const filename = args[0];

    if (filename) {
        const overlay = document.createElement('div');
        overlay.id = "nanoOverlay";
        document.body.appendChild(overlay);

        const header = document.createElement('header');
        header.id = "nanoHeader";

        const nanoVersion = document.createElement('span');
        nanoVersion.textContent = "GNU nano 8.5";

        const filenameElement = document.createElement('span');
        filenameElement.textContent = filename;
        header.appendChild(nanoVersion);
        header.appendChild(filenameElement);
        header.appendChild(document.createElement('span'))

        const footer = document.createElement('footer')
        footer.id = "nanoFooter";

        shortcuts.forEach(([key, label]) => {
            const itemSpan = document.createElement('span');
            itemSpan.className = 'nanoShortcut';

            const keySpan = document.createElement('span')
            keySpan.className = 'nanoKey'
            keySpan.textContent = key

            const labelSpan = document.createElement('span');
            labelSpan.className = 'nanoLabel'
            labelSpan.textContent = label;

            itemSpan.appendChild(keySpan);
            itemSpan.appendChild(labelSpan);
            footer.appendChild(itemSpan);

        })

        const editor = document.createElement('textarea');
        editor.id = "nanoInput"
        editor.value = filesystem[filename] || ''
        overlay.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'o') {
                event.preventDefault();
                filesystem[filename] = editor.value;
                localStorage.setItem('filesystem', JSON.stringify(filesystem));
                overlay.remove();
                appendPrompt();

            } else if (event.ctrlKey && event.key === 'x') {
                event.preventDefault();
                overlay.remove();
                appendPrompt();
            }
        });
        overlay.appendChild(header);
        overlay.appendChild(editor);
        overlay.appendChild(footer);
        document.body.appendChild(overlay);
        editor.focus();
    } else {
        return response(segment('usage: nano <filename>', COLOR.error))
    }
}
