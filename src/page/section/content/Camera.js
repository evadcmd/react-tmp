import React, {useReducer} from 'react'

import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'
import LanguageIcon from '@material-ui/icons/Language'
import ClearIcon from '@material-ui/icons/Clear'
import WarningIcon from '@material-ui/icons/Warning'
import CheckIcon from '@material-ui/icons/Check'

import Table from '../../../component/Table'

import CameraDetails, {TABS} from '../modal/CameraDetails'
import http, {ipToInt} from '../../../util/http'
import {pack, unpack, generateThresholdMap} from '../../../util/cron'

const Tr = styled.tr`
    cursor: pointer;
`
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
const Ok = styled(CheckIcon)`
    color: #28a745;
`
const Warning = styled(WarningIcon)`
    color: #dc3545;
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

const URL = '/camera/api/settings'
const THRESHOLD_URL = '/camera/api/settings/threshold'

const defaultCamera = {
    ip: '',
    label: '',
    // threshold: 40,
    thresh: 0.4,
    tasks: [],
    malformedIP: true
}

const IP_REGEX = /^(\d{1,3})\.(\d{1,3}).(\d{1,3}).(\d{1,3})$/

function validateIP(ip) {
    return IP_REGEX.test(ip) &&
        IP_REGEX.exec(ip).slice(1).reduce((res, digit) => {
            let i = parseInt(digit)
            return res && (i < 256) // regex: < 0 is impossible
        }, true)
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function threshold(cameraId, taskId, value) {
    return {cameraId, taskId, value}
}

export default function Camera({isManager, cameras, setCameras, tasks, refreshTasks, taskModes, threshMap, setThreshMap}) {

    function modalReducer(modal, {show, copy, prevId, tab, ...props}) {
        return copy ? {
            show: true,
            tab: TABS.TASK_SETTINGS,
            camera: deepCopy({
                ...props.camera,
                prevId,
                thresh: parseInt(props.camera.thresh * 100),
                tasks: props.camera.tasks.map(task => unpack(task))
            })
        } : {
            show: show === undefined ? modal.show : show,
            tab: tab || modal.tab,
            camera: {
                ...modal.camera,
                ...props,
                ...props.ip && {
                    malformedIP: !(
                        validateIP(props.ip) &&
                        cameras.reduce((unique, c) => unique && (c.id === modal.camera.id || c.ip !== props.ip), true)
                    )
                }
            }
        }
    }

    const [modal, setModal] = useReducer(modalReducer, {
        show: false,
        camera: defaultCamera,
    })

    async function saveCamera() {
        const {camera} = modal
        if (/*!camera.ip || */!camera.label || camera.malformedIP)
            return setModal({validated: true})
        const taskIdToThreshold = threshMap[camera.id] || {}
        const addList = []
        const deleteList = []
        for (let task of camera.tasks) {
            if (task.threshold !== taskIdToThreshold[task.id]) {
                const thresh = threshold(camera.id, task.id, task.threshold / 100)
                task.threshold ? addList.push(thresh) : deleteList.push(thresh)
            }
            if (taskIdToThreshold[task.id])
                delete taskIdToThreshold[task.id]
        }
        for (let taskId in taskIdToThreshold)
            deleteList.push(threshold(camera.id, taskId, null))

        setThreshMap(
            generateThresholdMap(await http.put(THRESHOLD_URL, {addList, deleteList}))
        )

        setCameras(await http.post(URL, {
            ...camera,
            id: ipToInt(camera.ip),
            thresh: camera.thresh / 100,
            tasks: camera.tasks.map(task => pack(task)),
        }))

        refreshTasks()
        setModal({show: false})
    }

    async function deleteCamera(event) {
        event.stopPropagation()
        const id = event.currentTarget.getAttribute('id')
        const camera = cameras.find(camera => camera.id == id)
        const {value} = await Swal.fire({
            title: 'カメラを削除',
            text: `${camera.label}（${camera.ip}）を削除しますか？`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            // cancelButtonColor: '#3085d6',
            confirmButtonText: '削除',
            cancelButtonText: 'キャンセル'
        })
        if (!value)
            return
        setCameras(await http.delete(URL, {id}))
        await refreshTasks()
        Swal.fire(
            '成功',
            `${camera.label}（${camera.ip}）を削除しました。`,
            'success'
        )
    }

    return <>
        <Table hover>
            <thead>
                <tr>
                    <th>
                        <LanguageIcon />
                        IP
                    </th>
                    <th>ステータス</th>
                    <th>
                        <DescriptionOutlinedIcon />
                        説明
                    </th>
                    <th>
                        タスク
                    </th>
                {
                    <th style={{width: 20}}>
                    {
                        isManager && <Button
                            variant='outline-success'
                            size='sm'
                            className='float-right'
                            onClick={() => setModal({copy: true, camera: defaultCamera})}
                        >
                            <AddAPhotoOutlinedIcon />
                        </Button>
                    }
                    </th>
                }
                </tr>
            </thead>
            <tbody>
            {
                cameras ? cameras.map(camera => <Tr
                    key={camera.id}
                    onClick={() => setModal({copy: true, camera, prevId: camera.id})}
                >
                    <td>{camera.ip}</td>
                    <td>{camera.status === 'NORMAL' ? <Ok /> : <Warning />}</td>
                    <td>{camera.label}</td>
                    <Td>
                        {camera.tasks.map(task => <MultiValue key={task.id}><Label>{task.label}</Label></MultiValue>)}
                    </Td>
                {
                    <td>
                        {isManager && <Delete id={camera.id} onClick={deleteCamera}/>}
                    </td>
                }
                </Tr>) : <tr>
                    <td colSpan={4}><Spinner animation='grow' /></td>
                </tr>
            }
            </tbody>
        </Table>
        <CameraDetails
            show={modal.show}
            onHide={() => setModal({show: false})}
            backdrop='static'
            isManager={isManager}
            camera={modal.camera}
            setModal={setModal}
            tab={modal.tab}
            saveCamera={saveCamera}
            tasks={tasks}
            taskModes={taskModes}
        />
    </>
}