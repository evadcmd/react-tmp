import React, {useState, useEffect, useContext} from 'react'
import {Switch, Route, useRouteMatch, useHistory, useLocation} from 'react-router-dom'

import Nav from 'react-bootstrap/Nav'

import Camera from './Camera'
import MonitorTask from './MonitorTask'
import Calendar from './Calendar'

import http from '../../../util/http'
import {unpack, generateThresholdMap} from '../../../util/cron'

import {Auth, validateAuth} from '../../../authContext'

const CAMERA_URL = '/camera/api/settings'
const MONITOR_TASK_URL = '/camera/api/settings/task'
const MONITOR_TASKMODE_URL = '/camera/api/settings/taskmode'
const THRESHOLD_URL = '/camera/api/settings/threshold'

export default function Settings({refresh}) {
    const [cameras, setCameras] = useState(null)
    const [tasks, setTasks] = useState(null)
    const [taskModes, setTaskModes] = useState([])
    const [threshMap, setThreshMap] = useState({})

    const {authID} = useContext(Auth)
    const {isManager} = validateAuth(authID)

    async function refreshCameras(cameras) {
        setCameras(null)
        // load custom threshold
        /*
        const threshMap = {}
        for (let thresh of await http.get(THRESHOLD_URL)) {
            const taskIdToValue = threshMap[thresh.cameraId]
            const threshValue = parseInt(thresh.value * 100)
            if (taskIdToValue)
                taskIdToValue[thresh.taskId] = threshValue
            else
                threshMap[thresh.cameraId] = {[thresh.taskId]: threshValue}
        }
        */
        // set custom threshold into camera.tasks
        // if (!cameras)
            cameras = await http.get(CAMERA_URL)
        /*
        for (let camera of cameras) {
            let taskToThreshold = threshMap[camera.id] || {}
            for (let task of camera.tasks)
                task.threshold = taskToThreshold[task.id]
        }
        */
        setCameras(cameras)
        // setThreshMap(threshMap)
    }

    async function refreshTasks() {
        setTasks(null)
        const tasks = await http.get(MONITOR_TASK_URL)
        setTasks(tasks.map(task => unpack(task)))
    }

    async function loadTaskModes() {
        const modeList = await http.get(MONITOR_TASKMODE_URL)
        const taskModes = {}
        for (let mode of modeList)
            taskModes[mode.name] = mode.label
        setTaskModes(taskModes)
    }

    async function loadThreshMap() {
        setThreshMap(generateThresholdMap(await http.get(THRESHOLD_URL)))
    }

    async function init() {
        await Promise.all([loadTaskModes(), loadThreshMap()])
        refreshCameras()
        refreshTasks()
    }

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        if (refresh.type === 'CAMERA_STATUS' || refresh.type === 'CONNECTION_ERROR')
            http.get(CAMERA_URL).then(cameras => setCameras(cameras))
    }, [refresh])

    const {url} = useRouteMatch()
    const {pathname} = useLocation()
    const history = useHistory()

    if (cameras) {
        for (let camera of cameras) {
            let taskToThreshold = threshMap[camera.id] || {}
            for (let task of camera.tasks)
                task.threshold = taskToThreshold[task.id]
        }
    }

    return <>
        <h3>撮影設定画面</h3>
        <Nav variant='tabs' style={{marginBottom: 20}}>
            <Nav.Item>
                <Nav.Link
                    onClick={() => history.push(url)}
                    className={pathname === url && 'active'}
                >
                    カメラ一覧
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link
                    onClick={() => history.push(`${url}/task`)}
                    className={pathname === `${url}/task` && 'active'}
                >
                    タスク一覧
                </Nav.Link>
            </Nav.Item>
        {/*
            <Nav.Item>
                <Nav.Link onClick={() => history.push(`${url}/calendar`)}>
                    スケジュール一覧
                </Nav.Link>
            </Nav.Item>
        */}
        </Nav>
        <Switch>
            <Route
                exact path={`${url}`}
                render={
                    props => <Camera
                        {...props}
                        isManager={isManager}
                        taskModes={taskModes}
                        tasks={tasks}
                        threshMap={threshMap}
                        setThreshMap={setThreshMap}
                        cameras={cameras}
                        setCameras={setCameras}
                        refreshTasks={refreshTasks}
                    />
                }
            />
            <Route
                path={`${url}/task`}
                render={
                    props => <MonitorTask
                        isManager={isManager}
                        {...props}
                        cameras={cameras ? cameras.map((camera => ({label: camera.label, value: camera.id}))) : []}
                        taskModes={taskModes}
                        tasks={tasks}
                        setTasks={setTasks}
                        refreshCameras={refreshCameras}
                    />
                }
            />
        {/*
            <Route
                path={`${url}/calendar`}
                render={
                    props => <Calendar
                        {...props}
                        tasks={tasks}
                        setTasks={setTasks}
                        taskModes={taskModes}
                    />
                }
            />
        */}
        </Switch>
    </>
}