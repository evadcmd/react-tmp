import React from 'react'

import InputRange from 'react-input-range'
import Select from 'react-select'

import Table from '../../../component/Table'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'

import AccessTimeIcon from '@material-ui/icons/AccessTime'
import AvTimerIcon from '@material-ui/icons/AvTimer';

import {timeFormat} from '../../../util/cron'

const LEBEL_LENGTH = 2
const CONTENT_LENGTH = 10

export default function CameraTaskSettings({isManager, camera, saveCamera, setModal, tasks, taskModes, ...props}) {
    // Select styles settings
    const styles = {
        multiValue: base => base,
        multiValueLabel: base => base,
        multiValueRemove: base => isManager ? base : {...base, display: 'none'}
    }
    function setTask(idx, props) {
        const tasks = camera.tasks.reduce((tasks, task, i) => {
            if (i === idx)
                task = {...task, ...props}
            tasks.push(task)
            return tasks
        }, [])
        setModal({tasks})
    }

    return <>
        <Form.Group as={Row}>
            <Form.Label column sm={LEBEL_LENGTH}>
                閾値
            </Form.Label>
            <Col sm={CONTENT_LENGTH}>
                <InputRange
                    maxValue={90}
                    minValue={10}
                    value={camera.thresh}
                    onChange={thresh => isManager && setModal({thresh})}
                />
            </Col>
        </Form.Group>
        <Form.Group as={Row}>
            <Form.Label column sm={LEBEL_LENGTH}>
                タスク
            </Form.Label>
            <Col sm={CONTENT_LENGTH}>
                <Select
                    isMulti
                    styles={styles}
                    isClearable={isManager}
                    isDisabled={!isManager}
                    closeMenuOnSelect={false}
                    value={camera.tasks}
                    options={tasks}
                    onChange={tasks => setModal({tasks: tasks || []})}
                />
            </Col>
        </Form.Group>

        <Form.Group>
            <Table hover>
                <thead>
                    <tr>
                        <th>ラベル</th>
                        <th><AvTimerIcon /> 実行時間設定</th>
                        <th>開始時間</th>
                        <th>終了時間</th>
                        <th>閾値</th>
                    </tr>
                </thead>
                <tbody>
                {
                    camera.tasks.length ? camera.tasks.map((task, i) => <tr
                        key={task.id}
                    >
                        <td>{task.label}</td>
                        <td>
                            <Badge variant='info'>{taskModes[task.mode] + ' '}</Badge>
                        {
                            task.mode === 'SINGLE_SHOT' ? 
                                task.indices.map(({year, month, day}, i) => <Badge variant='light' key={i}>{`${year}/${month}/${day}`}</Badge>) :
                                task.indices.map(({label}, i) => <Badge variant='light' key={i}>{label}</Badge>)
                        }
                        </td>
                        <td><AccessTimeIcon /> {timeFormat(task.start)}</td>
                        <td><AccessTimeIcon /> {timeFormat(task.end)}</td>
                        <td>
                        {
                            task.editMode ? <InputGroup size='sm'>
                                <Form.Control
                                    type='number'
                                    value={task.threshold}
                                    onChange={({target: {value}}) => setTask(i, {threshold: value})}
                                    readOnly={!isManager}
                                />
                                <InputGroup.Prepend>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={ async () => {
                                            task.threshold = parseInt(task.threshold)
                                            if (task.threshold > 90) task.threshold = 90;
                                            else if (task.threshold < 10) task.threshold = 10;
                                            const isDefault = task.threshold === camera.thresh
                                            /*
                                            const threshold = {
                                                cameraId: camera.id,
                                                taskId: task.id,
                                                value: task.threshold / 100
                                            }
                                            if (isDefault)
                                                await http.put(THRESHOLD_URL, threshold)
                                            else
                                                await http.post(THRESHOLD_URL, threshold)
                                            */
                                            setTask(i, {editMode: false, ...isDefault && {threshold: undefined}})
                                        }}
                                    >
                                        変更
                                    </Button>
                                </InputGroup.Prepend>
                            </InputGroup> : <span
                                    onClick={() => isManager && camera.id && setTask(i, {editMode: true, threshold: task.threshold || camera.thresh})}
                                    style={{cursor: isManager ? 'pointer' : 'auto'}}
                                >
                                <Badge variant={task.threshold ? 'info' : 'secondary'}>
                                    {task.threshold ? 'カスタマイズ' : 'デフォルト'}
                                </Badge>
                                <Badge variant='light'>{task.threshold || camera.thresh}</Badge>
                            </span>
                        }
                        </td>
                    </tr>) : <tr>
                        <td colSpan='4'>撮影タスクを選んでください</td>
                    </tr>
                }
                </tbody>
            </Table>
        </Form.Group>
    </>
}