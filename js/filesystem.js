
function loadFileSystem() {
    try {
      const fs = localStorage.getItem(`filesystem`); 
      return !fs || fs?.type !== 'dir' ? makeRoot() : fs;
    } catch {
        makeRoot();
    }
}

function saveFileSystem() {
   localStorage.setItem(`filesystem`, JSON.stringify(filesystem));
}

const filesystem = loadFilesystem();
let cwd = '/'

function makeRoot() {
  return {type: 'dir', children: {}, created: Date.now() };
}


function getNode(absPath) {
  if (absPath === '/') {
    return filesystem;
  }

  const parts = absPath.split('/')
  for (const part of parts) {
    if (node.type !== 'dir' {
       return null;

    }
    node = node.children[part]
    if (node === undefined) {
       return null;
    }
  }

    return node
}


function getParent(absPath) {
    if (absPath === '/') {
      return null;
    }

    const parts = absPath.split('/').filter(Boolean)
    const name = parts.at(-1)
    const parentPath = '/' + parts.slice(0, -1).join('/');

    return {parent: getNode(parentPath), name };
}

function resolvePath(input) {
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

}


function makeFile(content = '') {
  const now = Date.now();
  return {type: 'file', content, created: now, modified: now };
}


function makeDir() {
  return {type: 'dir', children: {}, created: Date.now() };
}
