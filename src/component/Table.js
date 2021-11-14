import React from 'react'

import styled from 'styled-components'
import {default as BSTable} from 'react-bootstrap/Table'

const Frame = styled.div`
    border: solid 1.5px #dee2e6;
    border-radius: 5px;
`
const CssTable = styled(BSTable)`
    border: none;
    margin: 0;
`
export default function Table({className, ...props}) {
    return <Frame className={className}>
        <CssTable {...props} />
    </Frame>
}