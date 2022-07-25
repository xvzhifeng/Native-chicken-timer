// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { ipcRenderer } = require('electron')
const Timer = require('timer.js')

function startWork(timeValue) {
    console.log('startWork')
    let workTimer = new Timer({
        ontick: (ms) => {
            console.log('onclick')
            updateTime(ms)
        }, onend: () => {
            console.log('onend')
            notification()
        }
    })

    workTimer.start(timeValue)
}

function updateTime(ms) {
    console.log('ms', ms)
    const timerContainer = document.getElementById('timerContainer')
    const s = (ms / 1000).toFixed(0)
    const ss = s % 60
    const mm = (s / 60).toFixed(0)

    // timerContainer.innerText = `${mm.toString().padStart(2, 0)}: ${ss.toString().padStart(2, 0)}`
}

let  notifiF = async () => {
    const res = await new Promise((resolve, reject) => {
        const notification = new Notification('任务结束',{
            body: '是否开始休息'
        })
        notification.onclick = () => {
            console.log("click notification");
            resolve('rest');
        }
        notification.onclose = ()=>{
            resolve('work')
        }
    })
    return res
}

async function notification(ms) {
    // let res = await ipcRenderer.invoke('work-notification')
    let res = await notifiF()
    // 休息
    console.log(res)
    if (res === 'rest') {
        setTimeout(() => {
            alert('休息')
        }, 5 * 1000)
    } else if (res === 'work') {
        startWork(20)
    }
}

let start = (name, value) =>  {
    console.log(name, value);

}
// startWork(10)
