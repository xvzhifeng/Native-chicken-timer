// const Timer = require('timer.js')
// const { ipcRenderer } = require('electron')
let getClient = require('../lib/mysqlpool.js') ;

let client = null
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
    const timerContainer = document.getElementById(`exec-task-time-${id}`)
    const s = (ms / 1000).toFixed(0)
    const ss = s % 60
    const mm = (s / 60).toFixed(0)
    updateProgress(id, s)
    timerContainer.innerText = `${mm.toString().padStart(2, 0)}: ${ss.toString().padStart(2, 0)}`
}

let  notifiF = async (id) => {
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

let generateTaskView = (id, value) => {
    let demo = document.getElementById("exec-task-demo");
    let demo1 = demo.cloneNode(true);
    demo1.setAttribute("id", `exec-task-${id}`)
    demo1.setAttribute("onclick",`task_start(${id}, ${value})`)
    let div = demo1.getElementsByTagName("div")
    let name = div[0]
    let time = div[1]
    let progress = div[2]
    name.setAttribute("id",`exec-task-name-${id}`)
    time.setAttribute("id",`exec-task-time-${id}`)
    progress.setAttribute("id",`exec-task-progress-${id}`)
    document.getElementById("view-task").appendChild(demo1);
    // demo1.onclick = task_start(id, value)
}

let start = async () => {
    if(client == null) {
        client = await getClient()
    }
    
    var t2 = window.setInterval( async function() {
        let select_cmd = `select * from nct_timer where status=1`
        // 执行数据库操作
        let result = await client.awaitQuery(select_cmd)
        for(let i =0;i<result.length;i++) {
            console.log(result[i].id)
            generateTaskView(result[i].id, result[i].interval_time)
        }
        console.log(result)
        console.log('每隔1秒钟执行一次')
        },100000)
}
start()