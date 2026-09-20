const { app, BrowserWindow, Menu, globalShortcut, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Отключаем лишнее верхнее меню File/Edit/View
Menu.setApplicationMenu(null);

let mainWindow;

// Настройка Pepper Flash
let pluginName;
switch (process.platform) {
  case 'win32':
    pluginName = process.arch === 'x64' ? 'pepflashplayer64.dll' : 'pepflashplayer32.dll';
    break;
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin';
    break;
  case 'linux':
    pluginName = 'libpepflashplayer.so';
    break;
}

if (pluginName) {
  app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, 'flash', pluginName));
  app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.371');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'xDand Launcher',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      plugins: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Замените ссылку ниже на URL вашего сервера/сайта игры
  const gameUrl = 'http://194.226.126.110/'; 
  mainWindow.loadURL(gameUrl);

  // Обработка ошибки загрузки страницы (если сервер оффлайн или нет интернета)
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <body style="background:%23222;color:%23fff;font-family:sans-serif;text-align:center;padding-top:15%;">
        <h2>Не удалось подключиться к серверу игры :(</h2>
        <p>Проверьте интернет-соединение или статус сервера.</p>
        <button onclick="location.reload()" style="padding:10px 20px;font-size:16px;cursor:pointer;">Попробовать снова (F5)</button>
      </body>
    `);
  });

  // Горячие клавиши для удобства игроков
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // F11 — Полный экран
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
    // F5 или Ctrl+R — Перезагрузка страницы
    if ((input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) && input.type === 'keyDown') {
      mainWindow.reload();
      event.preventDefault();
    }
    // Ctrl + F5 — Очистка кэша и перезагрузка
    if (input.control && input.key === 'F5' && input.type === 'keyDown') {
      mainWindow.webContents.session.clearCache().then(() => {
        mainWindow.reload();
      });
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Безопасная проверка обновлений (без крашей программы)
app.whenReady().then(() => {
  createWindow();

  autoUpdater.autoDownload = true;

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Обновление найдено',
      message: 'Найдена новая версия лаунчера! Она скачивается в фоне...'
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Обновление готово',
      message: 'Обновление загружено. Перезапустите лаунчер для применения.',
      buttons: ['Перезапустить сейчас', 'Позже']
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.log('Ошибка при проверке обновления (не критично):', err.message);
  });

  // Проверяем обновления через 3 секунды после запуска
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
