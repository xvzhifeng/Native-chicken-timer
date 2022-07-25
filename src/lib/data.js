let getClient = require('./mysqlpool')
let client = getClient()

let status = [
    { id: 1, task_name: "t1", interval_time: 30, remaninder_time: 30, isStart: false, workTimer: null },
    { id: 2, task_name: "t2", interval_time: 300, remaninder_time: 300, isStart: false, workTimer: null }
]
let set_process = new Set()

let update = (result) => {
    for (let i = 0; i < result.length; i++) {
        if(!set_process.has(result[i].id)) {
            status.push({...result[i],workTimer: null})
            set_process.add(result[i].id)
            // generateTaskView(result[i])
        } 
        console.log(result[i].id)
    }
}

let remove = (id) => {
    status.map((s) => {
        if(s.id != id) return s;
    })
}


module.exports.status = status
module.exports.set_process = set_process