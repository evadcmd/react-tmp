/**
 * web fetch APIでAJAX通信する機能
 * 
 */
import Cookies from 'js-cookie'

const CONFIG = {
    mode: 'cors',
    credentials: 'include',
    redirect: 'error'
}

function selector(query) {
    return document.querySelector(`meta[name="${query}"]`).content
}

export const contextPath = selector('context-path')

const CSRF_TOKEN = {
    [selector('_csrf_header')]: selector('_csrf')
}

const CORS = {
    headers: {
        ...CSRF_TOKEN,
        'Content-Type': 'application/json'
    }
}

const QUERY_BY_URL = {
    'GET': true,
    'POST': false,
    'PUT': false,
    'DELETE': true
}

function queryString(params) {
    return params ? Object.entries(params).reduce((paramStr, [k, v], i) => (
        `${paramStr}${i ? '&' : '?'}${k}=${v}`
    ), '') : ''
}

async function request(url, method='GET', data, json=true) {
    try {
        const resp = await (QUERY_BY_URL[method] ?
            fetch(`${url}${queryString(data)}`, {...CONFIG, ...{headers: CSRF_TOKEN}, method}) :
            fetch(url, {...CONFIG, ...CORS, method, body: data})
        )
        const {status, statusText, body} = await resp
        if (status !== 200)
            throw Error(`[${status}]${statusText}${body ? ':' : ''}${body}`)
        return json ? resp.json() : body
    } catch(e) {
        Object.keys(Cookies.get()).forEach(k => Cookies.remove(k, {path: ''}))
        location.assign(`${contextPath}/login`)
    }
}

const http = {}

http.getRaw = (url, data) => (
    request(url, 'GET', data, false)
)

http.get = (url, data) => (
    request(url, 'GET', data)
)

http.post = (url, data) => (
    request(url, 'POST', JSON.stringify(data))
)

http.put = (url, data) => (
    request(url, 'PUT', JSON.stringify(data))
)

http.delete = (url, data) => (
    request(url, 'DELETE', data)
)

http.form = (url, data) => (
    request(url, 'POST', Object.entries(data).reduce(
        (formData, [k, v]) => {
            formData.append(k, v)
            return formData
        },
        new FormData()
    ))
)

export default http

export function ipToInt(ipStr) {
    return ipStr.split('.').reduce((res, fragment) => (
        (res << 8) | parseInt(fragment)
    ), 0)
}

export function intToIp(i) {
    const mask = 0xFF
    const frags = []
    for (let j = 0; j < 4; j++) {
        frags.unshift(mask & i)
        i = i >> 8
    }
    return frags.join('.')
}

function getAndRemove(query) {
    const elem = document.querySelector(`meta[name=${query}]`)
    if (!elem)
        return null;
    const {content} = elem
    elem.remove()
    return content;
}

export function popAuth() {
    return {
        isAuthenticated: getAndRemove('isAuthenticated') === 'true',
        displayname: getAndRemove('displayname'),
        authorities: getAndRemove('authorities').split(',')
    }
}