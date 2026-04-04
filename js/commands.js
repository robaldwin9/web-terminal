const filesystem = JSON.parse(localStorage.getItem('filesystem') || '{}');

// Command parser
function parseCommand(command) {
    splitCommand = command.split(' ');
    switch (splitCommand[0]) {
        case 'help':
            return help();
        case 'blog':
            appendIframe(BLOG_URL);
            console.log('blog');
            return '';
        case 'wiki':
            appendIframe(WIKI_URL);
            return '';
        case `about`:
           appendIframe(ABOUT_URL);
           return '';
        case `touch`:
           return createFile(splitCommand[1]);
        case 'ls':
            return listFiles();
        case 'clear':
            return clear();
        case 'cat':
            return concatFiles(splitCommand.slice(1));
        case `nano`:
            return 'nano is not implemented yet';
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
    helpText += "wiki - visite our wiki in the terminal\n";
    helpText += "about - vist autor about page in the terminal\n";
    helpText += "touch <filename> - creates a new file\n";
    helpText += "ls - list of all files\n";
    helpText += "cat <filename> - display contents of a file\n";
    helpText += "nano <filename> - edit a file (not implemented yet)\n";
    return helpText;
}

function notFound(command) {
    return `bash: ${command}: commmand not found`;
}

function clear() {
   output.innerHTML = '';
   displayBaseContent();
   return '';
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
