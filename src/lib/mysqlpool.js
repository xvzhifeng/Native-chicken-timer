const fs = require(`fs`);
const mysql = require(`mysql-await`);
let pollclient = null

let createClient = async () => {
    /** Create connection pool using loaded config */
    const pool = mysql.createPool(JSON.parse(fs.readFileSync(`${__dirname}/../conf/mysql-config.json`)));

    pool.on(`acquire`, (connection) => {
        console.log(`Connection %d acquired`, connection.threadId);
    });

    pool.on(`connection`, (connection) => {
        console.log(`Connection %d connected`, connection.threadId);
    });

    pool.on(`enqueue`, () => {
        console.log(`Waiting for available connection slot`);
    });

    pool.on(`release`, function (connection) {
        console.log(`Connection %d released`, connection.threadId);
    });

    // const connection = await pool.awaitGetConnection();

    // connection.on(`error`, (err) => {
    //     console.error(`Connection error ${err.code}`);
    // });
    return pool
}

let getClient = async () => {
    if(pollclient == null) {
        pollclient = await createClient()
    }
    let connect = await pollclient.awaitGetConnection()
    return connect
}
module.exports = getClient
// export default getClient;