import React from 'react'
import styled from 'styled-components'

import Select from 'react-select'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import SettingsIcon from '@material-ui/icons/Settings'

import {rotate} from '../../../util/animation'

const LABEL_LENGTH = 4
const CONTENT_LENGTH = 8

const Cog = styled(SettingsIcon)`
    animation: ${rotate} 2s linear infinite;
`

export default function Config({config, setConfig, saveConfig, ...props}) {
    return <Modal
            size='lg'
            centered
            {...props}
        >
        <Modal.Header closeButton>
            <Modal.Title>
                <Cog style={{fontSize: 35}}/> システム設定
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        人検知頻度
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <Select
                            value={HUMANDETECTION_TRIGGERRATE_OPTIONS.find(opt => opt.value === config.humanDetectionTriggerRate)}
                            options={HUMANDETECTION_TRIGGERRATE_OPTIONS}
                            onChange={({value}) => setConfig({humanDetectionTriggerRate: value})}
                        />
                        <Form.Text className="text-muted">
                            タスク実行する間、設定された秒数毎に人検知行います。
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        メール頻度
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <Select
                            value={MAILSENDER_TRIGGERRATE_OPTIONS.find(opt => opt.value === config.mailTriggerRate)}
                            options={MAILSENDER_TRIGGERRATE_OPTIONS}
                            onChange={({value})=> setConfig({mailTriggerRate: value})}
                        />
                        <Form.Text className="text-muted">
                            人検知した場合、設定された時間毎に人検知通知を送ります。
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        画像保存期間
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <Select
                            value={IMG_PRESERVATIONPERIOD_OPTIONS.find(opt => opt.value === config.imgPreservationPeriod)}
                            options={IMG_PRESERVATIONPERIOD_OPTIONS}
                            onChange={({value}) => setConfig({imgPreservationPeriod: value})}
                        />
                        <Form.Text className="text-muted">
                            検知した画像を設定により非保存、もしくは設定され期間で保存します。
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        アカウント新規登録を許可
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH} style={{display: 'flex', alignItems: 'center'}}>
                        <Form.Switch
                            id='signupEnabled' // need a none zero id to work
                            label='' // need label to show the component
                            checked={config.signupEnabled}
                            onChange={() => setConfig({signupEnabled: !config.signupEnabled})}
                        />
                        <Form.Text className={`text-${config.signupEnabled ? 'primary' : 'muted'}`}>
                            ONの場合はアカウント新規作成画面よりユーザーが登録できます。
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        カメラの追加、削除を許可
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH} style={{display: 'flex', alignItems: 'center'}}>
                        <Form.Switch
                            id='cameraEditable' // need a none zero id to work
                            label='' // need label to show the component
                            checked={config.cameraEditable}
                            onChange={() => setConfig({cameraEditable: !config.cameraEditable})}
                        />
                        <Form.Text className={`text-${config.cameraEditable ? 'primary' : 'muted'}`}>
                            <div>ONの場合は撮影設定画面のカメラ一覧より</div>
                            <div>カメラの新規作成、削除ができます。</div>
                        </Form.Text>
                    </Col>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button
                variant='outline-primary'
                onClick={saveConfig}
            >
                変更を保存
            </Button>
        </Modal.Footer>
    </Modal>
}
