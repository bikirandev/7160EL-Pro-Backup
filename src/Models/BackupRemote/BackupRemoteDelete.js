const moment = require('moment')

class BackupDel {
  constructor(frequency, quantity, retention, uploads, timeStampNow) {
    this.frequency = frequency
    this.quantity = quantity
    this.retention = retention
    this.uploads = uploads
    this.timeStampNow = timeStampNow
    this.deleteIds = []

    // Daily Quantity
    this.dailyQuantity = Math.floor(24 / this.frequency)
  }

  isDeleteRequired() {
    return this.uploads.length - this.deleteIds.length - this.quantity
  }

  dayCount() {
    // backups group by date
    const backupsGroupByDate = this.uploads.reduce((acc, backup) => {
      const key = moment(backup.timeCreated * 1000).format('YYYY-MM-DD')

      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(backup)
      return acc
    }, {})

    // count by date
    const countByDate = Object.keys(backupsGroupByDate).map((key) => {
      const age = moment(this.timeStampNow * 1000).diff(moment(key), 'day')

      return {
        date: key,
        count: backupsGroupByDate[key].length,
        age,
      }
    })

    return countByDate
  }

  lastNumberOfDays() {
    const days = []
    const count = Math.floor((this.quantity - this.retention) / (24 / this.frequency - 1))

    for (let i = 0; i < count; i++) {
      const t = moment.unix(this.timeStampNow / 1000).subtract(i, 'day')
      days.push(t.format('YYYY-MM-DD'))
    }
    return days
  }

  emptyByDate(date) {
    const dBackups = this.uploads.filter((x) => {
      return x.date === date
    })

    for (const backup of dBackups) {
      if (this.isDeleteRequired()) {
        this.deleteIds.push(backup.id)
      }
    }
  }

  deleteByDays(date) {
    const dBackups = this.uploads.filter((x) => {
      const upDate = moment.unix(x.timeCreated).format('YYYY-MM-DD')
      return upDate === date
    })

    // Remove the first element
    dBackups.shift()

    for (const backup of dBackups) {
      if (this.isDeleteRequired()) {
        this.deleteIds.push(backup._id)
      }
    }
  }

  deleteSelector() {
    const cQuantity = this.uploads.length

    // if current quantity is less than the quantity, return null
    if (cQuantity < this.quantity) {
      return []
    }

    // Regular days
    const regularDays = this.lastNumberOfDays()

    // Count by date
    let countByDate = this.dayCount().sort((a, b) => {
      return b.age - a.age
    })

    // Filter non regular days
    countByDate = countByDate.filter((x) => {
      return !regularDays.includes(x.date)
    })

    // Delete by days
    countByDate.map((x) => {
      if (x.age >= this.retention) {
        this.emptyByDate(x.date)
      } else {
        this.deleteByDays(x.date)
      }
    })

    return this.deleteIds
  }

  debug() {
    const delBack = this.uploads.filter((x) => {
      return this.deleteIds.includes(x.id)
    })

    // Group by date count
    const delGroup = delBack.reduce((acc, backup) => {
      const key = backup.date
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(backup)
      return acc
    }, {})

    // count by date
    const delCountByDate = Object.keys(delGroup).map((key) => {
      return {
        date: key,
        count: delGroup[key].length,
      }
    })

    return delCountByDate
  }
}

module.exports = {
  BackupDel,
}
