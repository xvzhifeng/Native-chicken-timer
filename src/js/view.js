const Timer = require('timer.js')
const { ipcRenderer } = require('electron')


let status = [
    {id:1, value:30, isStart:false, workTimer: null},
    {id:2, value:300, isStart:false, workTimer: null}
]

function progress_load(n){
    if (n==0) {alert("下载完成")};
    var progress=document.getElementById("progress");
    n=n-1;
    task=100-n;
    progress.value=task;
    setTimeout("load("+n+")",100);
}


function startWork(id, timeValue) {
    console.log('startWork')
    let workTimer = new Timer({
        ontick: (timeValue) => {
            console.log('onclick')
            updateTime(id, timeValue)
        }, onend: () => {
            console.log('onend')
            notification(id)
        }
    })

    workTimer.start(timeValue)
}

function updateProgress(id, value) {
    console.log(value)
    const progress = document.getElementById(`exec-task-progress-${id}`)
    progress.value=value;
}

function initProgress(id, value) {
    console.log(id)
    const progress = document.getElementById(`exec-task-progress-${id}`)
    console.log(progress.max)
    if(progress.max == 123.321) {
        console.log("init");
        progress.max = value
    }
}

function updateTime(id, ms, index) {
    console.log(id)
    console.log('ms', ms)
    const timerContainer = document.getElementById(`time-${id}`)
    const s = (ms / 1000).toFixed(0)
    const ss = s % 60
    const mm = (s / 60).toFixed(0)
    updateProgress(id, s)
    timerContainer.innerText = `${mm.toString().padStart(2, 0)}: ${ss.toString().padStart(2, 0)}`
}

let  notifiF = async () => {
    const res = await new Promise((resolve, reject) => {
        const notification = new Notification(`任务${id}结束`,{
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

async function notification(id) {
    // let res = await ipcRenderer.invoke('work-notification')
    let res = await notifiF(id)
    // 休息
    console.log(res)
    if (res === 'rest') {
        setTimeout(() => {
            alert('休息')
        }, 5 * 1000)
    } else if (res === 'work') {
        // startWork(20)
        console.log("click")
    }
}



// 启动Task
let task_start = (id, value) => {
    console.log(status)
    for(let i=0;i<status.length;i++) {
        if(status[i].id == id) {
            initProgress(id, status[i].value);
            if(status[i].isStart) {
                status[i].workTimer.pause();
                status[i].isStart = false;
            } else if (status[i].workTimer != null) {
                status[i].isStart = true;
                status[i].workTimer.start(status[i].value);
            } else {
                status[i].isStart = true;
                status[i].workTimer = new Timer({
                    ontick: (timeValue) => {
                        console.log('onclick')
                        updateTime(id, timeValue, i)
                        status[i].value = (timeValue / 1000).toFixed(0);
                    }, onend: () => {
                        console.log('onend')
                        notification(id)
                    }
                });
                status[i].workTimer.start(status[i].value);
            }
        }
    }
    // startWork(id,value)
}

// let start = () => {
//     var t2 = window.setInterval(function() {
//         // 执行数据库操作
//         console.log('每隔1秒钟执行一次')
//         },1000)
// }
// start()