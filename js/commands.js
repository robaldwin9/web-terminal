const filesystem = JSON.parse(localStorage.getItem('filesystem') || '{}');

// Command parser
function parseCommand(command) {
    splitCommand = command.split(' ');
    switch (splitCommand[0]) {
        case 'help':
            return { text: help() };
        case 'blog':
            appendIframe(BLOG_URL);
            return {};
        case 'wiki':
            appendIframe(WIKI_URL);
            return {};
        case 'about':
            appendIframe(ABOUT_URL);
            return {};
        case 'touch':
            return { text: createFile(splitCommand[1]) };
        case 'ls':
            return { text: listFiles() };
        case 'clear':
            clear();
            return { prompt: false };
        case 'cat':
            return { text: concatFiles(splitCommand.slice(1)) };
        case 'nano':
            return { text: 'nano is not implemented yet' };
        case 'clock':
            appendIframe(CLOCK_URL);
            return {};
        case 'city':
            appendIframe(CITY_URL);
            return {};
        case 'cell':
            appendIframe(CELL_GAME_URL);
            return {};
        case 'recursive':
            appendIframe("https://todoprogramming.org");
            return {};
        default:
            return notFound(command);
    }
}

// Command functions
function help() {
    var helpText = "Available commands:\n"; 
    helpText += "help - Shows this help message\n";
    helpText += "clear - Clears the terminal\n";
    helpText += "blog - visit our blog in the terminal\n";
    helpText += "wiki - visit our wiki in the terminal\n";
    helpText += "about - visit autor about page in the terminal\n";
    helpText += "touch <filename> - creates a new file\n";
    helpText += "ls - list of all files\n";
    helpText += "cat <filename> - display contents of a file\n";
    helpText += "nano <filename> - edit a file (not implemented yet)\n";
    helpText += "clock - lanches old clock.js\n";
    helpText += "city - launches a 3D city generater application\n";
    helpText += "cell - launches a 2D cell game\n";
    return helpText;
}

function notFound(command) {
    return { text: `bash: ${command}: command not found` };
}

function clear() {
   while (output.firstChild) output.removeChild(output.firstChild);
   displayBaseContent();
}

function createFile(filename) {
    if (!filename) return 'usage: touch <filename>';
    filesystem[filename] = '';
    localStorage.setItem('filesystem', JSON.stringify(filesystem));
    return `created ${filename}`;
}

function listFiles() {
    const files = Object.keys(filesystem);
    if (files.length === 0) {
        return "";
    } else {
        return files.join('\n');
    }
}

function concatFiles(filenames) {
    if (filenames.length === 0) return 'usage: cat <filename>';
    if (filesystem[filenames[0]] === undefined) return `${filenames[0]}: No such file`;
    if (filesystem[filenames[0]] === '') return ""; 
    return filesystem[filenames[0]];
}
