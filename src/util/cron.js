/**
 * cron string <=> {
 *      repeat: bool(true),
 *      weekMode: bool(true),
 *      indices: [0, ...],
 *      startTime: integer
 *      duration: integer
 * }
 */

export function empty(list) {
    return !list || !list.length
}

export const dayOfWeek = new Map([
    [1, '日'],
    [2, '月'],
    [3, '火'],
    [4, '水'],
    [5, '木'],
    [6, '金'],
    [7, '土']
])

export const dayOfMonth = new Map(
    [...Array(31).keys()].map(i => [i + 1, `${i + 1}日`])
)

export const DEPRECATED_TASK_MAP = {
    WEEK: '毎週',
    MONTH: '毎月',
    SINGLE_SHOT: '一回',
}

const LABEL_MAP = {
    WEEK: dayOfWeek,
    MONTH: dayOfMonth,
    SINGLE_SHOT: new Map()
}

export function timeFormat({hour, minute}) {
    return `${('0' + hour).slice(-2)} : ${('0' + minute).slice(-2)}`
}

export function minutes({hour, minute}) {
    return hour * 60 + minute
}

const basis = moment({
    year: 1970,
    month: 0, // [0-11]
    day: 1
})

function dateObj(momentObj) {
    return {
        year: momentObj.get('year'),
        month: momentObj.get('month') + 1,
        day: momentObj.get('date')
    }
}

function indexToDay(indices) {
    const from = moment(basis).add(indices[0], 'days')
    const res = [dateObj(from)]
    for (let i = 1; i < indices.length; i++)
        res.push(dateObj(moment(from).add(indices[i], 'days')))
    return res
}

export function unpack({indices, mode, ...props}) {
    const label = LABEL_MAP[mode]
    return {
        ...props,
        mode,
        indices: mode === 'SINGLE_SHOT' ?
            indexToDay(indices) :
            indices.map(index => ({label: label.get(index), value: index}))
    }
}

export function toMoment(day) {
    return moment({...day, month: day.month - 1})
}

function dayToIndex(days) {
    /*
    for (let day of days)
        console.log(toMoment(day).format('YYYY-MM-DD'))
        */
    const offset = toMoment(days[0])
    const res = [offset.diff(basis, 'days')]
    for (let i = 1; i < days.length; i++)
        res.push(toMoment(days[i]).diff(offset, 'days'))
    return res
}

function interval(start, end) {
    const from = minutes(start)
    const to = minutes(end)
    return from === to ? 24 * 60 :
        from < to ? to - from : (24 * 60 - from) + to
}

// drop 'value' property of multi-select
export function pack({cameras, mode, indices, start, end, ...props}) {
    return {
        ...props,
        start,
        mode,
        duration: interval(start, end),
        cameras: cameras ? cameras.map(({label, value}) => ({id: value, label})) : [],
        indices: mode === 'SINGLE_SHOT' ?
            dayToIndex(indices) :
            indices.map(({value}) => value)
    }
}

export function generateThresholdMap(thresholdList) {
    const thresholdMap = {}
    for (let thresh of thresholdList) {
        const taskIdToValue = thresholdMap[thresh.cameraId]
        const threshValue = parseInt(thresh.value * 100)
        if (taskIdToValue)
            taskIdToValue[thresh.taskId] = threshValue
        else
            thresholdMap[thresh.cameraId] = {[thresh.taskId]: threshValue}
    }
    return thresholdMap
}

/*
export function setCustomThreshold(cameras) {
    for (let camera of cameras) {
        const {thresholds, tasks} = camera
        if (thresholds && thresholds.length) {
            const taskIdToThreshold = new Map(
                thresholds.map(({taskId, value}) => [taskId, parseInt(value * 100)])
            )
            for (let task of tasks)
                task.threshold = taskIdToThreshold.get(task.id)
        }
    }
    return cameras
}
*/
/*
export function unpack({cron, duration, ...props}) {
    const tokens = cron.split(' ')
    const weekMode = tokens[5] !== '?'
    const hour24 = parseInt(tokens[2])
    const start = {
        hour: hour24,
        minute: parseInt(tokens[1]),
    }
    const epoch = minutes(start) + duration
    const endHour24 = Math.floor(epoch / 60)
    const end = {
        hour: endHour24,
        minute: epoch % 60,
    }
    return {
        ...props,
        weekMode,
        indices: tokens[weekMode ? 5 : 3].split(',').map(i => ({label: weekDay[i],  value: parseInt(i)})),
        start,
        end
    }
}
*/

/*
export function pack({cameras, weekMode, indices, start, end, ...props}) {
    const tokens = Array(6).fill('*')
    tokens[0] = 0
    tokens[1] = start.minute
    tokens[2] = start.hour
    tokens[weekMode ? 4 : 5] = '?'
    tokens[weekMode ? 5 : 3] = indices.map(({value}) => value).join(',')
    return {
        ...props,
        cron: tokens.join(' '),
        duration: minutes(end) - minutes(start),
        start, weekMode,
        cameras: cameras.map(({value}) => ({id: value})),
        indices: indices.map(({value}) => value)
    }
}
*/
 