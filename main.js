// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Notification, Menu } = require('electron')
let db = require(`${__dirname}/src/lib/initDatabase`)
const path = require('path')
require('update-electron-app')()

let mainWindow
// 01、创建一个窗口
// 02：让窗口加载一个界面，这个界面用web 技术实现，这个界面运行在渲染进程中
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // 监听右键事件
  ipcMain.handle('contextmenu', () => {
    contextmenu.popup(BrowserWindow.getFocusedWindow());
  });
  ipcMain.handle('ContextTask', ()=> {
    ContextTask.popup(BrowserWindow.getFocusedWindow())
  })
  handleIPC(mainWindow)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// 右键菜单
let menuContextTemplate = [
  {
    label: "复制",
    role: "copy",
    click: () => {
      console.log("复制");
    }
  },
  {
    label: "粘贴",
    role: "paste",
    click: () => {
      console.log("粘贴");
    }
  },
  {
    type: "separator",
  },
  {
    label: "初始化数据库",
    click: () => {
      db.init()
      console.log("初始化数据库");
    }
  },
  {
    label: "声音",
    submenu: [
      {
        label: "关闭",
        click: () => {
          mainWindow.webContents.send('close_volume', { 'is': false })
          console.log("关闭声音");
        }
      },
      {
        label: "开启",
        click: () => {
          mainWindow.webContents.send('close_volume', { 'is': true })
          console.log("开启声音");
        }

      }
    ]

  },
  // 也可以定义子菜单哦
  {
    label: "文件",
    // 二级菜单
    submenu: [
      {
        label: "新建",
        // 给菜单绑定点击事件
        click: () => {
          console.log("Ctrl + N");
        },
        // 给菜单绑定快捷键，可能有一些快捷键是电脑自带的快捷键，设置了可能不行 比如 ctrl + c
        accelerator: "ctrl+n"
      },
      {
        label: "打开"
      },
      // 使用分隔符不同label之间有一条横线
      {
        type: "separator"
      },
      {
        label: "保存"
      }
    ]
  },
  {
    label: "调试",
    accelerator: "ctrl+shift+l",
    click: () => {
      console.log("调试");
    }
  }
];

// 任务菜单
let menuContextTask = [
  {
    label: "编辑",
    click: () => {
      console.log("编辑");
    }
  }, {
    label: "复制",
    click: () => {
      console.log("复制");
    }
  }
];

// 用于构建MenuItem
let contextmenu = Menu.buildFromTemplate(menuContextTemplate);

let ContextTask = Menu.buildFromTemplate(menuContextTask)


function handleIPC(win) {
  ipcMain.handle('work-notification', async function () {
    const res = await new Promise((resolve, reject) => {
      const notification = new Notification({
        title: '任务结束',
        body: '是否开始休息',
        actions: [{ text: '开始休息', type: 'button' }],
        closeButtonText: '继续工作',
      }).onclick = () => {
        console.log("click notification");
      }

      notification.show()
      notification.on('actions', () => {
        resolve('rest')
      })
      notification.on('close', () => {
        resolve('work')
      })
    })
    return res
  })

  ipcMain.handle('win-progress', (envent, data) => {
    console.log(data)
    win.setProgressBar(data.per)
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
// const { app, BrowserWindow, ipcMain, Notification, Menu } = require('electron')
// let db = require(`${__dirname}/../lib/initDatabase`)

