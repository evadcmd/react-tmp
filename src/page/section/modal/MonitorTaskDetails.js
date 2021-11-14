import React from 'react'

import styled from 'styled-components'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'

import Select from 'react-select'

import TimePicker from '../../../component/TimePicker'
import DatePicker from '../../../component/DatePicker'

const NessaryLabel = styled.span`
    color: #dc3545;
    font-size: 0.7em;
`
const Feedback = styled.div`
    width: 100%;
    margin-top: .25rem;
    font-size: 80%;
    color: #dc3545;
`

const always = [
    {label: '毎日', value: 1}
]

const dayOfWeek = [
    {label: '日', value: 1},
    {label: '月', value: 2},
    {label: '火', value: 3},
    {label: '水', value: 4},
    {label: '木', value: 5},
    {label: '金', value: 6},
    {label: '土', value: 7},
]

const dayOfMonth = [...Array(31).keys()].map(i => ({
    value: i + 1, label: `${i + 1}日`
}))

const options = {
    'ALWAYS': always,
    'WEEK': dayOfWeek,
    'MONTH': dayOfMonth
}

// keep day index in order
function sortFunc(a, b) {
    return a.value - b.value
}

const LABEL = 2
const CONTENT = 10

export default function MonitorTaskDetails({isManager, task, saveTask, taskModes, cameras, setModal, ...props}) {

    const styles = {
        multiValue: base => base,
        multiValueLabel: base => base,
        multiValueRemove: base => isManager ? base : {...base, display: 'none'}
    }

    return <Modal {...props} size='lg'>
        <Modal.Header closeButton>
            <Modal.Title>
                <Badge variant='info'>{task.id}</Badge>タスク詳細
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form noValidate>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL}>
                        ラベル
                        <NessaryLabel>※</NessaryLabel>
                    </Form.Label>
                    <Col sm={CONTENT}>
                        <InputGroup>
                            <Form.Control
                                value={task.label}
                                onChange={({target: {value}})=> setModal({label: value})}
                                readOnly={!isManager}
                                isInvalid={task.validated && task.illegalLabel}
                            />
                        {
                            task.validated && task.illegalLabel && <Form.Control.Feedback type="invalid">
                                {task.label ? 'タスク名が重なっています' : 'タスク名を入力してください'}
                            </Form.Control.Feedback>
                        }
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} style={{display: 'flex', alignItems: 'flex-start'}}>
                    <Col sm={LABEL} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                        <Select
                            isDisabled={!isManager}
                            options={Object.entries(taskModes).map(([value, label]) => ({label, value}))}
                            value={{label: taskModes[task.mode], value: task.mode}}
                            onChange={({value:mode}) => setModal(
                                mode === 'ALWAYS' ? {mode: 'WEEK', indices: dayOfWeek} : {mode, indices: []}
                            )}
                            styles={{
                                control: base => ({...base, minWidth: '90px'})
                            }}
                        />
                        <NessaryLabel>※</NessaryLabel>
                    </Col>
                    <Col sm={CONTENT}>
                    {
                        task.mode === 'SINGLE_SHOT' ? <DatePicker
                            isManager={isManager}
                            selectedDays={task.indices}
                            setModal={setModal}
                            isInvalid={task.validated && task.emptyIndices}
                        /> : <Select
                            isMulti
                            styles={styles}
                            isClearable={isManager}
                            isDisabled={!isManager}
                            closeMenuOnSelect={false}
                            options={options[task.mode]}
                            value={task.indices}
                            onChange={days => setModal({indices: days && days.sort(sortFunc)})}
                            styles={{
                                control: base => ({
                                    ...base,
                                    borderColor: task.validated && task.emptyIndices ? 'red' : 'hsl(0, 0%, 80%)'
                                })
                            }} 
                        />
                    }
                    {
                        task.validated && task.emptyIndices && <Feedback>日付を選んでください</Feedback>
                    }
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL}>開始時間</Form.Label>
                    <Col>
                        <TimePicker
                            isManager={isManager}
                            time={task.start}
                            onChange={time => isManager && setModal({start: time})}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL}>終了時間</Form.Label>
                    <Col>
                        <TimePicker
                            isManager={isManager}
                            time={task.end}
                            onChange={time => isManager && setModal({end: time})}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL}>
                        カメラ
                        <NessaryLabel>※</NessaryLabel>
                    </Form.Label>
                    <Col>
                        <Select
                            isMulti
                            styles={styles}
                            isClearable={isManager}
                            isDisabled={!isManager}
                            closeMenuOnSelect={false}
                            options={cameras}
                            value={task.cameras}
                            onChange={cameras => setModal({cameras})}
                            styles={{
                                control: base => ({
                                    ...base,
                                    borderColor: task.validated && task.emptyCameras ? 'red' : 'hsl(0, 0%, 80%)'
                                })
                            }} 
                        />
                    {
                        task.validated && task.emptyCameras && <Feedback>カメラを選んでください</Feedback>
                    }
                    </Col>
                </Form.Group>
            </Form>
        </Modal.Body>
        {
            isManager && <Modal.Footer>
                <Button
                    variant='outline-primary'
                    onClick={saveTask}
                >
                    {task.id ? '変更を保存' : '新規作成'}
                </Button>
            </Modal.Footer>
        }
    </Modal>
}