const filesystem = JSON.parse(localStorage.getItem('filesystem') || '{}');

const commands = {
     help:      { fn: ()     => help(),                                desc: 'Shows this help message'                  },
     clear:     { fn: ()     => clear(),                               desc: 'Clears the terminal'                      },
     date:      { fn: ()     => date(),                                desc: 'Displays the current date and time'       },
     history:   { fn: ()     => historyCommand(),                      desc: 'Shows command history'                    },
     ls:        { fn: ()     => listFiles(),                           desc: 'Lists all files'                          },
     blog:      { fn: ()     => appendIframe(BLOG_URL),                desc: 'Visit the blog in the terminal'           },
     wiki:      { fn: ()     => appendIframe(WIKI_URL),                desc: 'Visit the wiki in the terminal'           },
     about:     { fn: ()     => appendIframe(ABOUT_URL),               desc: 'Visit the about page in the terminal'     },
     clock:     { fn: ()     => appendIframe(CLOCK_URL),               desc: 'Launches old clock.js'                    },
     city:      { fn: ()     => appendIframe(CITY_URL),                desc: 'Launches a 3D city generator'             },
     cell:      { fn: ()     => appendIframe(CELL_GAME_URL),           desc: 'Launches a 2D cell game'                  },
     recursive: { fn: ()     => appendIframe("https://todoprogramming.org"), desc: 'Loads this site inside itself'      },
     touch:     { fn: (args) => createFile(args[0]),                   desc: 'Creates a new file'                       },
     cat:       { fn: (args) => concatFiles(args[0]),                     desc: 'Displays contents of a file'              },
     nano:      { fn: (args) => nano(args), desc: 'Edit a file (coming soon)'   },
 };

 function parseCommand(command) {
     const [name, ...args] = command.split(' ');
     const cmd = commands[name];
     return cmd ? cmd.fn(args) : notFound(name);
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
   historyIndex = -1
   return null;
}

function date() {
    const date = new Date();
    return response([segment(date.toString())]);
}

function historyCommand() {
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
