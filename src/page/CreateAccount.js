import React, {useState, useReducer} from 'react'
import {useHistory} from 'react-router-dom'
import styled from 'styled-components'

import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import CameraIcon from '@material-ui/icons/Camera'

import {rotate} from '../util/animation'
import http, {contextPath} from '../util/http'

const LABEL = 3
const CONTENT = 9

const Img = styled.img`
`
const Header = styled.h1`
    font-size: 1.2rem;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
`
const SubHeader = styled.h2`
    font-size: 1.2rem;
    margin-bottom: 2rem;
`
const Body = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const ScaledForm = styled(Form)`
    border: 1px solid #cacccd;
    border-radius: 5px;
    width: 650px;
    padding: 25px 40px 40px 40px;
`
const Camera = styled(CameraIcon)`
    animation: ${rotate} 5s linear infinite;
`

const defaultUser = {
    username: '',
    email: '',
    password: ''
}

export default function CreateAccount() {
    const [user, setUser] = useReducer()
    const history = useHistory()
    return <Body>
        <ScaledForm>

            <Img src={`${contextPath}/image/xware.png`} width={170} height={50} />
            <Header><Camera/> Camera Scheduler</Header>
            <SubHeader>アカウントの作成</SubHeader>

            <Form.Group as={Row} controlId='formHorizontalUsername'>
                <Form.Label column sm={LABEL}>
                    ユーザーネーム
                </Form.Label>
                <Col sm={CONTENT}>
                    <Form.Control type='text' placeholder='表示名' />
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId='formHorizontalEmail'>
                <Form.Label column sm={LABEL}>
                    メール
                </Form.Label>
                <Col sm={CONTENT}>
                    <Form.Control type='email' placeholder='メールアドレス' />
                </Col>
            </Form.Group>
        
            <Form.Group as={Row} controlId='formHorizontalPassword'>
                <Form.Label column sm={LABEL}>
                    パスワード
                </Form.Label>
                <Col sm={CONTENT}>
                    <Form.Control type='password' placeholder='パスワード' />
                    <Form.Text className='text-muted'>
                        ※ パスワードは 10文字以上で 英数字を必ず含めて設定してください。
                    </Form.Text>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId='formHorizontalPasswordConfirm'>
                <Col sm={{offset: LABEL}}>
                    <Form.Control type='password' placeholder='パスワード確認' />
                    <Form.Text className='text-muted'>
                        ※ パスワードを再入力してください。
                    </Form.Text>
                </Col>
            </Form.Group>

            <Button
                variant='outline-secondary'
                onClick={() => history.goBack()}
            >
                キャンセル
            </Button>

            <Button
                variant='outline-primary'
                className='float-right'
            >
                登録
            </Button>
        </ScaledForm>
    </Body>
}