const filesystem = JSON.parse(localStorage.getItem('filesystem') || '{}');

// Command parser
function parseCommand(command) {
    splitCommand = command.split(' ');
    switch (splitCommand[0]) {
        case 'help':
            return help();
        case 'blog':
            return appendIframe(BLOG_URL);
        case 'wiki':
            return appendIframe(WIKI_URL);
        case 'about':
            return appendIframe(ABOUT_URL);
        case 'touch':
            return createFile(splitCommand[1]);
        case 'ls':
            return listFiles();
        case 'clear':
            return clear();
        case 'cat':
            return concatFiles(splitCommand.slice(1))
        case 'nano':
            return [segment('nano is not implemented yet')];
        case 'clock':
            return appendIframe(CLOCK_URL);
        case 'city':
            return appendIframe(CITY_URL);
        case 'cell':
            return appendIframe(CELL_GAME_URL);
        case 'recursive':
            return appendIframe("https://todoprogramming.org");
        case 'date':
            return date();
        case 'history':
            return history();
        default:
            return notFound(command);
    }
}

// Command functions
function help() {
    var helpText = "";
    helpText += "|Commands]        |[Description]                             |\n"
    helpText += "|-----------------|------------------------------------------|\n";
    helpText += "|help             |Shows this help message                   |\n";
    helpText += "|clear            |Clears the terminal                       |\n";
    helpText += "|blog             |visit our blog in the terminal            |\n";
    helpText += "|wiki             |visit our wiki in the terminal            |\n";
    helpText += "|about            |visit autor about page in the terminal    |\n";
    helpText += "|touch <filename> |creates a new file                        |\n";
    helpText += "|ls               |list of all files                         |\n";
    helpText += "|cat   <filename> |display contents of a file                |\n";
    helpText += "|nano  <filename> |edit a file (not implemented yet)         |\n";
    helpText += "|clock            |lanches old clock.js                      |\n";
    helpText += "|city             |launches a 3D city generater application  |\n";
    helpText += "|cell             |launches a 2D cell game                   |\n";
    helpText += "|date             |Display the current date                  |\n";
    helpText += "|history          |Display previouse commands                |\n";
    return response([segment(helpText)]);
}

function notFound(command) {
    return response([segment(`bash: ${command}: command not found`, COLOR.error)]);
}

function clear() {
   while (output.firstChild) output.removeChild(output.firstChild);
   displayBaseContent();
   return null;
}

function date() {
    const date = new Date();
    return response([segment(date.toString())]);

}

function history() {
    let output = '';

    for (let i = 1; i < 1000; i++) {
        command = commandHistory[i-1];
        if (command) {
            output += i + ". " + command + "\n";
        } else {
            break;
        }
   }

    return response([segment(output)]); 
}

function createFile(filename) {
    if (!filename) return 'usage: touch <filename>';
    filesystem[filename] = '';
    localStorage.setItem('filesystem', JSON.stringify(filesystem));
    return response([segment(`created ${filename}`)]);
}

function listFiles() {
    const files = Object.keys(filesystem);
    if (files.length === 0) {
        return response([segment("")]);
    } else {
        return response([segment(files.join('\n'))]);
    }
}

function concatFiles(filenames) {
    if (filenames.length === 0) return 'usage: cat <filename>';
    if (filesystem[filenames[0]] === undefined) return `${filenames[0]}: No such file`;
    if (filesystem[filenames[0]] === '') return ""; 
    return response([segment(filesystem[filenames[0]])]);
}


function segment(text = '', color = COLOR.normal) {
    return { text, color }; 
}

function response(segments, prompt = true) {
    return {segments, prompt};
}
