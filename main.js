const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    nativeTheme,
    shell,
	session
} = require('electron')

const {
    autoUpdater
} = require('electron-updater');
let updateAv = false;

const path = require('path');


let pluginName
switch (process.platform) {
  case 'win32':
    switch (process.arch) {
      case 'ia32':
          pluginName = 'flash/pepflashplayer32_32_0_0_371.dll'
          break
      case 'x32':
          pluginName = 'flash/pepflashplayer32_32_0_0_371.dll'
          break
      case 'x64':
          pluginName = 'flash/pepflashplayer64_32_0_0_371.dll'
          break
    }
    break
  case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin'
    break
  case 'linux':
    app.commandLine.appendSwitch('no-sandbox')
    pluginName = 'flash/libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

var win

app.on('ready', () => {
    createWindow();
})

//window creation function
function createWindow() {
    win = new BrowserWindow
    ({
    title: "XarLauncher",
    webPreferences: {
        plugins: true,
        nodeIntegration: false
    },
    width: 960,
    height: 540,
	icon: getIconPath()
    });
    makeMenu();
	
    const customUA = ` XarLauncher/${app.getVersion()}`;
    win.webContents.userAgent += customUA;
    win.loadURL('http://194.226.126.110/');
    autoUpdater.checkForUpdatesAndNotify();
    Menu.setApplicationMenu(fsmenu);
	
    win.on('closed', () => {
    	win = null;
    });
}

function getIconPath() {
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'icons', 'icon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.join(__dirname, 'icons', 'icon.icns');
  } else if (process.platform === 'linux') {
    iconPath = path.join(__dirname, 'icons', 'icon.png');
  }
  return iconPath;
}

// start of menubar part

const aboutMessage = `XarLauncher v${app.getVersion()}
Created by youngive with much code provided by Allinol for use with Xarium.`;

function makeMenu() { // credits to youngIve
    fsmenu = new Menu();
    if (process.platform == 'darwin') {
      fsmenu.append(new MenuItem({
        label: "XarLauncher",
        submenu: [
          {
            label: 'Меню',
            submenu: [
              {
                label: 'Главная',
                click: () => {
                  win.loadURL('https://xarium.cc');
                }
              },
              {
                label: 'Перезайти',
                click: () => {
                  win.reload();
                }
              }
            ]
          },
          {
            label: 'Очистить кэш и куки',
            click: () => {
              clearCache();
              clearCookies();
              win.reload();
            }
          },
          {
            label: 'Полный экран',
            click: () => {
              win.setFullScreen(!win.isFullScreen());
              win.webContents.send('fullscreen', win.isFullScreen());
            }
          }
        ]
      }));
    } else {
      fsmenu.append(new MenuItem({
        label: 'Меню',
        submenu: [
          {
            label: 'Главная',
            click: () => {
              win.loadURL('https://xarium.cc');
            }
          },
          {
            label: 'Перезайти',
            click: () => {
              win.reload();
            }
          }
        ]
      }));
      fsmenu.append(new MenuItem({
        label: 'Очистить кэш и куки',
        click: () => {
          clearCache();
          clearCookies();
          win.reload();
        }
      }));
      fsmenu.append(new MenuItem({
        label: 'Полный экран',
        click: () => {
          win.setFullScreen(!win.isFullScreen());
          win.webContents.send('fullscreen', win.isFullScreen());
        }
      }));
    }
}

function clearCache() {
    windows = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearCache(() => {});
}

function clearCookies() {
  const ses = session.defaultSession;
  ses.clearStorageData({
    storages: ['cookies']
  }, () => {
    //console.log('Куки успешно очищены.');
  });
}

// end of menubar

//Auto update part

autoUpdater.on('update-available', (updateInfo) => {
switch (process.platform) {
  case 'win32':
    dialog.showMessageBox({
      type: "info",
      buttons: ["Ок"],
      title: "Доступно обновление",
      message: "Доступна новая версия (v" + updateInfo.version + "). Она будет установлена после закрытия приложения."
    });
    break;
  case 'darwin':
    dialog.showMessageBox({
      type: "info",
      buttons: ["Ок"],
      title: "Доступно обновление",
      message: "Доступна новая версия (v" + updateInfo.version + "). Пожалуйста, установите ее вручную с веб-сайта."
    });
    break;
  case 'linux':
    dialog.showMessageBox({
      type: "info",
      buttons: ["Ок"],
      title: "Доступно обновление",
      message: "Доступна новая версия (v" + updateInfo.version + "). Автообновление не было протестировано в этой операционной системе, поэтому если после перезапуска прилолжения это сообщение снова появится, пожалуйста, установите обновление вручную."
    });
    break;
}
    //win.webContents.send('update_available', updateInfo.version);
});

autoUpdater.on('update-downloaded', () => {
    updateAv = true;
});

app.on('window-all-closed', () => {
	if (updateAv) {
		autoUpdater.quitAndInstall();
	}
	else
	{
		if (process.platform !== 'darwin') {
			app.quit();
		}
	}
});

app.on('activate', () => {
  if (win === null) {
	  createWindow();
  }
});


