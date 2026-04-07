const output = document.getElementById('output');
const isAndroid = /android/i.test(navigator.userAgent);
const isMobile = window.innerWidth < 1041;
const BANNER = isAndroid ? BANNER_ANDROID : isMobile ? BANNER_MOBILE : BANNER_DESKTOP;
var commandHistory = [];
var historyIndex = -1;
var activeInput = null;
var tabMatches = [];
var tabIndex = -1;
var tabPartial = '';

// Focus on CLI unless user clicks on a link
document.addEventListener(`click`, (event) => {
    if (event.target.tagName !== 'A' && activeInput) {
        activeInput.focus();
    }  
});

// Clear CLI on page refresh
document.fonts.ready.then(() => {
    displayBaseContent();
});

// Detect user input and update the output area
document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') {
        tabMatches = [];
        tabIndex = -1;
        tabPartial = '';
    }
    
    // Command submitted logic
    if (event.key === 'Enter' && event.target.classList.contains('cli')) {
        const command = event.target.value.trim();
        if (command) {
            activeInput.disabled = true;
            historyIndex = -1;
            commandHistory.push(command);

            let response = parseCommand(command);
            if (response) {
                const {segments, prompt = true} = response;
                if (segments) {
                    appendSegments(segments);
                }

                if (prompt) {
                    appendPrompt();
                }
            }
        // No command new line is printed
        } else {
            appendPrompt();
        }

    // Arrow up press cycles back in command history
    } else if (event.key === 'ArrowUp') {
         event.preventDefault();
         if (historyIndex < commandHistory.length - 1) {
             historyIndex++;
             activeInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
         }

     // Arrow down press cycles forward in history
     } else if (event.key === 'ArrowDown') {
         event.preventDefault();
         if (historyIndex > -1) { 
             historyIndex--;
             activeInput.value = historyIndex === -1 ? '' : 
             commandHistory[commandHistory.length - 1 - historyIndex];
         }
     // Tab cycles between available commands
     } else if (event.key === 'Tab') {
        event.preventDefault();
        const partial = tabMatches.length ? tabPartial : activeInput.value;
        if (!partial) return;

        const currentMatches = Object.keys(commands).filter(name => name.startsWith(partial));
        if (currentMatches.length === 0) return;

        if (!tabMatches.length) {
            tabPartial = partial;
            tabMatches = currentMatches;
            tabIndex = -1;
        }

        tabIndex = (tabIndex + 1) % tabMatches.length;
        activeInput.value = tabMatches[tabIndex];
        activeInput.focus();
     }
});

// Segments allows coloring of any output string
function appendSegments(segments) {
    segments.forEach(({text, color}) => {
        const span = document.createElement('span');
        span.style.color = color;
        span.textContent = text;
        output.appendChild(span);
    });
    output.scrollTop = output.scrollHeight;
}

// Displays content that is always at the top of the page
function displayBaseContent() {
    appendBanner(BANNER);
    appendLink("[Wiki]", WIKI_URL, false);
    appendLink("[Blog]", BLOG_URL, false);
    appendLink("[Git]", GITHUB_URL, false);
    appendLink("[About]", ABOUT_URL);
    appendOutput("\n");
    appendOutput(WELCOME_MESSAGE);
    appendPrompt();
}

// Appen link to output area
function appendLink(text, url, newLine = true) {
    var link = document.createElement('a');
    link.href = url;
    link.textContent = text + " ";
    if (newLine) {
        link.textContent += "\n";
    }
    output.appendChild(link);
    output.scrollTop = output.scrollHeight;
}

// Append output area
function appendOutput(text, color = "#e0e0e0", newLine = true) {
    let span = document.createElement('span');
    span.style.color = color;
    span.textContent = text;
    if (newLine) {
        span.textContent += "\n";
    }
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
}

function appendPrompt() {
  var prompt = document.createElement('span');
  prompt.classList.add('prompt');
  prompt.textContent = PROMPT_TEXT;

  activeInput = document.createElement('input');  
  activeInput.classList.add('cli');
  activeInput.id = 'cli';
  
  var input = document.createElement('div');
  input.classList.add('input');
  input.appendChild(prompt);
  input.appendChild(activeInput);
  output.appendChild(input); 
  activeInput.focus();
  output.scrollTop = output.scrollHeight;
}

// Displays the ascii art banner
function appendBanner(text, color = "#39ff14") {
    const pre = document.createElement('pre');
    pre.style.color = color;
    pre.textContent = text;
    output.appendChild(pre);
    output.scrollTop = output.scrollHeight;
}

// Embeds a website in the terminal.
function appendIframe(url) {
    const iframe = document.createElement(`iframe`);
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = "500px";
    iframe.style.maxHeight = `60vh`;
    output.appendChild(iframe);
    output.scrollTop = output.scrollHeight;
    return response([]);
}



