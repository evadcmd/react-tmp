import React from 'react'

import styled from 'styled-components'

import Select from 'react-select'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import AccountBoxIcon from '@material-ui/icons/AccountBox'
import PersonIcon from '@material-ui/icons/Person'
import MailIcon from '@material-ui/icons/Mail'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
/*
import { useFormik } from 'formik';
import * as Yup from 'yup';
const ADMIN = 'ROLE_ADMIN'
const MANAGER = 'ROLE_MANAGER'
const USER = 'ROLE_USER'
*/

const NessaryLabel = styled.span`
    color: #dc3545;
    font-size: 0.7em;
`

const LABEL_LENGTH = 2
const CONTENT_LENGTH = 10

export default function UserDetails({authorities, cameras, user, saveUser, setModal, ...props}) {

    /*
    const formik = useFormik({
        initialValues = {}
    })
    */

    return <Modal
        {...props}
        size='lg'
        centered
    >
        <Modal.Header closeButton>
            <Modal.Title>
                <AccountBoxIcon style={{fontSize: 45}}/> ユーザー詳細
            </Modal.Title>
        </Modal.Header>
    
        <Modal.Body>
            <Form noValidate>
                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        メール
                        <NessaryLabel>※</NessaryLabel>
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <InputGroup>
                            <Form.Control
                                type='email'
                                placeholder='メールアドレス'
                                aria-describedby='inputGroupPrepend'
                                value={user.email}
                                onChange={({target: {value}}) => setModal({email: value})}
                                isInvalid={user.validated && (!user.email || user.illegalEmail)}
                            />
                        {
                            user.validated && (!user.email || user.illegalEmail) && <Form.Control.Feedback type="invalid">
                            {
                                user.email ? '無効なメールアドレスです' : 'メールアドレスを入力してください'
                            }
                            </Form.Control.Feedback>
                        }
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        表示名
                        <NessaryLabel>※</NessaryLabel>
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <InputGroup>
                            <Form.Control
                                type='text'
                                placeholder='表示名'
                                aria-describedby='inputGroupPrepend'
                                value={user.username}
                                onChange={({target: {value}}) => setModal({username: value})}
                                isInvalid={user.validated && !user.username}
                            />
                        {
                            user.validated && !user.username && <Form.Control.Feedback type="invalid">
                                表示名を入力してください
                            </Form.Control.Feedback>
                        }
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>
                        パスワード
                        {!user.id && <NessaryLabel>※</NessaryLabel>}
                    </Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <InputGroup>
                            <Form.Control
                                type='password'
                                placeholder='パスワード'
                                aria-describedby='inputGroupPrepend'
                                value={user.password || ''}
                                onChange={({target: {value}}) => setModal({password: value})}
                                isInvalid={user.validated && (!(user.id || user.password) || user.illegalPassword)}
                            />
                        {
                            user.validated && (!(user.id || user.password) || user.illegalPassword) && <Form.Control.Feedback type="invalid">
                            {/*
                                (user.id || user.password) ?
                                '無効なパスワードです。英字、数字を含めて10文字以上登録してください' :
                                'パスワードを入力してください'
                            */}
                                パスワードは、10文字以上で、英数字を必ず含めて設定してください
                            </Form.Control.Feedback>
                        }
                        </InputGroup>
                        {
                            !user.validated && <Form.Text className='text-muted'>
                            {` ※ ${user.id ? 'パスワードを再設定する場合' : 'パスワードは'}、10文字以上で、英数字を必ず含めて設定してください。`}
                            </Form.Text>
                        }
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column sm={LABEL_LENGTH}>カメラ</Form.Label>
                    <Col sm={CONTENT_LENGTH}>
                        <Select
                            isMulti
                            value={user.cameras}
                            closeMenuOnSelect={false}
                            options={cameras}
                            onChange={cameras => setModal({cameras: cameras || []})}
                        />
                    </Col>
                </Form.Group>

                <Col md={{span: CONTENT_LENGTH, offset: LABEL_LENGTH}} style={{marginTop: 30, marginBottom: 30}}>
                {
                    authorities.map(authority =>
                        <Form.Check inline
                            key={authority.id}
                            id={authority.id}
                            type='radio'
                            label={authority.displayname}
                            checked={authority.id === user.auth.id}
                            onChange={({target:{checked}}) => checked && setModal({auth: authority})}
                        />
                    )
                }
                </Col>

            {/*   
                <Col md={{span: CONTENT_LENGTH, offset: LABEL_LENGTH}} style={{marginTop: 30, marginBottom: 30}}>
                    <Form.Check inline
                        id='ADMIN'
                        label="管理者"
                        checked={user.authorities.has(ADMIN)}
                        onChange={({target: {checked}}) => setModal([ADMIN, checked])}
                    />
                    <Form.Check inline
                        id='MANAGER'
                        label="マネージャー"
                        checked={user.authorities.has(MANAGER)}
                        onChange={({target: {checked}}) => setModal([MANAGER, checked])}
                    />
                    <Form.Check inline
                        id='USER'
                        label="一般ユーザー"
                        checked={user.authorities.has(USER)}
                        onChange={({target: {checked}}) => setModal([USER, checked])}
                    />
                </Col>
            */}   
                <Col md={{span: CONTENT_LENGTH, offset: LABEL_LENGTH}}>
                    <Form.Switch
                        id="ENABLED" // need a none zero id to work
                        label='有効' // need label to show the component
                        checked={user.enabled}
                        onChange={() => setModal({enabled: !user.enabled})}
                    />
                </Col>

            {/*
                <Col md={{span: CONTENT_LENGTH, offset: LABEL_LENGTH}}>
                    <Form.Switch
                        id="ACCOUNT_NON_LOCKED" // need a none zero id to work
                        label='アカウントがロックされていません' // need label to show the component
                        checked={user.accountNonLocked}
                        onChange={() => setModal(['accountNonLocked', !user.accountNonLocked])}
                    />
                </Col>

                <Col md={{span: CONTENT_LENGTH, offset: LABEL_LENGTH}}>
                    <Form.Switch
                        id="ACCOUNT_NON_EXPIRED" // need a none zero id to work
                        label='アカウントの期限が切れていません' // need label to show the component
                        checked={user.accountNonExpired}
                        onChange={() => setModal(['accountNonExpired', !user.accountNonExpired])}
                    />
                </Col>

                <Col md={{span: CONTENT_LENGTH, offset: LABEL_LENGTH}}>
                    <Form.Switch
                        id="CREDENTIALS_NON_EXPIRED" // need a none zero id to work
                        label='パスワードの期限が切れていません' // need label to show the component
                        checked={user.credentialsNonExpired}
                        onChange={() => setModal(['credentialsNonExpired', !user.credentialsNonExpired])}
                    />
                </Col>
            */}

            </Form>
        </Modal.Body>
    
        <Modal.Footer>
            <Button
                variant="outline-primary"
                onClick={saveUser}
            >
                {user.id ? '変更を保存' : '新規作成'}
            </Button>
        </Modal.Footer>
    </Modal>
}