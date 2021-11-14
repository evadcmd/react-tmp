import React from 'react'
import {Switch, Route, useLocation} from 'react-router-dom'

import {TransitionGroup, CSSTransition} from 'react-transition-group'

import Home from './content/Home'
import User from './content/User'
import Settings from './content/Settings'
import WebTest from './content/WebTest'
import DetectionLog from './content/DetectionLog'

export default function Content({refresh}) {
    /*
    const location = useLocation()
    return <TransitionGroup>
        <CSSTransition
            key={location.key}
            classNames='fade'
            timeout={0.3}
        >
            <Switch location={location}>
                <Route exact path='/' component={Home} />
                <Route path='/user' component={User} />
                <Route path='/web-test' component={WebTest} />
                <Route path='/test' component={Test} />
            </Switch>
        </CSSTransition>
    </TransitionGroup>
    */
    return <Switch>
        <Route exact path='/' render={props => <Home {...props} refresh={refresh} />} />
        <Route path='/user' component={User} />
        <Route path='/settings' render={props => <Settings {...props} refresh={refresh}/>}/>
        <Route path='/detection-log' component={DetectionLog} />
        <Route path='/web-test' component={WebTest} />
    </Switch>
}