import React, {useReducer, useEffect} from 'react'
import {CSSTransition} from 'react-transition-group'
import styled from 'styled-components'

import {default as BSContainer} from 'react-bootstrap/Container'
import WarningIcon from '@material-ui/icons/Warning'

import TopNav from './section/TopNav'
import SideNav from './section/SideNav'
import Content from './section/Content'
import Config from './section/modal/Config'

import http, {contextPath} from '../util/http'
import websocket from '../util/websocket'

const WS_AI_SERVER = '/ai-server-alert'
const CONFIG_URL = `${contextPath}/api/config`

const Alert = styled.div`
    position: fixed !important;
    top: 80px;
    right: 20px;
    z-index: 3;
    padding: 1rem 1rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    position: relative;
    padding: 1rem 1rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
`
const Container = styled(BSContainer)`
    padding-bottom: 60px;
`

function alertReducer(alert, cmd) {
    return {...alert, ...cmd}
}

function configReducer(config, params) {
    console.log({...config, ...params})
    return {...config, ...params}
}

export default function Layout() {
    const [config, setConfig] = useReducer(configReducer, {
        show: false
    })

    const [alert, setAlert] = useReducer(alertReducer, {
        show: false,
        type: undefined,
        content: ''
    })

    // subscribe alert topic using websocket
    async function subscribeAlert() {
        const useNotification = ('Notification' in window) && ('granted' === await Notification.requestPermission())
        websocket.subscribe(WS_AI_SERVER, msg => {
            const alert = JSON.parse(msg.body)
            if (useNotification && alert.content) {
                new Notification('Xware監視カメラ', {
                    icon: `${contextPath}/image/xware.png`,
                    body: alert.content
                })
            }
            alert.show = true
            if (useNotification) {
                alert.content = '' // bypass if notification is activated
            }
            setAlert(alert)
        })
    }

    async function getConfig() {
        setConfig(await http.get(CONFIG_URL))
    }

    async function putConfig() {
        setConfig(await http.put(CONFIG_URL))
    }

    function showConfig() {
        setConfig({show: true})
    }

    useEffect(() => {
        subscribeAlert()
        getConfig()
        return () => websocket.unsubscribe(WS_AI_SERVER)
    }, [])

    useEffect(() => {
        const timeoutID = alert.show ? setTimeout(() => setAlert({show: false}), 3000) : null
        return () => timeoutID !== null && clearTimeout(timeoutID)
    }, [alert])

    return <>
        <TopNav showConfig={showConfig}/>
        <div id='body'>
            <SideNav />
            <Container>
                <Content refresh={alert} />
            </Container>
        </div>
        <CSSTransition
            in={alert.show && !!alert.content}
            timeout={300}
            classNames='global-alert'
            unmountOnExit
            appear={true}
        >
            <Alert><WarningIcon /> {alert.content}</Alert>
        </CSSTransition>
        <Config
            show={config.show}
            onHide={() => setConfig({show: false})}
            backdrop='static'
            config={{...config}}
            setConfig={setConfig}
            saveConfit={putConfig}
        />
    </>
}