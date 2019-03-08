var electron  = require('electron');
var os = require("os");
const {app} = electron;
const {BrowserWindow} = electron;
const ipcMain = electron.ipcMain;
const nativeImage = electron.nativeImage;

const globalShortcut = electron.globalShortcut

let loginWin;
let win;
var  marketInterval;

// 读取配置文件tgwConfig.json，并检查是否存在tgwlog目录
var fs = require("fs");
fs.access("log", fs.constants.F_OK, (err) => {
	if (err) {
		fs.mkdir("log", function(mkdirErr){
			if (mkdirErr) {
				console.log(mkdirErr);
				return;
			}
		});
		return ;
	}

});


var ipcapi = require('./ipcapi/ipcapi.js');
ipcapi.init();

var userModel = require('./ipcapi/usermodel.js');
userModel.init();

function createWindow() {
	var loginOption = {
		width		: 470
		,height     : 550
		// ,transparent: true
		,resizable  : false
		,hasShadow	: true
		,frame		: false
		,show       : false
	};
	if (os.platform() == "linux") {
		loginOption.icon = `${__dirname}/app.png`;
	}
	if (os.platform() == "win32") {
		loginOption.icon = nativeImage.createFromPath('app.ico');
	}
	loginWin = new BrowserWindow(loginOption);
	ipcapi.setWindowObject(loginWin);
	loginWin.loadURL(`file://${__dirname}/login-dialog/login.html`);
	// loginWin.webContents.openDevTools();//调试工具开启
	loginWin.on('close',() => {
        loginWin = null;
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (loginWin === null) {
        createWindow()
    }
});

//登录成功
function loginSuccess() {
	var option = {
		width		: 1286
		,height     : 648
		,minWidth  : 1286
		,minHeight : 648
		// ,transparent: true
		,resizable  : true
		,hasShadow	: true
		,frame		: false
		,show       : false
	};
	if (os.platform() == "linux") {
		option.icon = `${__dirname}/app.png`;
	}
	if (os.platform() == "win32") {
		option.icon = nativeImage.createFromPath('app.ico');
	}
	win = new BrowserWindow(option);
	ipcapi.setWindowObject(win);
	win.loadURL(`file://${__dirname}/mvc/mainwindow/index.html`);
	win.on('close',() => {
		ipcapi.setWindowObject(null);
        win = null;
    });

  win.on("maximize", () => {
		if (!win.webContents.isDestroyed()) {
			win.webContents.send("window-maximize");
		}
	});
	win.on("unmaximize", () => {
		if (!win.webContents.isDestroyed()) {
			win.webContents.send("window-unmaximize");
		}
	});
	// win.webContents.openDevTools();//调试工具开启
	// globalShortcut.register('CommandOrControl+R', function () {
	// 	win.reload();
	// })
}

ipcMain.on('close-login-window',function() {
	if (loginWin != null) {
		loginWin.close();
	}
})
ipcMain.on('mini-login-window',function() {
    loginWin.minimize();
})
ipcMain.on('show-login-window',function() {
    loginWin.show();
})
ipcMain.on('login-success',function() {
    loginSuccess();
	loginWin.close();
})

ipcMain.on('relogin',function() {
	createWindow();
	userModel.resetLoginInfo();
	win.close();
})

ipcMain.on('close-main-window',function() {
    win.close();
})
ipcMain.on('max-main-window',function() {
    win.maximize();
	// win.setResizable(false);
	// win.setMovable(false);
})
ipcMain.on('back-main-window',function() {
	// win.setResizable(true);
	// win.setMovable(true);
    win.unmaximize();
})
ipcMain.on('mini-main-window',function() {
    win.minimize();
})
ipcMain.on('show-main-window',function() {
	win.show();
})

ipcMain.on('relaunch', function() {
	app.relaunch();
	win.close();
})
