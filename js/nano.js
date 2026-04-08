var saved = false;


function nano(filename) {
    const overlay = document.createElement('div');
    overlay.id = "nanoOverlay";
    document.body.appendChild(overlay);

    const header = document.createElement('header');
    headerid = "nanoHeader";
    header.textContent = filename;

    const editor = document.createElement('textarea');
    editor.id = "nanoInput"
    overlay.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'o') {


      } else if (event.ctrlKey && event.key === 'x') {
           event.preventDefault();
           overlay.remove();
           appendPrompt();
      }

    });
    overlay.appendChild(header);
    overlay.appendChild(editor);
    document.body.appendChild(overlay);
    editor.focus();


}
