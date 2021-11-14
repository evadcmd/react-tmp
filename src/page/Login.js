import React, {useState, useReducer, useContext} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'

import CameraIcon from '@material-ui/icons/Camera'
import EmailIcon from '@material-ui/icons/Email'
import VpnKeyIcon from '@material-ui/icons/VpnKey'

import http, {contextPath} from '../util/http'
import {Auth, readAuthState} from '../authContext'
import {rotate} from '../util/animation'
import cipher, {AES} from '../util/cipher'

const CreateAccount = styled(Button)`
    position: fixed;
    top: 1rem;
    right: 1rem;
`
const Body = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
`
const Img = styled.img`
    margin-left: -20px;
    margin-bottom: 5px;
`
const ScaledForm = styled(Form)`
    border: 1px solid #cacccd;
    border-radius: 5px;
    width: 360px;
    padding: 20px;
    background-color: #f7f7f7;
`
const FormCheck = styled(Form.Check)`
    font-size: 12px;
`
const Panel = styled.h3`
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
`

function upsert(k, v) {
    localStorage.setItem(k, AES.encrypt(v))
}

function select(k) {
    const v = localStorage.getItem(k)
    return v ? AES.decrypt(v) : ''
}

function memorizeReducer(_, memorize) {
    localStorage.setItem('memorize', memorize)
    return memorize
}

// swal alert
function resetPwdReq() {
    Swal.fire({
        title: 'メールアドレスを入力してください',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        confirmButtonText: '送信',
        showLoaderOnConfirm: true,
        preConfirm: (login) => {
          return fetch(`//api.github.com/users/${login}`)
            .then(resp => {
                if (resp.ok) 
                    return resp.json()
                throw new Error(resp.statusText)
            })
            .catch(error => {
                Swal.showValidationMessage(
                    `Request failed: ${error}`
                )
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `${result.value.login}'s avatar`,
                    imageUrl: result.value.avatar_url
                })
            }
      })
}

export default function Login() {
    const [memorize, setMemorize] = useReducer(memorizeReducer,
        localStorage.getItem('memorize') === 'true'
    )
    const [username, setUsername] = useState(memorize ? select('username' || '') : '')
    const [password, setPassword] = useState(memorize ? select('password' || '') : '')

    const auth = useContext(Auth)
    const history = useHistory()
    // get anchor path from state obj.(may be undefined)
    const {state} = useLocation()
    const anchor = state && state.anchor || {pathname: '/'}

    async function attemptAuth() {
        upsert('username', memorize ? username : '')
        upsert('password', memorize ? password : '')
        await http.post('login', {username, password: cipher.encrypt(password)})
        Object.assign(auth, readAuthState())
        history.replace(anchor)
    } 

    /*
    function useMemorizedCredentials(memorize) {
        setMemorize(memorize)
        if (memorize) {
            setUsername(select('username') || username)
            setPassword(select('password') || password)
        }
    }
    */
    
    return <Body>
    {
        SIGNUP_ENABLED && <CreateAccount
            variant='outline-primary'
            onClick={() => history.push('/create-account')}
        >
            アカウントを作成
        </CreateAccount>
    }

        <Img src={`${contextPath}/image/xware.png`} width={252} height={74} />
        <Panel><Camera /> Camera Scheduler</Panel>
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
                        value={username}
                        onChange={event => setUsername(event.target.value)}
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
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        required
                    />
                    <Form.Control.Feedback type='invalid'>
                        パスワードを入力してください。
                    </Form.Control.Feedback>
                </InputGroup>
                <Form.Text
                    className='text-primary'
                    style={{cursor: 'pointer'}}
                    onClick={resetPwdReq}
                >
                    パスワードを忘れた場合
                </Form.Text>
            </Form.Group>

            <Form.Group controlId='CHECKBOX'>
                <FormCheck
                    type='checkbox'
                    label='ログイン情報を保存する。'
                    checked={memorize}
                    onChange={({target: {checked}}) => setMemorize(checked)}
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
        <Sign>Copyright © EvadCMD Corporation. All Rights Reserved.</Sign>
    </Body>
}