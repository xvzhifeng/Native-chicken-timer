
let data = require(`${__dirname}/../lib/data`)
let view = require(`${__dirname}/../js/view`)
// let getClient = require('../lib/mysqlpool.js');
// let client = null


let addData = async () => {
    let task_name = document.getElementById("add_task_name")
    let task_time = document.getElementById("add_task_time")
    let task_date = document.getElementById("add_task_date")
    cmd = `insert into nct_timer(task_name,interval_time,remain_time,start_date)
            values('${task_name.value}',${parseInt(task_time.value)},${parseInt(task_time.value)},'${task_date.value}')`

    console.log(`add : {'${task_name.value}', ${task_time.value}}, cmd ${cmd}`)
    if (data.client.length == 0) {
        await data.get_client()
    }
    let res = await data.client[0].awaitQuery(cmd)

    view.updateStatus()
}

function formatDate(date, format) {
    const map = {
        mm: (date.getMonth() + 1).toString().padStart(2, 0),
        dd: date.getDate().toString().padStart(2, 0),
        yy: date.getFullYear().toString().slice(-2),
        yyyy: date.getFullYear()
    }
    return format.replace(/mm|dd|yyyy|yy/gi, matched => map[matched])
}

let init = () => {
    let date = new Date()
    let min = formatDate(date, "yyyy-mm-dd")
    let max = formatDate(new Date(new Date().getTime()+2592000000), "yyyy-mm-dd")
    console.log(max)
    // let min = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
    let task_date = document.getElementById("add_task_date")
    task_date.setAttribute("min", min)
    task_date.setAttribute("max", max)
    task_date.setAttribute("value", min)
}

init()

