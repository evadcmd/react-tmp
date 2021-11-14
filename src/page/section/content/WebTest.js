import React, {useState} from 'react'

import styled from 'styled-components'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Button from 'react-bootstrap/Button'
import Image from '../modal/Image'

import http from '../../../util/http'
import websocket from '../../../util/websocket'
import cipher from '../../../util/cipher'

const Row = styled.div`
    margin-bottom: 30px;
    display: flex;
`
function createCipherText(text) {
    const cipherText = cipher.encrypt(text)
    console.log(cipherText)
    return cipherText
}

export default function WebTest() {
    const [modal, setModal] = useState(false)
    const [img, setImg] = useState(null)

    function connectWebSocket() {
        websocket.subscribe('/topic', msg => setImg(msg.body))
        setModal(true)
    }

    function sendWebSocket() {
        websocket.send('/app/topic')
    }

    function disconnectWebSocket() {
        websocket.unsubscribe('/topic')
        setModal(false)
    }

    return <>
        <Breadcrumb>
            <Breadcrumb.Item>AJAX</Breadcrumb.Item>
        </Breadcrumb>
        <Row>
            <Button variant='outline-primary' onClick={() => http.get('api', {param: 'test'})}>GET テスト</Button>
            <Button variant='outline-primary' onClick={() => http.post('api', {param: 'test'})}>POST テスト</Button>
            <Button variant='outline-primary' onClick={() => http.put('api', {param: 'test'})}>PUT テスト</Button>
            <Button variant='outline-primary' onClick={() => http.delete('api', {param: 'test'})}>DEL テスト</Button>
            <Button variant='outline-primary' onClick={() => http.delete('api/unknown', {param: 'test'})}>ERROR404 テスト</Button>
        </Row>
        <Breadcrumb>
            <Breadcrumb.Item>ログイン</Breadcrumb.Item>
        </Breadcrumb>
        <Row>
            <Button variant='outline-primary' onClick={() => http.post('login', {username: 'tata', password: '1123'})}>ログイン　テスト</Button>
            <Button variant='outline-primary' onClick={() => http.post('login', {username: 'dada', password: '1123'})}>ログイン(failed) テスト</Button>
            <Button variant='outline-primary' onClick={() => http.post('logout')}>ログアウト テスト</Button>
        </Row>
        <Breadcrumb>
            <Breadcrumb.Item>Websocket</Breadcrumb.Item>
        </Breadcrumb>
        <Row>
        {/*
            <Button variant='outline-primary' onClick={() => websocket.subscribe('/topic', onMessage)}>Websocket subscribe</Button>
            <Button variant='outline-primary' onClick={() => websocket.unsubscribe('/topic')}>Websocket unsubscript</Button>
            <Button variant='outline-primary' onClick={() => websocket.disconnect()}>Websocket disconnect</Button>
        */}
            <Button variant='outline-primary' onClick={connectWebSocket}>Websocket subscribe</Button>
            <Button variant='outline-primary' onClick={sendWebSocket}>Websocket send</Button>
            <Button variant='outline-primary' onClick={disconnectWebSocket}>Websocket unsubscript</Button>
            <Button variant='outline-primary' onClick={() => websocket.disconnect()}>Websocket disconnect</Button>
        </Row>
        <Breadcrumb>
            <Breadcrumb.Item>RSA</Breadcrumb.Item>
        </Breadcrumb>
        <Row>
            <Button variant='outline-primary'  onClick={() => http.post('api/encrypt', {cipherText: createCipherText('test')})}>Send CipherText</Button>
        </Row>
        <Image data={img} show={modal} onHide={() => setModal(false)}/>
    </>
}