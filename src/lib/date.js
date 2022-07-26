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

module.exports.formatDate = formatDate
module.exports.ymr = ymr