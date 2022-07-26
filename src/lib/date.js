let ymr = "yyyy-mm-dd"
function formatDate(date, format) {
    const map = {
        mm: (date.getMonth() + 1).toString().padStart(2, 0),
        dd: date.getDate().toString().padStart(2, 0),
        yy: date.getFullYear().toString().slice(-2),
        yyyy: date.getFullYear()
    }
    return format.replace(/mm|dd|yyyy|yy/gi, matched => map[matched])
}

function startTime(){
	var today=new Date();
	var h=today.getHours();
	var m=today.getMinutes();
	var s=today.getSeconds();// 在小于10的数字前加一个‘0’
	m=checkTime(m);
	s=checkTime(s);
	document.getElementById('current-time').innerHTML= formatDate(today,ymr)+" "+h+":"+m+":"+s;
	t=setTimeout(function(){startTime()},500);
}

function checkTime(i){
	if (i<10){
		i="0" + i;
	}
	return i;
}

module.exports.formatDate = formatDate
module.exports.ymr = ymr
module.exports.startTime = startTime