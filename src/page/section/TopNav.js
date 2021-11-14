import React, {useContext} from 'react'

import styled from 'styled-components'
import CameraIcon from '@material-ui/icons/Camera'
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppSharpIcon from '@material-ui/icons/ExitToAppSharp'

import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

import {rotate} from '../../util/animation'
import http, {contextPath} from '../../util/http'
import {Auth} from '../../authContext'

const CssNavbar = styled(Navbar)`
    padding-left: 0px
`
const IconBox = styled.span`
    display: flex;
    justify-content: center;
    width: 170px;
`
const Camera = styled(CameraIcon)`
    animation: ${rotate} 5s linear infinite;
    cursor: default;
`
const Settings = styled(SettingsIcon)`
    animation: ${rotate} 5s linear infinite;
`

export default function TopNav({showConfig}) {

    async function logout() {
        const {value} = await Swal.fire({
            title: 'ログアウト',
            text: `ログアウトしますか？`,
            icon: 'info',
            showCancelButton: true,
            // confirmButtonColor: '#d33',
            // cancelButtonColor: '#3085d6',
            confirmButtonText: '確認',
            cancelButtonText: 'キャンセル'
        })
        if (!value)
            return
        await http.post('logout')
        // because csrf restriction, we need to actually reload current page
        location.replace(contextPath + '/login')
        // await history.replace('/login')
    }

    const auth = useContext(Auth)    

    return <CssNavbar bg='dark' variant='dark'>
        <IconBox>
            <img src={`${contextPath}/image/xware.png`} width={130} height={38} />
        </IconBox>
        <Navbar.Brand>
            {/*<Camera style={{cursor: 'default'}} />*/}surveillance-camera
        </Navbar.Brand>
        <Nav className='mr-auto'>
            <Nav.Link href='#features'>Version 1.4.0</Nav.Link>
        </Nav>
        <Navbar.Collapse className="justify-content-end">
            <Navbar.Text style={{marginRight: '1rem'}}>
                ようこそ、{auth.username || ''} 様
            </Navbar.Text>
        </Navbar.Collapse>
        <Nav className='ml-auto'>
            <Nav.Link>
                <Settings onClick={showConfig}/>
            </Nav.Link>
            <Nav.Link onClick={logout}>
                <ExitToAppSharpIcon/>
            </Nav.Link>
        </Nav>
    </CssNavbar>
}