class PriorityQueue {
    constructor(compare) {

        if (typeof compare !== 'function') {
            throw new Error('compare function required!')
        }

        this.data = []
        this.compare = compare

    }
    //二分查找 寻找插入位置
    search(target) {
        let low = 0, high = this.data.length
        while (low < high) {
            let mid = low + ((high - low) >> 1)
            if (this.compare(this.data[mid], target) > 0) {
                high = mid
            }
            else {
                low = mid + 1
            }
        }
        return low;
    }
    //添加
    push(elem) {
        let index = this.search(elem)
        this.data.splice(index, 0, elem)
        return this.data.length
    }
    //取出最优元素
    pop() {
        return this.data.pop()
    }
    //查看最优元素
    peek() {
        return this.data[this.data.length - 1];
    }
}

module.exports = PriorityQueue