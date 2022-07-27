// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { ipcRenderer } = require('electron')
// const Timer = require('timer.js')
let datas = require(`${__dirname}/../lib/data`)
let menu = ['main', 'add', 'view', 'about','edit']
let date_tool = require(`${__dirname}/../lib/date`)
let is_loading = true
function change(id) {
    console.log("change");
    for (let i = 0; i < menu.length; i++) {
        if (menu[i] != id) {
            document.getElementById(menu[i]).style.display = "none";
            document.getElementById(`a-${menu[i]}`).removeAttribute("class");
        } else {
            document.getElementById(menu[i]).style.display = "block";
            document.getElementById(`a-${menu[i]}`).setAttribute("class", "active");
        }
    }
}

let generateTaskShow = (data) => {
    if (document.getElementById(`show-task-${data.id}`)) {
        let demo1 = document.getElementById(`show-task-${data.id}`);
        // let demo1 = demo.cloneNode(true);
        // demo1.setAttribute("id", `show-task-${data.id}`)
        // demo1.setAttribute("onclick", `task_start(${data.id}, ${data.remain_time})`)
        demo1.setAttribute("class", `TaskItem-${data.status}`)
        let div1 = demo1.getElementsByTagName("div")
        let div = div1[0].getElementsByTagName("div")
        let name = div[0]
        let time = div[1]
        let date = div[2]
        name.setAttribute("id", `show-task-name-${data.id}`)
        name.innerHTML = data.task_name
        time.setAttribute("id", `show-task-time-${data.id}`)
        time.innerHTML = `${parseInt(data.remain_time / 60).toString().padStart(2, 0)} : ${(data.remain_time % 60)
            .toString().padStart(2, 0)} `
        data.start_date == null ? date.innerHTML = '未知' : date.innerHTML = date_tool.formatDate(data.start_date, date_tool.ymr)
        document.getElementById(`show-task-staus-${data.status}`).appendChild(demo1)
        // console.log("main - 该元素已经存在，无需添加")
    } else {
        let demo = document.getElementById("show-task-demo");
        let demo1 = demo.cloneNode(true);
        demo1.setAttribute("id", `show-task-${data.id}`)
        demo1.setAttribute("onclick", `toEdit(${data.id},'${data.task_name}','${data.interval_time}','${date_tool.formatDate(data.start_date,date_tool.ymr)}')`)
        demo1.setAttribute("class", `TaskItem-${data.status}`)
        let div1 = demo1.getElementsByTagName("div")
        let div = div1[0].getElementsByTagName("div")
        let name = div[0]
        let time = div[1]
        let date = div[2]
        name.setAttribute("id", `show-task-name-${data.id}`)
        name.innerHTML = data.task_name
        time.setAttribute("id", `show-task-time-${data.id}`)
        time.innerHTML = `${parseInt(data.remain_time / 60).toString().padStart(2, 0)} : ${(data.remain_time % 60)
            .toString().padStart(2, 0)} `
        data.start_date == null ? date.innerHTML = '未知' : date.innerHTML = date_tool.formatDate(data.start_date, date_tool.ymr)
        document.getElementById(`show-task-staus-${data.status}`).appendChild(demo1)
    }

    // demo1.onclick = task_start(id, value)
}

module.exports.load_task = load_task
async function load_task() {
    cmd = `select * from nct_timer`

    // console.log(`add : {'${task_name.value}', ${task_time.value}}, cmd ${cmd}`)
    if (datas.client.length == 0) {
        await datas.get_client()
    }
    let res = await datas.client[0].awaitQuery(cmd)
    for (let i = 0; i < res.length; i++) {
        // console.log(res[i])
        generateTaskShow(res[i])
    }
}

let load_main_timer = async () => {
    let t1 = window.setInterval(() => {
        date_tool.startTime()
    }, 1000);
    var t2 = window.setInterval(async function () {
        load_task()
        if (is_loading) {
            document.getElementById("loading").style.display = "none"
            is_loading = false
            document.getElementById("loading_success").style.display = "block"
        }
    }, 10000)
}


load_main_timer()

// let start = (name, value) =>  {
//     console.log(name, value);

// }
// startWork(10)

// window.onload = () => {
//     console.log("右键菜单");
//     // 监听鼠标右键的点击事件
//     window.addEventListener("contextmenu", (e) => {
//         console.log("鼠标点击了右键");

//         // 阻止默认事件
//         e.preventDefault();

//         // 调用popup方法弹出菜单
//         ipcRenderer.send('menuBuilder');
//     }, false);
// }
// const { ipcRenderer } = require('electron')



document.addEventListener('contextmenu', function (e) {
    console.log("鼠标点击了右键");
    // 右键事件触发
    e.preventDefault();

    ipcRenderer.invoke('contextmenu');
})

// 拖拽事件

function allowDrop(ev) {
    ev.preventDefault();
}

let drag = (ev) => {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("Text");
    // ev.target.appendChild(document.getElementById(data));
    console.log(`${data} => ${ev.target.id}`)
    aTob(data, ev.target.id.replace(/[^\d]/g, ''))
}

async function aTob(a, status) {
    if (datas.client.length == 0) {
        await datas.get_client()
    }

    let demo = document.getElementById(a)
    demo.setAttribute("class", `TaskItem-${status}`)
    document.getElementById(`show-task-staus-${status}`).appendChild(demo)
    let cmd = `update nct_timer set status = ${status}
                where id = ${a.replace(/[^\d]/g, '')}`
    let res = await datas.client[0].awaitQuery(cmd)
    console.log(res)
}

async function drop_delete(ev) {
    if (datas.client.length == 0) {
        await datas.get_client()
    }
    ev.preventDefault();
    var data = ev.dataTransfer.getData("Text");
    console.log(data)
    document.getElementById(data).remove()
    let cmd = `update nct_timer set status = ${5}
                where id = ${data.replace(/[^\d]/g, '')}`
    let res = await datas.client[0].awaitQuery(cmd)
    console.log(`${cmd} ====> \n  execute`)
}

module.exports.change = change