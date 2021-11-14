import React, {useState, useRef, useReducer, useEffect, useLayoutEffect} from 'react'

import styled from 'styled-components'

import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import CameraIcon from '@material-ui/icons/Camera'

import {rotate} from '../../../util/animation'

import CameraTaskSettings from './CameraTaskSettings'
import CameraDetectionConfig from './CameraDetectionConfig'

import 'react-input-range/lib/css/index.css'

const Camera = styled(CameraIcon)`
    animation: ${rotate} 5s infinite;
`
const NessaryLabel = styled.span`
    color: #dc3545;
    font-size: 0.7em;
`

const LEBEL_LENGTH = 2
const CONTENT_LENGTH = 10

export const TABS = {
    TASK_SETTINGS: 'camera-task-settings',
    DETECTION_CONFIG: 'camera-detection-config'
}

function isHTMLElement(obj) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return obj instanceof HTMLElement;
    } catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (typeof obj === 'object') &&
            (obj.nodeType === 1) &&
            (typeof obj.style === 'object') &&
            (typeof obj.ownerDocument === 'object')
    }
}

function imgWidthReducer({current}, width) {
    return {
        prev: current,
        current: width
    }
}

export default function CameraDetails({isManager, camera, tab, saveCamera, setModal, tasks, taskModes, ...props}) {
    // const [imgWidth, setImgWidth] = useState(798)
    const [imgWidth, setImgWidth] = useReducer(imgWidthReducer, {
        current: 798, prev: 798
    })
    const modalBodyRef = useRef(null)
    // observe modal size to adjust img component
    useLayoutEffect(() => {
        let resizeObserver = new ResizeObserver(
            () => {
                if (isHTMLElement(modalBodyRef.current)) {
                    // style attribute is inline style so we cannot get any value
                    // const {offsetWidth, style: {paddingLeft, paddingRight}} = modalBodyRef.current
                    const {fontSize} = getComputedStyle(document.documentElement)
                    const padding = parseInt(fontSize)
                    const {offsetWidth} = modalBodyRef.current
                    setImgWidth(offsetWidth - padding * 2)
                }
            }
        )
        if (isHTMLElement(modalBodyRef.current)) {
            resizeObserver.observe(modalBodyRef.current)
        }
        return () => {
            resizeObserver.disconnect()
            resizeObserver = null
        }
    }, [modalBodyRef.current])

    // adjust box size after modal body resized
    useEffect(() => {
        if (camera.ignoreRects && camera.ignoreRects.length) {
            const ratio = imgWidth.current / imgWidth.prev
            setModal({
                ignoreRects: camera.ignoreRects.map(({x, y, width, height}) => ({
                    x: x * ratio,
                    y: y * ratio,
                    width: width * ratio,
                    height: height * ratio
                }))
            })
        }
    }, [imgWidth])

    return <Modal
        size='lg'
        centered
        {...props}
    >
        <Modal.Header closeButton>
            <Modal.Title>
                <Camera style={{fontSize: 35}}/> カメラ詳細
            </Modal.Title>
            {'　'}
            <Nav variant="pills" defaultActiveKey={tab}>
                <Nav.Item>
                    <Nav.Link
                        eventKey={TABS.TASK_SETTINGS}
                        onClick={() => setModal({tab: TABS.TASK_SETTINGS})}
                    >
                        検知タスク設定
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        eventKey={TABS.DETECTION_CONFIG}
                        onClick={() => setModal({tab: TABS.DETECTION_CONFIG})}
                    >
                        検知範囲設定
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef}>

            <Form noValidate>
                <Form.Group as={Row}>
                    <Form.Label column sm={LEBEL_LENGTH}>
                        IP
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <InputGroup>
                            <Form.Control
                                type='text'
                                placeholder='IP'
                                value={camera.ip}
                                onChange={({target: {value:ip}}) => setModal({ip})}
                                readOnly={!isManager}
                                isInvalid={camera.validated && (/*!camera.ip || */camera.malformedIP)}
                                required
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column sm={LEBEL_LENGTH}>
                        説明
                        <NessaryLabel>※</NessaryLabel>
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <InputGroup>
                            <Form.Control
                                type='text'
                                placeholder='説明'
                                value={camera.label}
                                onChange={({target: {value:label}}) => setModal({label})}
                                readOnly={!isManager}
                                required
                                isInvalid={camera.validated && !camera.label}
                            />
                        {
                            camera.validated && !camera.label && <Form.Control.Feedback type='invalid'>
                                カメラ名を入力してください
                            </Form.Control.Feedback>
                        }
                        </InputGroup>
                    </Col>
                </Form.Group>
            {
                tab === TABS.TASK_SETTINGS ? <CameraTaskSettings
                    isManager={isManager}
                    camera={camera}
                    setModal={setModal}
                    tasks={tasks}
                    taskModes={taskModes}
                /> : <CameraDetectionConfig
                    isManager={isManager}
                    camera={camera}
                    setModal={setModal}
                    imgWidth={imgWidth}
                />
            }
            </Form>
        </Modal.Body>
    {
        isManager && <Modal.Footer>
            <Button
                variant="outline-primary"
                onClick={saveCamera}
            >
                {camera.id ? '変更を保存' : '新規作成'}
            </Button>
        </Modal.Footer>
    }
    </Modal>
}