// const Timer = require('timer.js')
// const { ipcRenderer } = require('electron')
let getClient = require('../lib/mysqlpool.js');
let s_tool = require('../lib/data')
let client = null
// let status = [
//     {id:1, value:30, isStart:false, workTimer: null},
//     {id:2, value:300, isStart:false, workTimer: null}
// ]

function progress_load(n) {
    if (n == 0) { alert("下载完成") };
    var progress = document.getElementById("progress");
    n = n - 1;
    task = 100 - n;
    progress.value = task;
    setTimeout("load(" + n + ")", 100);
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
    console.log("id " + value)
    const progress = document.getElementById(`exec-task-progress-${id}`)
    progress.value = value;
}

function initProgress(id, value) {
    console.log(id)
    const progress = document.getElementById(`exec-task-progress-${id}`)
    console.log(progress.max)
    if (progress.max == 123.321) {
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
    const mm = parseInt(s / 60)
    updateProgress(id, s)
    timerContainer.innerText = `${mm.toString().padStart(2, 0)}: ${ss.toString().padStart(2, 0)}`
}

let notifiF = async (id) => {
    const res = await new Promise((resolve, reject) => {
        const notification = new Notification(`任务${id}结束`, {
            body: '是否开始休息'
        })
        notification.onclick = () => {
            console.log("click notification");
            resolve('rest');
        }
        notification.onclose = () => {
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

let updateData = async (data) => {
    if (client == null) {
        client = await getClient()
    }
    let update_cmd = `update nct_timer
                        set remaninder_time = ${data.remaninder_time}
                        where id = ${data.id}`
    let res = await client.awaitQuery(update_cmd)
    console.log(`update ${res}`)
}

let deleteData = async (id) => {
    document.getElementById(`exec-task-${id}`).remove()
    s_tool.remove(id)
    if (client == null) {
        client = await getClient()
    }
    let update_cmd = `update nct_timer
                        set status = 0
                        where id = ${id}`
    let res = await client.awaitQuery(update_cmd)
    console.log(`'delete :' + ${res}`)
}

// 启动Task
let task_start = (id, value) => {
    console.log(s_tool.status)
    for (let i = 0; i < s_tool.status.length; i++) {
        if (s_tool.status[i].id == id) {
            if (s_tool.status[i].isStart) {
                s_tool.status[i].workTimer.pause();
                console.log(`updateData`)
                updateData(s_tool.status[i])
                s_tool.status[i].isStart = false;
            } else if (s_tool.status[i].workTimer != null) {
                s_tool.status[i].isStart = true;
                s_tool.status[i].workTimer.start(s_tool.status[i].remaninder_time);
            } else {
                s_tool.status[i].isStart = true;
                s_tool.status[i].workTimer = new Timer({
                    ontick: (timeValue) => {
                        console.log('onclick')
                        updateTime(id, timeValue, i)
                        s_tool.status[i].remaninder_time = (timeValue / 1000).toFixed(0);
                    }, onend: () => {
                        console.log('onend')
                        notification(id)
                        deleteData(id)
                    }
                });
                s_tool.status[i].workTimer.start(s_tool.status[i].remaninder_time);
            }
        }
    }
    // startWork(id,value)
}

let generateTaskView = (data) => {
    if (document.getElementById(`exec-task-${data.id}`)) {
        let demo1 = document.getElementById(`exec-task-${data.id}`);
        let div = demo1.getElementsByTagName("div")
        let name = div[0]
        let time = div[1]
        let progress = div[2].getElementsByTagName('progress')
        name.setAttribute("id", `exec-task-name-${data.id}`)
        name.innerHTML = data.task_name
        time.setAttribute("id", `exec-task-time-${data.id}`)
        time.innerHTML = `${parseInt(data.remaninder_time / 60).toString().padStart(2, 0)} : ${(data.remaninder_time % 60)
            .toString().padStart(2, 0)} `
        progress[0].setAttribute("max", data.interval_time)
        progress[0].setAttribute("value", data.remaninder_time)
        console.log("该元素已经存在，无需添加")
    } else {
        let demo = document.getElementById("exec-task-demo");
        let demo1 = demo.cloneNode(true);
        demo1.setAttribute("id", `exec-task-${data.id}`)
        demo1.setAttribute("onclick", `task_start(${data.id}, ${data.remaninder_time})`)
        let div = demo1.getElementsByTagName("div")
        let name = div[0]
        let time = div[1]
        let progress = div[2].getElementsByTagName('progress')
        name.setAttribute("id", `exec-task-name-${data.id}`)
        name.innerHTML = data.task_name
        time.setAttribute("id", `exec-task-time-${data.id}`)
        time.innerHTML = `${parseInt(data.remaninder_time / 60).toString().padStart(2, 0)} : ${(data.remaninder_time % 60)
            .toString().padStart(2, 0)} `
        progress[0].setAttribute("id", `exec-task-progress-${data.id}`)
        progress[0].setAttribute("max", data.interval_time)
        progress[0].setAttribute("value", data.remaninder_time)
        document.getElementById("view-task").appendChild(demo1);
    }

    // demo1.onclick = task_start(id, value)
}

let updateStatus = async () => {
    let select_cmd = `select * from nct_timer where status=1`
    // 执行数据库操作
    let result = await client.awaitQuery(select_cmd)
    s_tool.update(result)
    console.log(s_tool.set_process)
    if (s_tool.get_is_change()) {
        for (let i = 0; i < s_tool.status.length; i++) {
            console.log(s_tool.status[i].id)
            if (s_tool.is_change.has(s_tool.status[i].id)) {
                generateTaskView(s_tool.status[i])
                s_tool.set_is_change(s_tool.status[i].id)
            }
        }
        s_tool.set_is_change(false)
        console.log(s_tool.is_change)
    }
    console.log(s_tool.status)
}

let start = async () => {
    if (client == null) {
        client = await getClient()
    }

    var t2 = window.setInterval(async function () {
        // let select_cmd = `select * from nct_timer where status=1`
        // // 执行数据库操作
        // let result = await client.awaitQuery(select_cmd)
        // for(let i =0;i<result.length;i++) {
        //     console.log(result[i].id)
        //     generateTaskView(result[i].id, result[i].interval_time)
        // }

        updateStatus()
        // console.log(result)
        console.log('每隔1秒钟执行一次')
    }, 10000)
}
start()