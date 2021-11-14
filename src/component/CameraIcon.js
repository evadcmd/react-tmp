import React, {useRef, useState, useEffect} from 'react'

import styled from 'styled-components'
import {default as BSButton} from 'react-bootstrap/Button'
import Overlay from 'react-bootstrap/Overlay'
import LinkedCameraIcon from '@material-ui/icons/LinkedCamera'

const Button = styled(BSButton)`
    margin-right: 5px;
`
export default function CameraIcon({camera}) {
    const [show, setShow] = useState(false)
    const target = useRef(null)
    const ok = camera.status === 'NORMAL'

    useEffect(() => {
        if (show)
            setTimeout(() => setShow(false), 2000)
    })
    return <>
        <Button
            variant={ok ? 'outline-primary' : 'outline-danger'}
            ref={target}
            onClick={() => setShow(!show)}
        >
            <LinkedCameraIcon />　{camera.label}
        </Button>
        <Overlay target={target.current} show={show} placement='bottom'>
        {({
            placement,
            scheduleUpdate,
            arrowProps,
            outOfBoundaries,
            show: _show,
            ...props
        }) => (
            <div
                {...props}
                style={{
                    backgroundColor: ok ? 'rgba(0, 123, 255, 0.85)' : 'rgba(255, 100, 100, 0.85)',
                    padding: '2px 10px',
                    color: 'white',
                    borderRadius: 3,
                    ...props.style,
                }}
            >
                <div>{camera.ip}</div>
                <div>{ok ? '異常がありません' : 'カメラを確認してください'}</div>
            </div>
        )}
        </Overlay>
    </>
  }