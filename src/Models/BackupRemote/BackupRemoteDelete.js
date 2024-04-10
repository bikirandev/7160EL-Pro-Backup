const moment = require('moment')

class BackupDel {
  constructor(frequency, quantity, retention, uploads, timeStampNow) {
    this.frequency = frequency // hourly, daily
    this.quantity = quantity
    this.retention = retention
    this.uploads = [...uploads]
    this.timeStampNow = timeStampNow
    this.deleteIds = []
  }

  calcDailyQuantity() {
    if (this.frequency === 'daily') {
      return 1
    }

    if (this.frequency === 'hourly') {
      return 24
    }

    return 24
  }

  isDeleteRequired() {
    // - this.deleteIds.length
    return this.uploads.length >= this.quantity
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

    // Remove from the uploads
    this.uploads = this.uploads.filter((x) => {
      return !this.deleteIds.includes(x._id)
    })
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

    // Remove from the uploads
    this.uploads = this.uploads.filter((x) => {
      return !this.deleteIds.includes(x._id)
    })
  }

  deleteByQuantity({ date }) {
    // count, age
    const dBackups = this.uploads
      .filter((x) => {
        const upDate = moment.unix(x.timeCreated).format('YYYY-MM-DD')
        return upDate === date
      })
      .sort((a, b) => {
        return b.timeCreated - a.timeCreated
      })

    // Remove first 24 elements
    dBackups.splice(0, this.calcDailyQuantity())

    for (const backup of dBackups) {
      this.deleteIds.push(backup._id)
    }

    // Remove from the uploads
    this.uploads = this.uploads.filter((x) => {
      return !this.deleteIds.includes(x._id)
    })
  }

  deleteSelector() {
    // Count by date
    const countByDate = this.dayCount().sort((a, b) => {
      return b.age - a.age
    })

    // Delete by quantity
    countByDate.map((x) => {
      this.deleteByQuantity(x)
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
