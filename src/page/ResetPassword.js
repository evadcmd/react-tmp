import React, {useState, useReducer} from 'react'
import {useHistory} from 'react-router-dom'
import styled from 'styled-components'

import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import HomeIcon from '@material-ui/icons/Home'

const LABEL = 3
const CONTENT = 9

const Header = styled.h1`
    font-size: 1.5rem;
    margin-bottom: 1rem;
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
    padding: 40px;
`

export default function ResetPassword() {
    const [user, setUser] = useReducer()
    const history = useHistory()
    return <Body>
        <ScaledForm>

            <Header>Xware Surveillance Camera</Header>
            <SubHeader>パスワード再設定</SubHeader>
        
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
                onClick={() => history.push('/login')}
            >
                <HomeIcon />
            </Button>

            <Button
                variant='outline-primary'
                className='float-right'
            >
                次へ
            </Button>
        </ScaledForm>
    </Body>
}