import {createContext} from 'react'
import Cookies from 'js-cookie'

export const Auth = createContext()

// parse cookie to get auth info
export function readAuthState() {
    const {isAuthenticated, username, authID, authorities} = Cookies.get()
    return {
        isAuthenticated: isAuthenticated === 'true',
        username,
        authID,
        authorities: authorities && authorities.split(',')
    }
}

// check if the user is manager or not
export function validateAuth(authID) {
    return {
        isRoot: authID == 1,
        isManager: authID < 3
    }
}