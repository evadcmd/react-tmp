import React, {useContext} from 'react'
import {Route, Switch, Redirect, useLocation, BrowserRouter} from 'react-router-dom'
import {TransitionGroup, CSSTransition} from 'react-transition-group'

import Login from './page/Login' 
import Layout from './page/Layout'
import CreateAccount from './page/CreateAccount'

import {Auth, readAuthState} from './authContext'
import {contextPath} from './util/http'

function key({pathname}) {
    return pathname === '/create-account'
}

export default function App() {
    return <Auth.Provider value={readAuthState()}>
        <BrowserRouter basename={contextPath}>
            <CSSTransitionApp />
        </BrowserRouter>
    </Auth.Provider>
}

function CSSTransitionApp() {
    const location = useLocation()
    const k = key(location)
    return  <TransitionGroup>
        <CSSTransition
            key={k}
            classNames={k ? 'shiftleft' : 'shiftright'}
            timeout={500} 
        >
            <Switch location={location}>
                <Route path='/login' component={Login} />
                <Route path='/create-account' component={CreateAccount} />
                <PrivateRoute path='*' component={Layout} />
            </Switch>
        </CSSTransition>
    </TransitionGroup>
}

function PrivateRoute(props) {
    const {isAuthenticated} = useContext(Auth)
    const {location: {pathname}} = props
    return isAuthenticated ?
        <Route {...props} /> :
        <Redirect
            to={{
                pathname: '/login',
                state: {anchor: {pathname: pathname === '/login' ? '/' : pathname}}
            }}
        />
}