const Timer = require('timer.js')
// const { ipcRenderer } = require('electron')
let getClient = require(`${__dirname}/../lib/mysqlpool.js`);
let s_tool = require(`${__dirname}/../lib/data`)
let date = require(`${__dirname}/../lib/date`)
let client = null
let winprocess = [1,1]
// let status = [
//     {id:1, value:30, isStart:false, workTimer: null},
//     {id:2, value:300, isStart:false, workTimer: null}
// ]
let audio_rain = new Audio(`${__dirname}/../resource/data.mp3`);
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

function player(name) {
    var audio = new Audio(name);
    audio.play();
    let t3 = window.setInterval(()=>{
        audio.play();
    },audio.duration()*1000)
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
        var audio = new Audio(`${__dirname}/../resource/chicken.mp3`);
        audio.play();
    } else if (res === 'work') {
        // startWork(20)
        var audio = new Audio(`${__dirname}/../resource/chicken.mp3`);
        audio.play();
        console.log("close")
    }
}

let updateData = async (data) => {
    if (client == null) {
        client = await getClient()
    }
    let update_cmd = `update nct_timer
                        set remain_time = ${data.remain_time}, status = 3
                        where id = ${data.id}`
    let res = await client.awaitQuery(update_cmd)
    console.log(`update ${res}`)
}

let deleteData = async (index, id) => {
    document.getElementById(`exec-task-${id}`).remove()
    s_tool.status[index].status = 0;
    // s_tool.remove(id)
    if (client == null) {
        client = await getClient()
    }
    let update_cmd = `update nct_timer
                        set status = 2
                        where id = ${id}`
    let res = await client.awaitQuery(update_cmd)
    console.log(`'delete :' + ${res}`)
}

// 启动Task
let task_start = (id, value) => {
    console.log(s_tool.status)
    let is_run = false
    for (let i = 0; i < s_tool.status.length; i++) {
        if ((s_tool.status[i].remain_time == 0 || s_tool.status[i].remain_time == null ) && document.getElementById(`exec-task-${id}`)) {
            deleteData(i, s_tool.status[i].id);
        }
        if (s_tool.status[i].id == id) {
            if (s_tool.status[i].is_start == 1) {
                winprocess[1] -= s_tool.status[i].interval_time
                winprocess[0] -= s_tool.status[i].remain_time
                s_tool.status[i].workTimer.pause();
                console.log(`updateData`)
                updateData(s_tool.status[i])
                s_tool.status[i].is_start = 0;
            } else if (s_tool.status[i].workTimer != null) {
                winprocess[1] += s_tool.status[i].interval_time
                winprocess[0] += s_tool.status[i].remain_time
                s_tool.status[i].is_start = 1;
                s_tool.status[i].workTimer.start(s_tool.status[i].remain_time);
            } else {
                winprocess[1] += s_tool.status[i].interval_time
                winprocess[0] += s_tool.status[i].remain_time
                s_tool.status[i].is_start = 1;
                s_tool.status[i].workTimer = new Timer({
                    ontick: (timeValue) => {
                        audio_rain.play();
                        console.log('onclick')
                        winprocess[0]--;
                        updateTime(id, timeValue, i)
                        s_tool.status[i].remain_time = (timeValue / 1000).toFixed(0);
                        ipcRenderer.invoke("win-progress",{per:winprocess[0]+1/winprocess[1]})
                    }, onend: () => {
                        console.log('onend')
                        ipcRenderer.invoke("win-progress",{per:-1})
                        notification(id)
                        deleteData(i, id)
                    }
                });
                s_tool.status[i].workTimer.start(s_tool.status[i].remain_time);
            }
        }
        if(s_tool.status[i].is_start == 1) {
            is_run = true;
        }
    }
    if(!is_run) {
        audio_rain.pause()
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
        time.innerHTML = `${parseInt(data.remain_time / 60).toString().padStart(2, 0)} : ${(data.remain_time % 60)
            .toString().padStart(2, 0)} `
        progress[0].setAttribute("max", data.interval_time)
        progress[0].setAttribute("value", data.remain_time)
        console.log("该元素已经存在，无需添加")
    } else {
        let demo = document.getElementById("exec-task-demo");
        let demo1 = demo.cloneNode(true);
        demo1.setAttribute("id", `exec-task-${data.id}`)
        demo1.setAttribute("onclick", `task_start(${data.id}, ${data.remain_time})`)
        let div = demo1.getElementsByTagName("div")
        let name = div[0]
        let time = div[1]
        let progress = div[2].getElementsByTagName('progress')
        name.setAttribute("id", `exec-task-name-${data.id}`)
        name.innerHTML = data.task_name
        time.setAttribute("id", `exec-task-time-${data.id}`)
        time.innerHTML = `${parseInt(data.remain_time / 60).toString().padStart(2, 0)} : ${(data.remain_time % 60)
            .toString().padStart(2, 0)} `
        progress[0].setAttribute("id", `exec-task-progress-${data.id}`)
        progress[0].setAttribute("max", data.interval_time)
        progress[0].setAttribute("value", data.remain_time)
        document.getElementById("view-task").appendChild(demo1);
    }

    // demo1.onclick = task_start(id, value)
}

let init_client = async () => {
    if (client == null) {
        client = await getClient()
    }
}
let updateStatus = async () => {
    let select_cmd = `select * from nct_timer 
                    where status=1 and start_date <= '${date.formatDate(new Date(),date.ymr)}'
                    or status = 3
                    and start_date <= '${date.formatDate(new Date(),date.ymr)}'`
    // 执行数据库操作
    await init_client()
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
        // console.log('每隔1秒钟执行一次')
    }, 10000)
}

start()

module.exports.updateStatus = updateStatus