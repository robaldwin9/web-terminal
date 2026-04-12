# Web Terminal
A browser-based web terminal application created to serve as a landing page
for a developer website.

## Demo
[todoprogramming.org](https://todoprogramming.org) is the current running instance of the main branch.

## Commands
|[Commands]|[Description]                        |
|----------|-------------------------------------|
|help      |Shows this help message              |
|clear     |Clears the terminal                  |
|date      |Displays the current date and time   |
|history   |Shows command history                |
|ls        |Lists all files                      |
|blog      |Visit the blog in the terminal       |
|wiki      |Visit the wiki in the terminal       |
|about     |Visit the about page in the terminal |
|clock     |Launches old clock.js                |
|city      |Launches a 3D city generator         |
|cell      |Launches a 2D cell game              |
|touch     |Creates a new file                   |
|cat       |Displays contents of a file          |
|nano      |Edit a file                          |
|rm        |Remove files                         |
|mkdir     |Creates a new directory              |
|cd        |Change current directory             |
|pwd       |Print working directory              |
|mv        |Moves or renames files               |

## Features
- Persistent client-side browser filesystem
- Executable `.js` files and terminal-command `.sh` scripts

### Create & Edit Files
```sh
touch <filename>.js
nano <filename>.js
./<filename>.js
```
### Example sh script
```sh
 help
 mkdir notes
 cd notes
 touch todo.txt
 nano todo.txt
 cat todo.txt
```

### Example js script
```js
   for (let i = 1; i <= 20; i++) {
       if (i % 15 === 0) print('FizzBuzz');
       else if (i % 3 === 0) print('Fizz');
       else if (i % 5 === 0) print('Buzz');
       else print(i);
   }
```

