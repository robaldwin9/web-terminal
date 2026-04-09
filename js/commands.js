const filesystem = JSON.parse(localStorage.getItem('filesystem') || '{}');

const commands = {
    help: {fn: () => help(), desc: 'Shows this help message'},
    clear: {fn: () => clear(), desc: 'Clears the terminal'},
    date: {fn: () => date(), desc: 'Displays the current date and time'},
    history: {fn: () => historyCommand(), desc: 'Shows command history'},
    ls: {fn: () => listFiles(), desc: 'Lists all files'},
    blog: {fn: () => appendIframe(BLOG_URL), desc: 'Visit the blog in the terminal'},
    wiki: {fn: () => appendIframe(WIKI_URL), desc: 'Visit the wiki in the terminal'},
    about: {fn: () => appendIframe(ABOUT_URL), desc: 'Visit the about page in the terminal'},
    clock: {fn: () => appendIframe(CLOCK_URL), desc: 'Launches old clock.js'},
    city: {fn: () => appendIframe(CITY_URL), desc: 'Launches a 3D city generator'},
    cell: {fn: () => appendIframe(CELL_GAME_URL), desc: 'Launches a 2D cell game'},
    touch: {fn: (args) => createFile(args), desc: 'Creates a new file'},
    cat: {fn: (args) => concatFiles(args), desc: 'Displays contents of a file'},
    nano: {fn: (args) => nano(args), desc: 'Edit a file'},
    rm: {fn: (args) => remove(args[0]), desc: 'Remove files'}
};

function parseCommand(command) {
    const [name, ...args] = command.split(' ');
    const cmd = commands[name];
    return cmd ? cmd.fn(args) : notFound(name);
}

function help() {
    const cmdCol = 10;
    const descCol = 37;

    const pad = (str, len) => str.substring(0, len).padEnd(len);
    const divider = `|${'-'.repeat(cmdCol)}|${'-'.repeat(descCol)}|\n`;

    let helpText = `|${pad('[Commands]', cmdCol)}|${pad('[Description]', descCol)}|\n`;
    helpText += divider;

    for (const [name, {desc}] of Object.entries(commands)) {
        helpText += `|${pad(name, cmdCol)}|${pad(desc, descCol)}|\n`;
    }

    return response([segment(helpText)]);
}

function notFound(command) {
    return response([segment(`bash: ${command}: command not found`, COLOR.error)]);
}

function clear() {
    output.innerHTML = '';
    displayBaseContent();
    historyIndex = -1;
    return null;
}

function date() {
    const date = new Date();
    return response([segment(date.toString())]);
}

function historyCommand() {
    const text = commandHistory.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
    return response([segment(text)]);
}

function createFile(args) {
    let filename = args[0]
    if (!filename) {
        return response([segment('usage: touch <filename>', COLOR.error)]);
    }
    filesystem[filename] = '';
    localStorage.setItem('filesystem', JSON.stringify(filesystem));
    return response([segment(`created ${filename}`)]);
}

function listFiles() {
    const files = Object.keys(filesystem);
    if (files.length === 0) {
        return response([segment("")]);
    }
    return response([segment(files.join('\n'))]);
}

function concatFiles(args) {
    if (args.length === 0) {
        return response([segment('usage: cat <filename>', COLOR.error)]);
    }

    if (filesystem[args[0]] === undefined) {
        return response([segment(`${args[0]}: No such file`, COLOR.error)]);
    }

    if (filesystem[args[0]] === '') {
        return response([segment("")]);
    }

    return response([segment(filesystem[args[0]])]);
}

function remove(filename) {
    if (!filename) {
        return response([segment("usage: rm <filename>", COLOR.error)]);
    }

    if (filesystem[filename] === undefined) {
        return response([segment(`rm ${filename}: no such file`, COLOR.error)]);
    }

    delete filesystem[filename];
    localStorage.setItem('filesystem', JSON.stringify(filesystem));
    return response([segment('')]);
}

function segment(text = '', color = COLOR.normal) {
    return {text, color};
}

function response(segments, prompt = true) {
    return {segments, prompt};
}
