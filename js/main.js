const output = document.getElementById('output');
const BANNER = window.innerWidth < 1024 ? BANNER_MOBILE : BANNER_DESKTOP;

// Focus on CLI unless user clicks on a link
document.addEventListener(`click`, (event) => {
    if (event.target.tagName !== 'A') {
      var cli = document.getElementById('cli');
      if (cli) {
         cli.focus();
      }
    }  
});

// Clear CLI on page refresh
document.fonts.ready.then(() => {
    displayBaseContent();
});

// Detect user input and update the output area
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.classList.contains('cli')) {
        const command = event.target.value.trim();
        if (command) {
            event.target.disabled = true;

            const { text, prompt = true } = parseCommand(command);
            if (text) appendOutput(text);
            if (prompt) appendPrompt();
        }
    }
});

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

  var cli = document.createElement('input');  
  cli.classList.add('cli');
  cli.id = 'cli';
  
  var input = document.createElement('div');
  input.classList.add('input');
  input.appendChild(prompt);
  input.appendChild(cli);
  output.appendChild(input); 
  cli.focus();
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
}

