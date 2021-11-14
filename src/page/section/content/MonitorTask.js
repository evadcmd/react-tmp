import React, {useReducer} from 'react'

import styled from 'styled-components'

import Table from '../../../component/Table'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'

import AccessTimeIcon from '@material-ui/icons/AccessTime'
import ClearIcon from '@material-ui/icons/Clear'
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd'
import AvTimerIcon from '@material-ui/icons/AvTimer';
import MonitorTaskDetails from '../modal/MonitorTaskDetails'

import http from '../../../util/http'
import {pack, unpack, timeFormat, empty, DEPRECATED_TASK_MAP} from '../../../util/cron'

const Tr = styled.tr`
    cursor: pointer;
`
const Delete = styled(ClearIcon)`
    float: right;
    transition: all 0.3s ease;
    color: #dc3545;
    border: solid 1px #dc3545;
    border-radius: 3px;
    &:hover {
        color: white;
        background-color: #dc3545;
    }
`

const URL = '/camera/api/settings/task'

const defaultTimeFormat = {
    hour: 0,
    minute: 0,
}

const defaultTask = {
    enabled: true,
    label: '',
    mode: 'WEEK',
    indices: [],
    start: {...defaultTimeFormat},
    end: {...defaultTimeFormat},
    illegalLabel: true,
    emptyIndices: true,
    emptyCameras: true,
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

const Td = styled.td`
    display: flex;
    flex-wrap: wrap;
`
const MultiValue = styled.div`
    background-color: hsl(0, 0%, 90%);
    border-radius: 2px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    margin-left: 2px;
    margin-right: 2px;
    min-width: 0;
    box-sizing: border-box;
`
const Label = styled.div`
    border-radius: 2px;
    color: hsl(0, 0%, 20%);
    font-size: 85%;
    overflow: hidden;
    padding: 3px;
    padding-left: 6px;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
`
export default function MonitorTask({isManager, taskModes, tasks, setTasks, cameras, refreshCameras}) {

    function modalReducer(modal, {copy, show, ...props}) {
        return copy ? {
            show: true,
            task: deepCopy(props.task)
        } : {
            show: show === undefined ? modal.show : show,
            task: {
                ...modal.task,
                ...props,
                ...(props.label !== undefined) && {illegalLabel: !(props.label && tasks.reduce((unique, t) => unique && (t.id === modal.task.id || t.label !== props.label), true))},
                ...(props.indices !== undefined) && {emptyIndices: empty(props.indices)},
                ...(props.cameras !== undefined) && {emptyCameras: empty(props.cameras)}
            }
        }
    }

    const [modal, setModal] = useReducer(modalReducer, {
        show: false,
        task: defaultTask
    })

    async function toggle({target: {id}}) {
        if (!isManager)
            return
        const task = tasks[id - 1]
        task.enabled = !task.enabled
        // [TODO] ajax request
        const updatedtasks = await http.post(URL, pack(task))
        setTasks(updatedtasks.map(task => unpack(task)))
        await refreshCameras()
    }

    async function saveTask() {
        const {task} = modal
        if (task.illegalLabel || task.emptyIndices || task.emptyCameras)
            return setModal({validated: true})

        const updatedTasks = await http.post(URL, pack(modal.task))
        setTasks(updatedTasks.map(task => unpack(task)))
        await refreshCameras()
        setModal({show: false})
    }

    async function deleteTask(event) {
        event.stopPropagation()
        const id = event.currentTarget.getAttribute('id')
        const task = tasks.find(task => task.id == id)

        const {value} = await Swal.fire({
            title: 'タスクを削除',
            text: `撮影タスク（${task.label}）を削除しますか？`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            // cancelButtonColor: '#3085d6',
            confirmButtonText: '削除',
            cancelButtonText: 'キャンセル'
        })
        if (!value)
            return
        // do delete
        const updatedTasks = await http.delete(URL, {id})
        setTasks(updatedTasks.map(task => unpack(task)))
        await refreshCameras()
        Swal.fire(
            '成功',
            `撮影タスク（${task.label}）を削除しました。`,
            'success'
        )
    }

    return <>
        <Table hover>
            <thead>
                <tr>
                    <th>有効</th>
                    <th>ラベル</th>
                    <th>
                        <AvTimerIcon /> 実行時間設定
                    </th>
                    <th>開始時間</th>
                    <th>終了時間</th>
                    <th>カメラ</th>
                    <th style={{maxWidth: '20px'}}>
                    {
                        isManager && <Button
                            variant='outline-success'
                            size='sm'
                            className='float-right'
                            onClick={() => setModal({copy: true, task: defaultTask})}
                        >
                            <PlaylistAddIcon />
                        </Button>
                    }
                    </th>
                </tr>
            </thead>
            <tbody>
            {
                tasks ? tasks.map((task, index) => <Tr
                    key={task.id}
                >
                    <td>
                        <Form.Switch
                            id={index + 1} // need a none zero id to work
                            label='' // need label to show the component
                            checked={task.enabled}
                            onChange={toggle}
                        />
                    </td>
                    <td onClick={() => setModal({copy: true, task})}>{task.label}</td>
                    <td onClick={() => setModal({copy: true, task})}>
                        <Badge variant='info'>{DEPRECATED_TASK_MAP[task.mode] + ' '}</Badge>
                    {   
                        task.mode === 'SINGLE_SHOT' ?
                            task.indices.map(({year, month, day}, i) => <Badge variant='light' key={i}>{`${year}/${month}/${day}`}</Badge>) :
                            task.indices.map(({label}, i) => <Badge variant='light' key={i}>{label}</Badge>)
                    }
                    </td>
                    <td onClick={() => setModal({copy: true, task})}>
                        <AccessTimeIcon /> {timeFormat(task.start)}
                    </td>
                    <td onClick={() => setModal({copy: true, task})}>
                        <AccessTimeIcon /> {timeFormat(task.end)}
                    </td>
                    <Td onClick={() => setModal({copy: true, task})}>
                        {task.cameras.map(camera => <MultiValue key={camera.id}><Label>{camera.label}</Label></MultiValue>)}
                    </Td>
                    <td onClick={() => setModal({copy: true, task})}>
                        {isManager && <Delete id={task.id} onClick={deleteTask} />}
                    </td>
                </Tr>) : <tr>
                    <td colSpan={5}><Spinner animation='grow' /></td>
                </tr>
            }
            </tbody>
        </Table>
        <MonitorTaskDetails
            show={modal.show}
            onHide={() => setModal({show: false})}
            backdrop='static'
            setModal={setModal}
            isManager={isManager}
            task={modal.task}
            saveTask={saveTask}
            taskModes={taskModes}
            cameras={cameras}
        />
    </>
}