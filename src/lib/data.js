let getClient = require('./mysqlpool')
let date_tool = require('./date')
let client = []
let is_change = new Set()

let status = [
    // { id: 1, task_name: "t1", interval_time: 30, remain_time: 30, isStart: false, workTimer: null },
    // { id: 2, task_name: "t2", interval_time: 300, remain_time: 300, isStart: false, workTimer: null }
]

let all_task = []
let set_process = new Set()

let update_task = (result) => {
    all_task = result;
}


// date_tool.formatDate(status[j].start_date,date_tool.ymr) != date_tool.formatDate(result[i].start_date),date_tool.ymr)
let update = (result) => {
    let database_set = new Set()
    for (let i = 0; i < result.length; i++) {
        if (!set_process.has(result[i].id)) {
            status.push({ ...result[i], workTimer: null })
            set_process.add(result[i].id)
            is_change.add(result[i].id);
            console.log("add status")
            // generateTaskView(result[i])
        } else {
            for (let j = 0; j < status.length; j++) {
                if (result[i].id == status[j].id && (result[i].remain_time != status[j].remain_time ||
                    result[i].status != status[j].status || status[j].interval_time != result[i].interval_time)) {
                    status[j].status = result[i].status
                    status[j].remain_time = result[i].remain_time
                    status[j].interval_time = result[i].interval_time
                    status[j].start_date = result[i].start_date
                    is_change.add(result[i].id);
                    console.log("change status")
                    console.log(`result[i].remain_time ${result[i].remain_time} != status[j].remain_time
                    ${status[j].remain_time} ${status}`)
                }
            }
        }
        database_set.add(result[i].id)
        // console.log(result[i].id)
    }
    console.log(database_set)
    while (true) {
        for (let i = 0; i < status.length; i++) {
            if (!database_set.has(status[i].id)) {
                set_process.delete(status[i].id)
                if (document.getElementById(`exec-task-${status[i].id}`)) {
                    document.getElementById(`exec-task-${status[i].id}`).remove()
                }

                status.splice(i, 1);
                continue;
            }
        }
        break
    }

}

let remove = (id) => {
    console.log(id)
    status = status.filter((s) => {
        return s.id != id;
    })
}

let get_is_change = () => {
    if (is_change.length != 0) {
        return true;
    } else {
        return false;
    }
}

let set_is_change = (v) => {
    is_change.delete(v)
}


let get_client = async () => {
    if (client.length == 0) {
        client.push(await getClient())
    }
    return client
}

module.exports.status = status
module.exports.set_process = set_process
module.exports.update = update
module.exports.set_is_change = set_is_change
module.exports.get_is_change = get_is_change
module.exports.is_change = is_change
module.exports.remove = remove
module.exports.client = client
module.exports.get_client = get_client