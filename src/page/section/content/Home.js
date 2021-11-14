import React, {useState, useEffect, useContext} from 'react'

import styled from 'styled-components'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Alert from 'react-bootstrap/Alert'
import {default as BSButton} from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import CameraIcon from '../../../component/CameraIcon'

import LinkedCameraIcon from '@material-ui/icons/LinkedCamera'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import WarningIcon from '@material-ui/icons/Warning'
import CheckIcon from '@material-ui/icons/Check'

import http, {intToIp} from '../../../util/http'
import {Auth, validateAuth} from '../../../authContext'

const CAMERA_URL = 'api/settings/camera'
const AI_CONNECTION_ALERT_URL = 'api/ai-connection-alert'
const HUMAN_DETECTION_ALERT_URL = 'api/detection-log/group'

const Row = styled.div`
    margin-bottom: 20px;
`
const Button = styled(BSButton)`
    margin-right: 5px;
`
const FULL_TIME_FMT = 'YYYY-MM-DD HH:mm:ss'
const TIME_FMT = 'HH:mm:ss'
const MOMENT_DATE_TAG = 'date'

function timeInterval({startTime, endTime}) {
    if (startTime === endTime)
        return moment(startTime).format(FULL_TIME_FMT)
    const start = moment(startTime)
    const end = moment(endTime)
    return `${start.format(FULL_TIME_FMT)} - ${end.format(start.isSame(end, MOMENT_DATE_TAG) ? TIME_FMT : FULL_TIME_FMT)}`
}

export default function Home({refresh}) {
    const [idToLabel, setIdToLabel] = useState(new Map())

    const [cameras, setCameras] = useState(null)
    const [connectionAlerts, setConnectionAlerts] = useState(null)
    const [connectionAlertLock, setConnectionAlertLock] = useState(false)

    const [detectionAlerts, setDetectionAlerts] = useState(null)
    const [detectionAlertLock, setDetectionAlertLock] = useState(false)

    const {authID} = useContext(Auth)
    const {isManager} = validateAuth(authID)

    // we use post because it is logical delete
    async function deleteConnectionAlert(alert) {
        if (connectionAlertLock)
            return

        alert.confirmed = true
        setConnectionAlertLock(true)
        setConnectionAlerts(await http.post(AI_CONNECTION_ALERT_URL, alert))
        setConnectionAlertLock(false)
    }

    // we use post because it is logical delete
    async function deleteDetectionAlert(alert) {
        if (detectionAlertLock)
            return

        alert.confirmed = true
        setDetectionAlertLock(true)
        setDetectionAlerts(await http.post(HUMAN_DETECTION_ALERT_URL, alert))
        setDetectionAlertLock(false)
    }

    async function getCameras() {
        setCameras(await http.get(CAMERA_URL))
    }

    async function getConnectionAlerts() {
        setConnectionAlerts(await http.get(AI_CONNECTION_ALERT_URL))
    }

    async function getDetectionAlerts() {
        setDetectionAlerts(await http.get(HUMAN_DETECTION_ALERT_URL))
    }

    useEffect(() => {
        async function getIdToLabel() {
            const cameras = await http.get(CAMERA_URL)
            setIdToLabel(new Map(cameras.map(camera => [camera.id, camera.label])))
        }
        getIdToLabel()
        getCameras()
        getConnectionAlerts()
        getDetectionAlerts()
    }, [])

    useEffect(() => {
        switch (refresh.type) {
            case 'CAMERA_STATUS':
                getCameras()
                break
            case 'CONNECTION_ERROR':
                getConnectionAlerts()
                break
            case 'HUMAN_DETECTION':
                getDetectionAlerts()
                break
        }
    }, [refresh])

    return <>
        <h4>カメラステータス</h4>
        <Row>
        {/*
            cameras ? cameras.map(camera => <Button
                key={camera.id}
                variant={camera.status === 'NORMAL' ? 'outline-primary' : 'outline-danger'}
            >
                <LinkedCameraIcon />　{camera.label}
            </Button>) : <Alert variant='secondary'>
                <Spinner animation='border' size='sm' />　ローディング
            </Alert>
        */}
        {
            cameras ? cameras.map(camera => <CameraIcon key={camera.id} camera={camera} />) : <Alert variant='secondary'>
                <Spinner animation='border' size='sm' />　ローディング
            </Alert>
        }
        </Row>
        <h4>通信エラーログ</h4>
        {
            connectionAlerts ? connectionAlerts.length ? connectionAlerts.map(alert => <Alert
                key={alert.id}
                variant='danger'
                dismissible={isManager}
                onClose={() => deleteConnectionAlert(alert)}
            >
                <WarningIcon />　{`${timeInterval(alert)} AIサーバーとの通信エラーが発生。`}
            </Alert>) : <Alert variant='success'>
                <CheckIcon />　異常がありません
            </Alert> : <Alert variant='secondary'>
                <Spinner animation='border' size='sm' />　ローディング
            </Alert>
        }
        <h4>人検知ログ</h4>
        {
            detectionAlerts ? detectionAlerts.length ? detectionAlerts.map(alert => <Alert
                key={alert.id}
                variant='danger'
                dismissible={isManager}
                onClose={() => deleteDetectionAlert(alert)}
            >
                <WarningIcon />　{`${timeInterval(alert)} ${idToLabel.get(alert.cameraId) || intToIp(alert.cameraId)}に人検知しました。`}
            </Alert>) : <Alert variant='success'>
                <CheckIcon />　異常がありません
            </Alert> : <Alert variant='secondary'>
                <Spinner animation='border' size='sm' />　ローディング
            </Alert>
        }
    </>
}