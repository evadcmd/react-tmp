import React from 'react'

import styled from 'styled-components'
import Modal from 'react-bootstrap/Modal'
import Spinner from 'react-bootstrap/Spinner'

const Img = styled.img`
    max-width: 700px;
    width: 100%;
`
export default function Image({data, ...props}) {
    return <Modal
        {...props}
        size = 'lg'
        centered
    >
        <Modal.Header closeButton>
            {}
        </Modal.Header>
        <Modal.Body style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {
            data ? <Img src={`data:image/jpeg;base64,${data}`} /> : <Spinner animation='grow' />
        }
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
    </Modal>
}