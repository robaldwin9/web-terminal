const output = document.getElementById('output');
const isAndroid = /android/i.test(navigator.userAgent);
const isMobile = window.innerWidth < 1041;
const BANNER = isAndroid ? BANNER_ANDROID : isMobile ? BANNER_MOBILE : BANNER_DESKTOP;
const commandHistory = [];
let historyIndex = -1;
let activeInput = null;
let tabMatches = [];
let tabIndex = -1;
let tabPartial = '';
let tabApply = null;
let tabSeed = '';

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
    if (document.getElementById('nanoOverlay')) {
        return;
    }

    if (event.key !== 'Tab') {
        tabMatches = [];
        tabIndex = -1;
        tabPartial = '';
        tabSeed = '';
        tabApply = null;
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

        if (!tabMatches.length) {
            const completion = completeInput(activeInput.value);
            if (completion.matches.length === 0) return;

            tabSeed = completion.partial;
            tabPartial = completion.partial;
            tabMatches = completion.matches;
            tabApply = completion.apply;
            tabIndex = -1;
        }

        tabIndex = (tabIndex + 1) % tabMatches.length;
        activeInput.value = tabApply(tabMatches[tabIndex]);
        activeInput.focus();
    }
});

/**
 * Append output segments to the DOM
 *
 * @param segments array of text segments, allows to have different colors on individual pieces of output
 */
function appendSegments(segments) {
    segments.forEach(({text, color}) => {
        const span = document.createElement('span');
        span.style.color = color;
        span.textContent = text;
        output.appendChild(span);
    });
    output.scrollTop = output.scrollHeight;
}

/**
 * Displays content that is always at the top of the page
 */
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

/**
 * Adds a link to the DOM
 *
 * @param text link text
 * @param url link URL
 * @param newLine should new line be appended
 */
function appendLink(text, url, newLine = true) {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = text + " ";
    if (newLine) {
        link.textContent += "\n";
    }
    output.appendChild(link);
    output.scrollTop = output.scrollHeight;
}

/**
 * helper functions for appending output text to the DOM
 *
 * @param text output text
 * @param color text color
 * @param newLine should new line be appended
 */
function appendOutput(text, color = COLOR.normal, newLine = true) {
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = text;
    if (newLine) {
        span.textContent += "\n";
    }
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
}

/**
 * Adds a new prompt to the CLI, this is the user input line
 */
function appendPrompt() {
    const prompt = document.createElement('span');
    prompt.classList.add('prompt');
    prompt.textContent = getPromptText();

    activeInput = document.createElement('input');
    activeInput.classList.add('cli');
    activeInput.id = 'cli';

    const input = document.createElement('div');
    input.classList.add('input');
    input.appendChild(prompt);
    input.appendChild(activeInput);
    output.appendChild(input);
    activeInput.focus();
    output.scrollTop = output.scrollHeight;
}


/**
 * Add top level ASCII text banner to the DOM
 *
 * @param text ASCII to display
 * @param color color of ASCII text
 */
function appendBanner(text, color = COLOR.success) {
    const pre = document.createElement('pre');
    pre.style.color = color;
    pre.textContent = text;
    output.appendChild(pre);
    output.scrollTop = output.scrollHeight;
}

/**
 * Embeds a website in the terminal.
 *
 * @param url website url
 * @returns {{segments: *, prompt: boolean}} segmented response
 */
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

/**
 *
 * @param value
 * @returns {{partial: *, matches: [], apply: function(): *}|{partial: *, matches: string[], apply: function(*): *}|{partial: *, matches: string[], apply: function(*): *}}
 */
function completeInput(value) {
    const trimmedStart = value.trimStart();

    if (!trimmedStart.includes(' ') && !trimmedStart.startsWith('./')) {
        return {
            partial: value,
            matches: Object.keys(commands).filter(name => name.startsWith(value)),
            apply: (match) => match,
        };
    }

    return getPathCompletion(value);
}

/**
 *
 * @param value
 * @returns {{partial: *, matches: string[], apply: function(*): *}|{partial: *, matches: *[], apply: function(): *}}
 */
function getPathCompletion(value) {
    const lastSpace = value.lastIndexOf(' ');
    const base = lastSpace === -1 ? '' : value.slice(0, lastSpace + 1);
    const partialPath = value.slice(lastSpace + 1);

    const endsWithSlash = partialPath.endsWith('/');
    const absPath = resolvePath(partialPath || '.');
    const parentInfo = endsWithSlash ? { parent: getNode(absPath), name: '' } :
        getParent(absPath);

    if (!parentInfo?.parent || parentInfo.parent.type !== 'dir') {
        return { partial: partialPath, matches: [], apply: () => value };
    }

    const prefix = endsWithSlash ? '' : parentInfo.name;
    const matches = Object.entries(parentInfo.parent.children)
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, node]) => `${name}${node.type === 'dir' ? '/' : ''}`);

    return {
        partial: partialPath,
        matches,
        apply: (match) => base + buildCompletedPath(partialPath, match),
    };

}

/**
 *
 * @param partialPath
 * @param match
 * @returns {*}
 */
function buildCompletedPath(partialPath, match) {
    const slashIndex = partialPath.lastIndexOf('/');
    if (slashIndex === -1) {
        return match;
    }

    return partialPath.slice(0, slashIndex + 1) + match;
}
