import React, {useState, useReducer, useContext} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'

import EmailIcon from '@material-ui/icons/Email'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import CameraIcon from '@material-ui/icons/Camera'

import http, {contextPath} from '../util/http'
import {Auth, readAuthState} from '../authContext'
import {rotate} from '../util/animation'
import cipher from '../util/cipher'

const Body = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #343a40;
`
const Img = styled.img`
    margin-left: -20px;
    margin-bottom: 5px;
`
const ScaledForm = styled(Form)`
    border-radius: 5px;
    width: 360px;
    padding: 20px;
    background-color: #f7f7f7;
`
const FormCheck = styled(Form.Check)`
    font-size: 12px;
`
const Panel = styled.h3`
    color: #f7f7f7;
    margin-left: -5px;
    margin-bottom: 20px;
`
const Camera = styled(CameraIcon)`
    animation: ${rotate} 5s linear infinite;
`
const Sign = styled.div`
    position: fixed;
    bottom: 3px;
    right: 3px;
    font-size: 13px;
    color: rgb(255, 102, 0);
`
// reminder
function removePwdItem() {
    localStorage.removeItem('pwd')
}

function loginReducer(credentials, update) {
    return update.memorized ? {
        username: localStorage.getItem('username') || '',
        password: localStorage.getItem('password') || '',
        memorized
    } : {
        ...credentials,
        ...update
    }
}

export default function Login() {
    const [login, setLogin] = useReducer(loginReducer, {
        username: '',
        password: '',
        memorized: true
    })
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [memorizePassword, setMemorizePassword] = useState(false)

    const auth = useContext(Auth)
    const history = useHistory()
    // get anchor path from state obj.(may be undefined)
    const {state} = useLocation()
    const anchor = state && state.anchor || {pathname: '/'}

    async function attemptAuth() {
        // const encryptedUsername = cipher.encrypt(login.username)
        const encryptedPassword = cipher.encrypt(login.password)
        if (login.memorized) {
            localStorage.setItem('username', login.username)
            localStorage.setItem('password', encryptedPassword)
        }
        await http.post('login', {username: login.username, password: cipherText})
        Object.assign(auth, readAuthState())
        history.replace(anchor)
    } 

    console.log(localStorage.getItem('pwd'))
    
    return <Body>
        <Img src={`${contextPath}/image/xware.png`} width={252} height={74} />
        <Panel><Camera /> surveillance-camera</Panel>
        <ScaledForm>

            <Form.Group controlId='USERNAME'>
                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <EmailIcon />
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        type='email'
                        placeholder='メールアドレス'
                        aria-describedby='inputGroupPrepend'
                        value={login.username}
                        onChange={({target: value})=> setLogin({username: value})}
                        required
                    />
                    <Form.Control.Feedback type='invalid'>
                        メールアドレスを入力してください。
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>

            <Form.Group controlId='PASSWORD'>
                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <VpnKeyIcon />
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        type='password'
                        placeholder='パスワード'
                        aria-describedby='inputGroupPrepend'
                        value={login.password}
                        onChange={({target: value}) => setLogin({password: value})}
                        required
                    />
                    <Form.Control.Feedback type='invalid'>
                        パスワードを入力してください。
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>

            <Form.Group controlId='CHECKBOX'>
                <FormCheck
                    type='checkbox'
                    label='ログイン情報を保存する。'
                    checked={memorizePassword}
                    onChange={({target: {checked}}) => setLogin({memorized: checked})}
                />
                <Button
                    variant='outline-primary'
                    onClick={attemptAuth}
                    className='float-right'
                >
                    ログイン
                </Button>
            </Form.Group>

        </ScaledForm>
        {/*
            <Sign>Copyright © Xware Corporation. All Rights Reserved.</Sign>
        */}
    </Body>
}