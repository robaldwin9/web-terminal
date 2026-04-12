const commands = {
    help: {fn: () => help(), desc: 'Shows this help message', scriptable: true},
    clear: {fn: () => clear(), desc: 'Clears the terminal', scriptable: false},
    date: {fn: () => date(), desc: 'Displays the current date and time', scriptable: true},
    history: {fn: () => historyCommand(), desc: 'Shows command history', scriptable: true},
    ls: {fn: (args) => listFiles(args), desc: 'Lists all files', scriptable: true},
    blog: {fn: () => appendIframe(BLOG_URL), desc: 'Visit the blog in the terminal', scriptable: false},
    wiki: {fn: () => appendIframe(WIKI_URL), desc: 'Visit the wiki in the terminal', scriptable: false},
    about: {fn: () => appendIframe(ABOUT_URL), desc: 'Visit the about page in the terminal', scriptable: false},
    clock: {fn: () => appendIframe(CLOCK_URL), desc: 'Launches old clock.js', scriptable: false},
    city: {fn: () => appendIframe(CITY_URL), desc: 'Launches a 3D city generator', scriptable: false},
    cell: {fn: () => appendIframe(CELL_GAME_URL), desc: 'Launches a 2D cell game', scriptable: false},
    touch: {fn: (args) => touch(args), desc: 'Creates a new file', scriptable: true},
    cat: {fn: (args) => concatFiles(args), desc: 'Displays contents of a file', scriptable: true},
    nano: {fn: (args) => nano(args), desc: 'Edit a file', scriptable: false},
    rm: {fn: (args) => remove(args[0]), desc: 'Remove files', scriptable: true},
    mkdir: {fn: (args) => makeDirectory(args), desc: 'Creates a new directory', scriptable: true},
    cd: {fn: (args) => changeDirectory(args), desc: `Change current directory`, scriptable: true},
    pwd: {fn: () => printWorkingDirectory(), desc: 'Print working directory', scriptable: true},
    mv: { fn: (args) => move(args), desc: 'Moves or renames files', scriptable: true },
};

function parseCommand(command, scriptMode = false) {
    if (command.startsWith('./')) {
        return runFile(command.slice(2).split(' '));
    }
    const [name, ...args] = command.split(' ');
    const cmd = commands[name];
    if (!cmd) {
        return notFound(name);
    }

    if (scriptMode && !cmd.scriptable) {
       return response([segment(`${name}: not allowed in scripts`, COLOR.error)])
    }
    return cmd.fn(args);
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

function touch(args) {
    const filename = args[0];
    if (!filename) {
        return response([segment('usage: touch <filename>', COLOR.error)]);
    }

    const result = touchFile(filename);
    if (!result.ok) {
        return response([segment(`touch: ${result.message}`, COLOR.error)]);
    }

    return response([segment('')]);
}

function listFiles(args = []) {
    const targetPath = args[0] || cwd;
    const result = listDirectory(targetPath);

    if (!result.ok) {
        return response([segment(`ls: ${result.message}`, COLOR.error)]);
    }

    if (result.entries.length === 0) {
        return response([segment('')]);
    }

    const segments = result.entries.map(([name, node]) =>
        segment(
            `${name}${node.type === 'dir' ? '/' : ''}\n`,
            node.type === 'dir'
                ? COLOR.directory
                : name.endsWith('.js') || name.endsWith(`.sh`)
                    ? COLOR.success
                    : COLOR.normal
        )
    );

    return response(segments);
}

function concatFiles(args) {
    const filename = args[0];
    if (!filename) {
        return response([segment('usage: cat <filename>', COLOR.error)]);
    }

    const content = readFile(filename);
    if (content === null) {
        return response([segment(`${filename}: No such file`, COLOR.error)]);
    }

    return response([segment(content)]);
}

function remove(filename) {
    if (!filename) {
        return response([segment('usage: rm <filename>', COLOR.error)]);
    }

    const result = removeFile(filename);
    if (!result.ok) {
        return response([segment(`rm: ${result.message}`, COLOR.error)]);
    }

    return response([segment('')]);
}

function segment(text = '', color = COLOR.normal) {
    return {text, color};
}

function response(segments, prompt = true) {
    return {segments, prompt};
}

function runFile(args) {
    const filename = args[0];
    const scriptArgs = args.slice(1);

    if (!filename) {
        return response([segment('usage: ./<filename>', COLOR.error)]);
    }

    const content = readFile(filename);
    if (content === null) {
        return response([segment(`${filename}: no such file`, COLOR.error)]);
    }

    if (filename.endsWith('.sh')) {
        return runShellScript(content, scriptArgs);
    }

    if (filename.endsWith('.js')) {
        try {
            const logs = [];
            const print = (...a) => logs.push(a.join(' '));
            const fn = new Function('args', 'print', content);
            fn(scriptArgs, print);
            return response([segment(logs.join('\n'), COLOR.normal)]);
        } catch (e) {
            return response([segment(e.message, COLOR.error)]);
        }
    }

    return response([segment(`${filename}: unsupported file type`, COLOR.error)]);
}


function runShellScript(content, args = []) {
    const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

    const output = [];

    for (const rawLine of lines) {
        const line = substituteScriptArgs(rawLine, args);
        const result = parseCommand(line, true);

        if (result?.segments) {
            output.push(...result.segments);
        }
    }

    return response(output);
}

function substituteScriptArgs(line, args) {
    return line
        .replace(/\$@/g, args.join(' '))
        .replace(/\$(\d+)/g, (_, index) => args[Number(index) - 1] ?? '');
}

function makeDirectory(args) {
    const dirname = args[0];
    if (!dirname) {
        return response([segment('usage: mkdir <dirname>', COLOR.error)]);
    }

    const result = createDirectory(dirname);
    if (!result.ok) {
        return response([segment(`mkdir: ${result.message}`, COLOR.error)]);
    }

    return response([segment('')]);
}

function changeDirectory(args) {
    const target = args[0] || '/';
    const absPath = resolvePath(target);
    const node = getNode(absPath);

    if (!node) {
        return response([segment(`cd: ${target}: no such directory`, COLOR.error)]);
    }

    if (node.type !== 'dir') {
        return response([segment(`cd: ${target}: not a directory`, COLOR.error)]);
    }

    cwd = absPath;
    return response([]);
}

function printWorkingDirectory() {
    return response([segment(cwd)]);
}

function move(args) {
    const [source, dest] = args;

    if (!source || !dest) {
        return response([segment('usage: mv <source> <destination>', COLOR.error)]);
    }

    const result = movePath(source, dest);
    if (!result.ok) {
        return response([segment(`mv: ${result.message}`, COLOR.error)]);
    }

    return response([segment('')]);
}
