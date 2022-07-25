let getClient = require('./mysqlpool')
let client = getClient()
let is_change = new Set()

let status = [
    // { id: 1, task_name: "t1", interval_time: 30, remaninder_time: 30, isStart: false, workTimer: null },
    // { id: 2, task_name: "t2", interval_time: 300, remaninder_time: 300, isStart: false, workTimer: null }
]
let set_process = new Set()

let update = (result) => {
    for (let i = 0; i < result.length; i++) {
        if(!set_process.has(result[i].id)) {
            status.push({...result[i],workTimer: null})
            set_process.add(result[i].id)
            is_change.add(result[i].id);
            console.log("add status")
            // generateTaskView(result[i])
        } else {
            for(let j =0;j<status.length;j++) {
                if(result[i].id == status[j].id && result[i].remaninder_time < status[j].remaninder_time) {
                    is_change.add(result[i].id);
                    console.log("change status")
                    console.log(`result[i].remaninder_time ${result[i].remaninder_time} != status[j].remaninder_time
                    ${status[j].remaninder_time} ${status}`)
                }
            }
        }
        console.log(result[i].id)
    }
}

let remove = (id) => {
    console.log(id)
    status = status.filter((s) => {
        return s.id != id;
    })
}

let get_is_change  = () => {
    if(is_change.length != 0) {
        return true;
    } else {
        return false;
    }
}

let set_is_change = (v) => {
    is_change.delete(v)
}


module.exports.status = status
module.exports.set_process = set_process
module.exports.update = update
module.exports.set_is_change = set_is_change
module.exports.get_is_change = get_is_change
module.exports.is_change = is_change
module.exports.remove = remove