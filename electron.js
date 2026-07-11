const { app, BrowserWindow } = require('electron');
const path = require('path');

// تعطيل تسريع الرسوميات (GPU) — يصلح مشكل تجميد الكيبورد على بعض أجهزة Windows
app.disableHardwareAcceleration();

// تعطيل Native Window Occlusion Tracking (سبب معروف آخر لنفس المشكل)
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

let mainWindow;

function createWindow() {
  process.env.ACADEMY_DB_PATH = path.join(app.getPath('userData'), 'academy.db');
  require('./server');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});