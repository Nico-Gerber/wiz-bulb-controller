const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const getPort = require('get-port').default;

let backendPort;

let mainWindow;
let pyProc = null;

const waitOn = require('wait-on');

ipcMain.on('macros-changed', () => {
    console.log('Macros changed — re-registering');
    registerMacros();
});


async function registerMacros() {
    globalShortcut.unregisterAll();

    try {
        const res = await fetch(`http://127.0.0.1:${backendPort}/macros/get`);
        const data = await res.json();

        console.log('macros response:', JSON.stringify(data));

        for (const macro of data.macros) {

            let key = macro.key

            if (macro.key.length === 1) {

                key.toUpperCase()

            }

            if (macro.key === 'Help') {
                key = "Insert"
            }

            const shortcut = `Alt+Shift+${key}`;


            const ok = globalShortcut.register(shortcut, () => {
                fireMacro(macro);
            });
            console.log(`Registered ${shortcut} (${macro.action} ${macro.target_type}):`, ok);
        }
    } catch (err) {
        console.error('Failed to register macros:', err);
    }
}

async function fireMacro(macro) {
    let endpoint, body = {};

    if (macro.target_type === 'all') {
        endpoint = macro.action === 'on' ? '/bulb/turn_all_on' : '/bulb/turn_off_all';
    } else if (macro.target_type === 'group') {
        endpoint = macro.action === 'on' ? '/bulb/turn_group_on' : '/bulb/turn_group_off';
        body = { group_id: parseInt(macro.target_id) };
    } else if (macro.target_type === 'bulb') {
        endpoint = macro.action === 'on' ? '/bulb/on_with_mac' : '/bulb/off_with_mac';
        body = { mac: macro.target_id };
    }

    try {
        await fetch(`http://127.0.0.1:${backendPort}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        console.log(`Fired: ${macro.action} ${macro.target_type} ${macro.target_id ?? ''}`);
        if (mainWindow) mainWindow.webContents.send('bulbs-changed');
    } catch (err) {
        console.error('Macro fire failed:', err);
    }
}


async function startBackend() {
    backendPort = await getPort();

    const uvicornPath = path.join(
        __dirname,
        '..',
        'backend',
        'venv',
        'bin',
        'uvicorn'
    );

    const backendDir = path.join(__dirname, '..', 'backend');

    pyProc = spawn(
        uvicornPath,
        [
            'main:app',
            '--host',
            '127.0.0.1',
            '--port',
            backendPort.toString()
        ],
        {
            cwd: backendDir,
        }
    );

    pyProc.stdout.on('data', data => {
        console.log(`[backend] ${data}`);
    });

    pyProc.stderr.on('data', data => {
        console.error(`[backend] ${data}`);
    });

    pyProc.on('close', code => {
        console.log(`Backend exited with code ${code}`);
    });


}

ipcMain.handle('get-backend-port', () => backendPort);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });
    mainWindow.loadURL('http://localhost:5173');

    mainWindow.webContents.openDevTools();
}



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (pyProc) pyProc.kill();
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });




    app.whenReady().then(async () => {
        await startBackend();

        console.log(`Waiting for http://127.0.0.1:${backendPort}/find/saved`);

        try {
            await waitOn({
                resources: [`http://127.0.0.1:${backendPort}/find/saved`],
                timeout: 15000,
            });

            console.log("Backend is ready!");
        } catch (err) {
            console.error("Backend did not start in time:", err);
        }

        createWindow();
        await registerMacros();
    });




}