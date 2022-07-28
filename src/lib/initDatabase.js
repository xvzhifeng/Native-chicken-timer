const fs = require(`fs`);
const mysql = require(`mysql`);
database_name = 'native_chicken_timer_dev'


function create_init() {
    var connection = mysql.createConnection(JSON.parse(fs.readFileSync(`${__dirname}/../../conf/mysql-config.json`)));
    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ');
    });
    return connection;
}

function init() {
    var connection = mysql.createConnection(JSON.parse(fs.readFileSync(`${__dirname}/../conf/mysql-init.json`)))
    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ');
    });

    let init_database = `create database if not exists ${database_name} CHARACTER SET utf8mb4;`
    connection.query(init_database, function (err, results) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        init_table()
        console.log('create databese  ' + results);
    })
}

function init_table() {
    let client = create_init()
    let create_timer = `
                    create table if not exists nct_timer (
                        id int(10) primary key not null auto_increment,
                        task_name varchar(30),
                        start_date date,
                        interval_time int,
                        update_time datetime,
                        remain_time int,
                        is_start int default(0) comment '0 未启动 1 启动',
                        status int  default(1) comment '0 取消的任务 1 未完成 2 完成 3 暂停'
                    ) comment="任务时间信息";
            `
    client.query(create_timer, function (err, results) {
        if (err) {
            console.error('error create_content: ' + err.stack);
        }
        console.log(results)
    })
}

module.exports.init = init