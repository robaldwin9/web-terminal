const cli = document.getElementById('cli');
const output = document.getElementById('output');
const prompt = document.getElementById('prompt');

// Focus on CLI unless user clicks on a link
document.addEventListener(`click`, (event) => {
    if (event.target.tagName !== 'A') {
        cli.focus();
    }  
});

// Clear CLI on page refresh
document.addEventListener('DOMContentLoaded', (event) => {
    const isRefreshed = performance.getEntriesByType('navigation')[0].type === 'reload';
    if (isRefreshed) {
        cli.value = ' ';
    }
    
    displayBaseContent();
});

// Detect user input and update the output area
cli.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = cli.value.trim();
        if (command) {
            cli.value = '';
            appendOutput(prompt.textContent + " ", "green", false);
            appendOutput(command, "white");
            appendOutput(parseCommand(command));
        }
    }
});

// Displays content that is always at the top of the page
function displayBaseContent() {
    appendBanner(BANNER);
    appendLink("Wiki", WIKI_URL, false);
    appendLink("Blog", BLOG_URL, false);
    appendLink("GitHub", GITHUB_URL, false);
    appendLink("About", ABOUT_URL);
    appendOutput("\n");
    appendOutput(WELCOME_MESSAGE);
}


// Appen link to output area
function appendLink(text, url, newLine = true) {
    output.innerHTML += `<a href = "${url}" target="_blank"> ${text} </a>`;
    if (newLine) {
        output.innerHTML += '\n';
    } 
    output.scrollTop = output.scrollHeight;
}

// Append output area
function appendOutput(text, color = "white", newLine = true) {
    output.innerHTML += `<span style="color: ${color}">${text}</span>`;
    if (newLine) {
        output.innerHTML += `\n`;
    }
    output.scrollTop = output.scrollHeight;
}

// Displays the ascii art banner
function appendBanner(text, color = "green") {
    const pre = document.createElement('pre');
    pre.style.color = color;
    pre.style.margin = '0';
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

