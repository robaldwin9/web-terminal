/**
 * returns filesystem reference, or creates it if it does not exist
 * @returns {{type: string, children: {}, created: number}|any} filesystem structure
 */
function loadFileSystem() {
    try {
        const raw = localStorage.getItem('filesystem');
        if (!raw) {
            return makeRoot();
        }

        const parsed = JSON.parse(raw);

        if (parsed?.type === 'dir') {
            return parsed;
        }

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const root = makeRoot();
            for (const [name, content] of Object.entries(parsed)) {
                root.children[name] = makeFile(typeof content === 'string' ? content : '');
            }
            return root;
        }

        return makeRoot();
    } catch {
        return makeRoot();
    }
}

/**
 * Saves the filesystem to browser memory
 */
function saveFileSystem() {
    localStorage.setItem(`filesystem`, JSON.stringify(filesystem));
}

const filesystem = loadFileSystem();
let cwd = '/'

/**
 * Creates the root directory of the filesystem
 *
 * @returns {{type: string, children: {}, created: number}} root directory
 */
function makeRoot() {
    return {type: 'dir', children: {}, created: Date.now()};
}

/**
 * Returns a node of the filesystem tree
 *
 * @param absPath absolute path of string, should be already resolved
 * @returns {{type: string, children: {}, created: number}
 * |any
 * |{type: string, children: {}, created: number}|null} filesystem node
 */
function getNode(absPath) {
    if (absPath === '/') {
        return filesystem;
    }

    const parts = absPath.split('/').filter(Boolean);
    let node = filesystem;
    for (const part of parts) {
        if (node.type !== 'dir') {
            return null;
        }

        node = node.children[part];
        if (node === undefined) {
            return null;
        }
    }

    return node;
}

/**
 * Gets parent node from path
 *
 * @param absPath absolute directory path
 * @returns {{parent: {type: string, children: {},
 * created: number}|any|{type: string, children: {}, created: number},
 * name: unknown}|null} parent directory node of file/directory
 */
function getParent(absPath) {
    if (absPath === '/') {
        return null;
    }

    const parts = absPath.split('/').filter(Boolean)
    const name = parts.at(-1)
    const parentPath = '/' + parts.slice(0, -1).join('/');

    return {parent: getNode(parentPath), name};
}

/**
 * Resolves user provided path into and absolute path
 *
 * @param inputPath input provided by user
 * @returns {string} absolute path
 */
function resolvePath(inputPath) {
    const base = inputPath.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
    const parts = [...base, ...inputPath.split('/').filter(Boolean)];

    const resolved = []
    for (const part of parts) {
        if (part === '..') {
            resolved.pop();
        } else if (part !== '.') {
            resolved.push(part)
        }
    }

    return '/' + resolved.join('/');
}

/**
 * Makes a file node
 *
 * @param content contents of the file
 * @returns {{type: string, content: string, created: number, modified: number}} a file type filesystem node
 */
function makeFile(content = '') {
    const now = Date.now();
    return {type: 'file', content, created: now, modified: now};
}

/**
 * Makes a directory mode
 *
 * @returns {{type: string, children: {}, created: number}} a directory type filesystem node
 */
function makeDir() {
    return {type: 'dir', children: {}, created: Date.now()};
}

/**
 * build CLI prompt text
 *
 * @returns {string} The prompt text at the bottom of the CLI
 */
function getPromptText() {
    const display = cwd === '/' ? '~' : '~' + cwd;
    return `${PROMPT_PREFIX}:${display}$ `;
}

/**
 * Read contents of a file
 *
 * @param path The directory path provided as a string
 * @returns {*|string|null} File contents
 */
function readFile(path) {
    const node = getNode(resolvePath(path));
    if (!isFile(node)) {
        return null;
    }

    return node.content || '';
}

/**
 * Determines if a node is of type file
 *
 * @param node filesystem entity
 * @returns {boolean} is the filesystem node a file type
 */
function isFile(node) {
    return !!node && node.type === 'file';
}

/**
 * Determines if a node is of type directory
 *
 * @param node filesystem entity
 * @returns {boolean} is the filesystem node a directory type
 */
function isDir(node) {
    return !!node && node.type === 'dir';
}

/**
 * creates a file usefull for future commands
 *
 * @param path The directory path provided as a string
 * @param content file contents
 * @returns {{ok: boolean}|{ok: boolean, message: string}} OK -> success, message -> failure reason
 */
function createFile(path, content = '') {
    const absPath = resolvePath(path);
    const parentInfo = getParent(absPath);

    if (!parentInfo?.parent || !isDir(parentInfo.parent)) {
        return {ok: false, message: `cannot create file '${path}'`};
    }

    if (parentInfo.parent.children[parentInfo.name]) {
        return {ok: false, message: `cannot create file '${path}': File exists`};
    }

    parentInfo.parent.children[parentInfo.name] = makeFile(content);
    saveFileSystem();
    return {ok: true};
}

/**
 * Writes contents to a specified file
 *
 * @param path The directory path provided as a string
 * @param content file contents
 * @returns {{ok: boolean}|{ok: boolean, message: string}} OK -> success, message -> failure reason
 */
function writeFile(path, content) {
    if (!path) {
        return {ok: false, message: 'missing file name'};
    }

    const absPath = resolvePath(path);
    const parentInfo = getParent(absPath);

    if (!parentInfo?.parent || !isDir(parentInfo.parent)) {
        return {ok: false, message: `cannot save '${path}'`};
    }

    const existing = parentInfo.parent.children[parentInfo.name];
    if (existing && !isFile(existing)) {
        return {ok: false, message: `${path}: is a directory`};
    }

    if (existing) {
        existing.content = content;
        existing.modified = Date.now();
    } else {
        parentInfo.parent.children[parentInfo.name] = makeFile(content);
    }

    saveFileSystem();
    return {ok: true};
}

/**
 * removes a file from the filesystem structure
 *
 * @param path The directory path provided as a string
 * @returns {{ok: boolean}|{ok: boolean, message: string}} OK -> success, message -> failure reason
 */
function removeFile(path) {
    const absPath = resolvePath(path);
    const parentInfo = getParent(absPath);
    const node = getNode(absPath);

    if (!node || !parentInfo?.parent || !isDir(parentInfo.parent)) {
        return {ok: false, message: `${path}: no such file`};
    }

    if (!isFile(node)) {
        return {ok: false, message: `${path}: is a directory`};
    }

    delete parentInfo.parent.children[parentInfo.name];
    saveFileSystem();
    return {ok: true};
}

/**
 * Adds a directory node to the filesystem structure
 *
 * @param path The directory path provided as a string
 * @returns {{ok: boolean}|{ok: boolean, message: string}} OK -> success, message -> failure reason
 */
function createDirectory(path) {
    const absPath = resolvePath(path);
    const parentInfo = getParent(absPath);

    if (!parentInfo?.parent || !isDir(parentInfo.parent)) {
        return {ok: false, message: `cannot create directory '${path}'`};
    }

    if (parentInfo.parent.children[parentInfo.name]) {
        return {ok: false, message: `${path}: already exists`};
    }

    parentInfo.parent.children[parentInfo.name] = makeDir();
    saveFileSystem();
    return {ok: true};
}

/**
 * Handles touch file creation
 *
 * @param path the directory path provided as a string
 * @returns {{ok: boolean}|{ok: boolean, message: string}} OK -> success, message -> failure reason
 */
function touchFile(path) {
    const absPath = resolvePath(path);
    const parentInfo = getParent(absPath);

    if (!parentInfo?.parent || !isDir(parentInfo.parent)) {
        return {ok: false, message: `cannot touch '${path}'`};
    }

    const existing = parentInfo.parent.children[parentInfo.name];

    if (existing) {
        if (!isFile(existing)) {
            return {ok: false, message: `${path}: is a directory`};
        }

        existing.modified = Date.now();
    } else {
        parentInfo.parent.children[parentInfo.name] = makeFile('');
    }

    saveFileSystem();
    return {ok: true};
}


function listDirectory(path = cwd) {
    const node = getNode(resolvePath(path));
    if (!isDir(node)) {
        return { ok: false, message: `${path}: no such directory` };
    }

    return { ok: true, entries: Object.entries(node.children) };
}

function movePath(sourcePath, destPath) {
    const sourceAbs = resolvePath(sourcePath);
    if (sourceAbs === '/') {
        return { ok: false, message: 'cannot move root directory' };
    }

    const sourceInfo = getParent(sourceAbs);
    const sourceNode = getNode(sourceAbs);

    if (!sourceNode || !sourceInfo?.parent || !isDir(sourceInfo.parent)) {
        return { ok: false, message: `${sourcePath}: no such file or directory` };
    }

    let finalDestAbs = resolvePath(destPath);
    const destNode = getNode(finalDestAbs);

    if (isDir(destNode)) {
        finalDestAbs = finalDestAbs === '/'
            ? `/${sourceInfo.name}`
            : `${finalDestAbs}/${sourceInfo.name}`;
    }

    if (finalDestAbs === sourceAbs) {
        return { ok: true };
    }

    if (isDir(sourceNode) && finalDestAbs.startsWith(`${sourceAbs}/`)) {
        return { ok: false, message: `cannot move '${sourcePath}' into itself` };
    }

    const destInfo = getParent(finalDestAbs);
    if (!destInfo?.parent || !isDir(destInfo.parent)) {
        return { ok: false, message: `cannot move to '${destPath}'` };
    }

    if (destInfo.parent.children[destInfo.name]) {
        return { ok: false, message: `${destPath}: destination exists` };
    }

    delete sourceInfo.parent.children[sourceInfo.name];
    destInfo.parent.children[destInfo.name] = sourceNode;
    saveFileSystem();

    return { ok: true };
}

 
