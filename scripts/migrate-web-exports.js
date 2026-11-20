'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { isUtf8 } = require('node:buffer');

const VERSION = '1.0.1';
const LINK_REMINDER = '提醒：catalog 與筆記中指向舊檔名的連結不會自動更新。';
const NO_FOLLOW = fs.constants.O_NOFOLLOW || 0;

function pathKey(filename) {
    return path.resolve(filename).toLowerCase();
}

function isWithin(filename, directory) {
    const relative = path.relative(pathKey(directory), pathKey(filename));
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

// Inspect components without following a symlink, including ancestors of the input.
function assertNoSymlinks(filename, allowMissing = false) {
    const absolute = path.resolve(filename);
    const root = path.parse(absolute).root;
    let current = root;
    for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
        current = path.join(current, part);
        let stat;
        try {
            stat = fs.lstatSync(current);
        } catch (error) {
            if (allowMissing && error.code === 'ENOENT') return;
            throw error;
        }
        if (stat.isSymbolicLink()) throw new Error(`Refusing symlink path: ${current}`);
    }
}

function ensureBackupDirectory(directory) {
    const absolute = path.resolve(directory);
    const root = path.parse(absolute).root;
    let current = root;
    for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
        const existingNames = fs.readdirSync(current);
        const alias = existingNames.find(name => name.toLowerCase() === part.toLowerCase() && name !== part);
        if (alias) throw new Error(`Backup directory has a case-insensitive alias: ${path.join(current, alias)}`);
        current = path.join(current, part);
        try {
            fs.mkdirSync(current);
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
        const stat = fs.lstatSync(current);
        if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Backup path is not a regular directory: ${current}`);
    }
}

function assertNameAvailable(filename) {
    assertNoSymlinks(path.dirname(filename));
    const basename = path.basename(filename).toLowerCase();
    for (const name of fs.readdirSync(path.dirname(filename))) {
        if (name.toLowerCase() !== basename) continue;
        const existing = path.join(path.dirname(filename), name);
        throw new Error(`Destination already exists (case-insensitive): ${existing}`);
    }
}

function sameFile(left, right) {
    return left.dev === right.dev && left.ino === right.ino;
}

function readOriginal(filename) {
    assertNoSymlinks(filename);
    const before = fs.lstatSync(filename);
    if (!before.isFile()) throw new Error(`Not a regular file: ${filename}`);
    const descriptor = fs.openSync(filename, fs.constants.O_RDONLY | NO_FOLLOW);
    try {
        const stat = fs.fstatSync(descriptor);
        if (!stat.isFile() || !sameFile(before, stat)) throw new Error(`Source changed while opening: ${filename}`);
        const bytes = fs.readFileSync(descriptor);
        const after = fs.fstatSync(descriptor);
        if (stat.size !== after.size || stat.mtimeMs !== after.mtimeMs || bytes.length !== after.size) {
            throw new Error(`Source changed while reading: ${filename}`);
        }
        return { bytes, stat: after };
    } finally {
        fs.closeSync(descriptor);
    }
}

function assertUnchanged(descriptor, filename, original) {
    assertNoSymlinks(filename);
    const named = fs.lstatSync(filename);
    const stat = fs.fstatSync(descriptor);
    if (!named.isFile() || !stat.isFile() || !sameFile(named, stat) || !sameFile(stat, original.stat)) {
        throw new Error(`Source replaced since planning: ${filename}`);
    }
    const bytes = Buffer.alloc(original.bytes.length + 1);
    let length = 0;
    while (length < bytes.length) {
        const count = fs.readSync(descriptor, bytes, length, bytes.length - length, length);
        if (!count) break;
        length += count;
    }
    if (length !== original.bytes.length || !bytes.subarray(0, length).equals(original.bytes)) {
        throw new Error(`Source content changed since planning: ${filename}`);
    }
}

function writeBytes(descriptor, bytes) {
    let offset = 0;
    while (offset < bytes.length) {
        const count = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
        if (!count) throw new Error('File write made no progress');
        offset += count;
    }
    fs.ftruncateSync(descriptor, bytes.length);
    fs.fsyncSync(descriptor);
}

// File.Move(source, target) uses Windows' no-replace move, unlike fs.rename.
// Other platforms fail closed; there is no overwrite-capable fallback.
function moveNoReplace(source, target) {
    if (process.platform !== 'win32') throw new Error('--apply --rename requires Windows native no-clobber File.Move; this platform is unsupported');
    const executable = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    const command = "$ErrorActionPreference = 'Stop'; try { [IO.File]::Move($env:AZA_MIGRATION_SOURCE, $env:AZA_MIGRATION_TARGET) } catch { [Console]::Error.WriteLine($_.Exception.ToString()); exit 1 }";
    const result = spawnSync(executable, ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(command, 'utf16le').toString('base64')], {
        env: { ...process.env, AZA_MIGRATION_SOURCE: source, AZA_MIGRATION_TARGET: target },
        encoding: 'utf8',
        windowsHide: true,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Native no-clobber move failed: ${(result.stderr || result.stdout || `exit ${result.status}, signal ${result.signal}`).trim()}`);
}

function isProtected(name, exclude) {
    return name.startsWith('AUTO_BACKUP_') || exclude.some(word => name.includes(word));
}

function runMigration({ input, apply = false, rename = false, backupDir, exclude = [] } = {}) {
    if (!Array.isArray(exclude) || exclude.some(word => typeof word !== 'string' || !word)) throw new Error('exclude must be nonempty strings');
    if (typeof input !== 'string' || !input) throw new Error('An input file or directory is required');
    if (typeof apply !== 'boolean' || typeof rename !== 'boolean') throw new Error('apply and rename must be booleans');
    if (backupDir !== undefined && (typeof backupDir !== 'string' || !backupDir)) throw new Error('backupDir must be a nonempty path');
    if (apply && !backupDir) throw new Error('--apply requires --backup-dir PATH');
    if (apply && rename && process.platform !== 'win32') {
        throw new Error('--apply --rename requires Windows native no-clobber File.Move; dry-run and content-only apply remain portable');
    }
    const sourceRoot = path.resolve(input);
    assertNoSymlinks(sourceRoot);
    const rootStat = fs.lstatSync(sourceRoot);
    if (!rootStat.isDirectory() && !rootStat.isFile()) throw new Error(`Input is not a regular file or directory: ${sourceRoot}`);
    const relativeRoot = rootStat.isDirectory() ? sourceRoot : path.dirname(sourceRoot);
    const backupRoot = backupDir === undefined ? null : path.resolve(backupDir);
    if (backupRoot) {
        if (pathKey(backupRoot) === pathKey(sourceRoot) || (rootStat.isDirectory() && isWithin(backupRoot, sourceRoot))) {
            throw new Error(`Backup directory must be outside the scan root: ${backupRoot}`);
        }
        assertNoSymlinks(backupRoot, true);
    }
    const { convertMarkdown, convertFilename } = require('./convert-web-export');
    const report = { input: sourceRoot, apply, rename, backupDir: backupRoot, entries: [], errors: [], reminder: LINK_REMINDER };
    const plans = [];
    const recordError = (entry, error) => {
        entry.status = 'error';
        entry.warnings.push(error.message);
        report.errors.push({ source: entry.source, message: error.message });
    };
    function visit(source) {
        const entry = { source, target: source, status: 'unchanged', changes: [], warnings: [] };
        try {
            const stat = fs.lstatSync(source);
            if (stat.isSymbolicLink()) {
                entry.status = 'skipped-symlink';
                entry.warnings.push('Symlink ignored; its target was not read.');
            } else if (stat.isDirectory()) {
                assertNoSymlinks(source);
                for (const name of fs.readdirSync(source).sort()) visit(path.join(source, name));
                return;
            } else if (!stat.isFile()) {
                entry.status = 'skipped-non-file';
                entry.warnings.push('Not a regular file; ignored.');
            } else if (isProtected(path.basename(source), exclude)) {
                entry.status = 'skipped-protected';
                entry.warnings.push('Protected by AUTO_BACKUP_ prefix or --exclude; not read or changed.');
            } else {
                const filename = convertFilename(path.basename(source));
                if (!filename) {
                    entry.status = 'skipped-non-conversation';
                } else if (filename.duplicate) {
                    entry.status = 'skipped-duplicate';
                    entry.warnings.push('Duplicate (N) file: report only; no content or filename changes.');
                } else if (filename.skip) {
                    entry.status = 'skipped-non-conversation';
                    entry.warnings.push(filename.skip);
                } else {
                    if (path.basename(filename.target) !== filename.target || filename.target === '.' || filename.target === '..') {
                        throw new Error(`Converter returned an unsafe filename: ${filename.target}`);
                    }
                    if (rename) entry.target = path.join(path.dirname(source), filename.target);
                    const original = readOriginal(source);
                    if (!isUtf8(original.bytes)) throw new Error('Source is not valid UTF-8; left untouched.');
                    const converted = convertMarkdown(original.bytes.toString('utf8'), filename.code);
                    entry.changes.push(...converted.changes);
                    entry.warnings.push(...converted.warnings);
                    const contentChanged = converted.content !== original.bytes.toString('utf8');
                    const nameChanged = entry.target !== source;
                    if (nameChanged) entry.changes.push(`Rename: ${path.basename(source)} -> ${path.basename(entry.target)}`);
                    entry.status = contentChanged || nameChanged ? 'planned' : 'unchanged';
                    plans.push({ entry, original, content: converted.content, contentChanged, nameChanged });
                }
            }
        } catch (error) {
            recordError(entry, error);
        }
        report.entries.push(entry);
    }
    visit(sourceRoot);

    // Resolve every planned name before any mutation; all competing files skip.
    const targets = new Map();
    for (const plan of plans) {
        const key = pathKey(plan.entry.target);
        if (!targets.has(key)) targets.set(key, []);
        targets.get(key).push(plan);
    }
    for (const contenders of targets.values()) {
        if (contenders.length < 2) continue;
        for (const { entry } of contenders) {
            entry.status = 'skipped-collision';
            entry.warnings.push(`Planned case-insensitive target collision: ${entry.target}`);
        }
    }
    for (const plan of plans) {
        const { entry, nameChanged } = plan;
        if (entry.status !== 'planned' || !nameChanged) continue;
        try {
            assertNameAvailable(entry.target);
        } catch (error) {
            if (error.message.startsWith('Destination already exists')) {
                entry.status = 'skipped-collision';
                entry.warnings.push(error.message);
            } else {
                recordError(entry, error);
            }
        }
    }
    if (!apply) return report;

    // Preflight all backups as well, so an existing backup never gets overwritten.
    const backups = new Map();
    for (const plan of plans) {
        if (plan.entry.status !== 'planned') continue;
        plan.backup = path.join(backupRoot, path.relative(relativeRoot, plan.entry.source));
        const key = pathKey(plan.backup);
        if (!backups.has(key)) backups.set(key, []);
        backups.get(key).push(plan);
    }
    for (const contenders of backups.values()) {
        if (contenders.length < 2) continue;
        for (const { entry } of contenders) recordError(entry, new Error('Case-insensitive planned backup collision'));
    }
    for (const plan of plans) {
        const { entry, original, content, contentChanged, nameChanged, backup } = plan;
        if (entry.status !== 'planned') continue;
        let descriptor;
        let current = entry.source;
        let backupWritten = false;
        try {
            assertNoSymlinks(entry.source);
            descriptor = fs.openSync(entry.source, (contentChanged ? fs.constants.O_RDWR : fs.constants.O_RDONLY) | NO_FOLLOW);
            assertUnchanged(descriptor, entry.source, original);
            if (nameChanged) assertNameAvailable(entry.target);
            if (pathKey(backup) === pathKey(entry.source) || pathKey(backup) === pathKey(entry.target)) throw new Error(`Backup aliases source or target: ${backup}`);
            ensureBackupDirectory(path.dirname(backup));
            assertNameAvailable(backup);
            const backupDescriptor = fs.openSync(backup, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | NO_FOLLOW, original.stat.mode & 0o777);
            try {
                writeBytes(backupDescriptor, original.bytes);
            } finally {
                fs.closeSync(backupDescriptor);
            }
            backupWritten = true;
            assertUnchanged(descriptor, entry.source, original);
            if (nameChanged) {
                assertNameAvailable(entry.target);
                moveNoReplace(entry.source, entry.target);
                current = entry.target;
            }
            if (contentChanged) {
                assertUnchanged(descriptor, current, original);
                writeBytes(descriptor, Buffer.from(content, 'utf8'));
            }
            entry.status = 'applied';
        } catch (error) {
            recordError(entry, error);
            if (backupWritten) entry.warnings.push(`Original bytes retained in backup: ${backup}`);
            if (current !== entry.source) entry.warnings.push(`Filename was moved before the error; current path: ${current}`);
        } finally {
            if (descriptor !== undefined) {
                try {
                    fs.closeSync(descriptor);
                } catch (error) {
                    recordError(entry, error);
                }
            }
        }
    }
    return report;
}

function parseArgs(args) {
    const options = {};
    let positionalOnly = false;
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!positionalOnly && arg === '--') positionalOnly = true;
        else if (!positionalOnly && arg === '--apply') options.apply = true;
        else if (!positionalOnly && arg === '--rename') options.rename = true;
        else if (!positionalOnly && (arg === '--exclude' || arg.startsWith('--exclude='))) {
            const value = arg === '--exclude' ? args[++index] : arg.slice('--exclude='.length);
            if (!value || value.startsWith('--')) throw new Error('--exclude requires WORD[,WORD...]');
            options.exclude = [...(options.exclude || []), ...value.split(',').map(word => word.trim()).filter(Boolean)];
        }
        else if (!positionalOnly && (arg === '--help' || arg === '-h')) options.help = true;
        else if (!positionalOnly && arg === '--version') options.version = true;
        else if (!positionalOnly && (arg === '--backup-dir' || arg.startsWith('--backup-dir='))) {
            const value = arg === '--backup-dir' ? args[++index] : arg.slice('--backup-dir='.length);
            if (!value || value.startsWith('--')) throw new Error('--backup-dir requires PATH');
            if (options.backupDir !== undefined) throw new Error('--backup-dir may only be specified once');
            options.backupDir = value;
        } else if (!positionalOnly && arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
        else if (options.input !== undefined) throw new Error('Only one input file or directory may be specified');
        else options.input = arg;
    }
    return options;
}

module.exports = { runMigration };

if (require.main === module) {
    try {
        const options = parseArgs(process.argv.slice(2));
        if (options.help) {
            console.log('Usage: node scripts/migrate-web-exports.js INPUT [--rename] [--exclude WORD[,WORD...]] [--apply --backup-dir PATH]\nDefault: dry-run, no writes. --rename plans name changes; --apply executes.\nFiles starting with AUTO_BACKUP_ or whose name contains an --exclude word are never read or changed.\nContent-only apply is portable; applying renames requires Windows.\n--help / --version do not scan or write files.');
        } else if (options.version) {
            console.log(VERSION);
        } else {
            const report = runMigration(options);
            console.log(report.apply ? 'APPLY: original bytes are backed up before each mutation.' : 'DRY-RUN: no files or directories were written.');
            for (const entry of report.entries) {
                console.log(`[${entry.status}] ${entry.source}${entry.target !== entry.source ? ` -> ${entry.target}` : ''}`);
                for (const change of entry.changes) console.log(`  change: ${change}`);
                for (const warning of entry.warnings) console.log(`  warning: ${warning}`);
            }
            if (report.errors.length) process.exitCode = 1;
        }
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        console.log(LINK_REMINDER);
    }
}
