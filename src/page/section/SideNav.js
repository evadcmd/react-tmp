import React, {useState, useContext} from 'react'
import {Link as RouterLink, useLocation} from 'react-router-dom'

import styled from 'styled-components' 
import HomeIcon from '@material-ui/icons/Home'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import TheatersIcon from '@material-ui/icons/Theaters'
import LanguageIcon from '@material-ui/icons/Language'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import VideocamIcon from '@material-ui/icons/Videocam'

import {Auth, validateAuth} from '../../authContext'

const Link = styled(RouterLink)`
    cursor: pointer;
    display: block;
    padding: 10px;
    transition: all 0.3s ease;
    &:hover {
        color: white;
        background-color: rgba(0, 123, 255, 0.6);
    }
`
const Panel = styled.div`
    margin-top: 15px;
    color: gray;
    text-align: center;
    text-decoration: underline;
    font-size: 10px;
    cursor: default;
`
const activeStyle = {
    color: 'white',
    backgroundColor: 'rgb(0, 123, 255)'
}

const emptyStyle = {}

export default function SideNav() {
    const [fold, setFold] = useState(0)
    const {pathname} = useLocation()
    const {authID} = useContext(Auth)
    const {isRoot, isManager} = validateAuth(authID)

    function getStyle(url) {
        return url === pathname ? activeStyle : emptyStyle
    }

    return <>
        <aside className={fold ? 'fold' : ''}>
            <Panel>
                {fold ? 'NAVI' : 'MAIN NAVIGATION'}
            </Panel>
            <Link to='/' style={getStyle('/')}>
                <HomeIcon />
                <span>ホーム</span>
            </Link>
        {
            isManager ? <Link to='/user' style={getStyle('/user')}>
                <AccountCircleIcon />
                <span>ユーザー</span>
                <span>管理</span>
            </Link> : undefined
        }
            <Link to='/settings' style={getStyle('/settings')}>
                <VideocamIcon />
                <span>撮影</span>
                <span>設定</span>
            </Link>
            <Link to="/detection-log" style={getStyle('/detection-log')}>
                <TheatersIcon />
                <span>人検知</span>
                <span>ログ</span>
            </Link>
        {
            isRoot ? <Link to="/web-test" style={getStyle('/web-test')}>
                <LanguageIcon />
                <span>通信</span>
                <span>テスト</span>
            </Link> : undefined
        }
            <ArrowBackIosIcon onClick={() => setFold(fold === 0 ? 1 : 0)} />
        </aside>
    </>
}