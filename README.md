# 土鸡报时


土鸡时钟，准点报时。

## sql

```sql
create database if not exists native_chicken_timer;

use native_chicken_timer;

drop table ntc_timer;

create table if not exists ntc_timer (
	id int(10) primary key not null auto_increment,
	task_name varchar(30),
	start_time datetime,
	interval_time int,
	update_time datetime,
	remaninder_time int,
	is_start int default(0) comment '0 未启动 1 启动',
	status int default(1) comment '0 删除数据 1 正常数据'
) comment="任务时间信息";

select * from ntc_timer;

insert into ntc_timer (task_name,interval_time)
values("task1", 600),
('task2',80);
```
