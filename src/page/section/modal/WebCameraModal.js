import React, {useState} from 'react'
import styled from 'styled-components'
import Modal from 'react-bootstrap/Modal'
import Spinner from 'react-bootstrap/Spinner'
import websocket from '../../../util/websocket'

const ModalBody = styled(Modal.Body)`
    display: flex;
    justify-content: center;
    align-items: center
`

export default function WebCameraModal(props) {
    const [img, setImg] = useState('')

    return <Modal
        {...props}
        size = 'lg'
        centered
    >
        <Modal.Header>Camera View</Modal.Header>
        <ModalBody>
        {img ? <Img src={`data:image/jpeg;base64,${img}`} /> : <Spinner animation='grow' />}
        </ModalBody>
        <Modal.Footer></Modal.Footer>
    </Modal>
}