import React, {useState, useReducer, useEffect} from 'react'
import styled from 'styled-components'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Spinner from 'react-bootstrap/Spinner'
import Table from '../../../component/Table'
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
// import Pagination from 'react-bootstrap/Pagination'

import MailOutlineIcon from '@material-ui/icons/MailOutline'
import PersonOutlineIcon from '@material-ui/icons/PersonOutline'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import CameraAltOutlinedIcon from '@material-ui/icons/CameraAltOutlined'
import ClearIcon from '@material-ui/icons/Clear'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'

import UserDetails from '../modal/UserDetails'
import http from '../../../util/http'
import cipher from '../../../util/cipher'

const Tr = styled.tr`
    cursor: pointer;
`
const Text = styled.text`
    cursor: pointer;
`
const Delete = styled(ClearIcon)`
    float: right;
    transition: all 0.3s ease;
    color: #dc3545;
    border: solid 1px #dc3545;
    border-radius: 3px;
    &:hover {
        color: white;
        background-color: #dc3545;
    }
`
const Row = styled.div`
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    align-items: start;
    flex-wrap: wrap;
`
/*
const Col = styled.div`
    display: flex;
    justify-content: end;
    align-items: start;
`
*/
const H3 = styled.h3`
    display: inline;
`
const Td = styled.td`
    display: flex;
    flex-wrap: wrap;
`
const MultiValue = styled.span`
    background-color: hsl(0, 0%, 90%);
    border-radius: 2px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    margin-left: 2px;
    margin-right: 2px;
    min-width: 0;
    box-sizing: border-box;
`
const Label = styled.div`
    border-radius: 2px;
    color: hsl(0, 0%, 20%);
    font-size: 85%;
    overflow: hidden;
    padding: 3px;
    padding-left: 6px;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
`
// const PAGE_GROUP_SIZE = 5 

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/
const USER_API = 'api/user'
const AUTH_API = 'api/authority'
const CAMERA_API = 'api/settings/camera'

/*
const authNum = {
    ROLE_ROOT: 4,
    ROLE_ADMIN: 2,
    ROLE_MANAGER: 1,
    ROLE_USER: 0,
}

function authWeight(authorities) {
    return authorities.reduce((res, {authority}) => res + authNum[authority], 0)
}
*/

const titles = {
    email: 'メールアドレス',
    username: '表示名',
    enabled: '有効',
    auth: '権限',
    cameras: 'カメラ'
}

const emptyUser = {
    username: '',
    email: '',
    enabled: true,
    auth: {}, // {id: 3, authority: 'ROLE_USER', displayname: '一般ユーザー'},
    cameras: []
}

const defaultSort = {
    by: 'auth',
    asc: false
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}


export default function User() {
    const [loaded, setLoaded] = useState(false)
    let [users, setUsers] = useState([])
    const [authorities, setAuthorities] = useState([])
    const [cameras, setCameras] = useState([])
    const [defaultUser, setDefaultUser] = useState(emptyUser)

    function modalReducer(modal, {show, copy, ...props}) {
        return copy ? {
            show: true,
            user: deepCopy(props.user)
        } : {
            show: show === undefined ? modal.show : show,
            user: {
                ...modal.user,
                ...props,
                ...props.email && {illegalEmail: !(EMAIL_REGEX.test(props.email) && users.reduce((res, usr) => res && (usr.id === modal.user.id || usr.email !== props.email), true))},
                ...(props.password !== undefined) && {illegalPassword: (!modal.user.id || props.password) && !PASSWORD_REGEX.test(props.password)}
            }
        }
    }

    const [modal, setModal] = useReducer(modalReducer, {
        show: false,
        user: emptyUser,
    })

    async function saveUser() {
        const {user} = modal
        const emptyColumns = !user.email || !user.username || !(user.id || user.password)
        if (emptyColumns || user.illegalEmail || user.illegalPassword)
            return setModal({validated: true})

        setUsers(await (user.password ? http.put(USER_API, {...user, password: cipher.encrypt(user.password)}) : http.post(USER_API, user)))
        setModal({show: false})
    }

    const [search, setSearch] = useState({
        prop: 'username',
        criterion: ''
    })

    function filterFunc(user) {
        switch (search.prop) {
            case 'auth':
                return user[search.prop].displayname.includes(search.criterion)
            case 'cameras':
                const {cameras} = user
                return cameras.length ?
                    cameras.reduce((res, {label}) => res || label.includes(search.criterion), false) :
                    search.criterion === ''
            default:
                return user[search.prop].toString().includes(search.criterion)
        }
    }

    const [sort, setSort] = useState(defaultSort)

    function changeSort(by) {
        setSort({by, asc: by === sort.by ? !sort.asc : sort.asc})
    }

    function compare(by, asc) {
        switch (by) {
            case 'auth':
                return (a, b) => (asc ? 1 : -1) * (b.auth.id - a.auth.id)
            case 'enabled':
                return (a, b) => (asc ? 1 : -1) * (a[by] - b[by])
            case 'cameras':
                return (a, b) => (asc ? 1 : -1) * (a[by].length - b[by].length)
            default:
                return (a, b) => (asc ? 1 : -1) * a[by].localeCompare(b[by])
        }
    }

    async function toggle({target: {id}}) {
        const user = users[id - 1]
        user.enabled = !user.enabled
        await http.post(USER_API, user)
        setUsers([...users])
    }

    async function deleteUser({email, id}) {
        const {value} = await Swal.fire({
            title: 'ユーザーを削除',
            text: `${email} を削除しますか？`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            // cancelButtonColor: '#3085d6',
            confirmButtonText: '削除',
            cancelButtonText: 'キャンセル'
        })
        if (!value)
            return
        setUsers(await http.delete(USER_API, {id}))
        Swal.fire(
            '成功',
            `${email} を削除しました。`,
            'success'
        )
    }

    async function getUsers() {
        setUsers(await http.get(USER_API))
    }

    async function getAuthorities() {
        const authorities = await http.get(AUTH_API)
        setDefaultUser({...defaultUser, auth: authorities[authorities.length - 1]})
        setAuthorities(authorities)
    }

    async function getCameras() {
        const cameras = await http.get(CAMERA_API)
        setCameras(cameras.map(({id, label}) => ({label, value: id, id})))
    }

    // mount, unmount
    useEffect(() => {
        Promise.all([getUsers(), getAuthorities(), getCameras()])
               .then(() => setLoaded(true))
        return () => setUsers([])
    }, [])

    users = users.filter(filterFunc).sort(compare(sort.by, sort.asc))

    /*
    const [pageGroup, setPageGroup] = useState(0)
    const [pageSize, setPageSize] = useState(Infinity)
    const [pageNum, setPageNum] = useState(0)

    function changePageSize(size) {
        if (size === pageSize)
            return
        setPageNum(0)
        setPageSize(size)
    }

    const totalPages = Math.ceil(users.length / pageSize)
    const pageIndices = [...Array(totalPages).keys()]
    const totalPageGroups = Math.ceil(totalPages / PAGE_GROUP_SIZE)
    */

    return <>
        <Row>
            <H3>ユーザー管理画面</H3>
        {/*
            <InputGroup className="mb-3" style={{maxWidth: 600}}>
                <DropdownButton
                    as={InputGroup.Prepend}
                    variant='outline-secondary'
                    title={titles[search.prop]}
                    id='input-group-dropdown'
                >
                {
                    Object.entries(titles).map(([k, v]) => <Dropdown.Item
                        key={k}
                        onClick={() => setSearch({...search, prop: k})}
                    >
                        {v}
                    </Dropdown.Item>)
                }
                </DropdownButton>
                <Form.Control
                    type='text'
                    placeholder='ここに入力して検索...'
                    onChange={({target: {value}}) => setSearch({...search, criterion: value})}
                />
            </InputGroup>
        */}
        {/*
            <Col>
                <Pagination>
                    <Pagination.First onClick={() => setPageGroup(0)}/>
                    <Pagination.Prev onClick={() => pageGroup > 0 && setPageGroup(pageGroup - 1)}/>
                    {pageIndices.slice(PAGE_GROUP_SIZE * pageGroup, PAGE_GROUP_SIZE * (pageGroup + 1)).map(i => <Pagination.Item
                        key={i}
                        active={i === pageNum}
                        onClick={() => setPageNum(i)}
                     >
                            {i + 1}
                    </Pagination.Item>)}
                    <Pagination.Next onClick={() => pageGroup < (totalPageGroups - 1) && setPageGroup(pageGroup + 1)}/>
                    <Pagination.Last onClick={() => setPageGroup(totalPageGroups - 1)}/>
                </Pagination>
                <ButtonGroup>
                    <DropdownButton
                        as={ButtonGroup}
                        title={pageSize}
                    >
                        {[5, 10, 20].map(i => <Dropdown.Item value={i} onClick={() => changePageSize(i)} key={i}>{i}</Dropdown.Item>)}
                    </DropdownButton>
                </ButtonGroup>
            </Col>
        */}
        </Row>
        <Table hover>
            <thead>
                <tr>
                    <th onClick={() => changeSort('enabled')}>
                        <VerifiedUserIcon />
                        {sort.by === 'enabled' ? sort.asc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon /> : ''}
                    </th>
                    <th onClick={() => changeSort('email')}>
                        <MailOutlineIcon />
                        {sort.by === 'email' ? sort.asc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon /> : ''}
                    </th>
                    <th onClick={() => changeSort('username')}>
                        <PersonOutlineIcon />
                        {sort.by === 'username' ? sort.asc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon /> : ''}
                    </th>
                    <th onClick={() => changeSort('auth')}>
                        <Text>権限</Text>
                        {sort.by === 'auth' ? sort.asc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon /> : ''}
                    </th>
                    <th onClick={() => changeSort('cameras')}>
                        <CameraAltOutlinedIcon />
                        {sort.by === 'cameras' ? sort.asc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon /> : ''}
                    </th>
                    <th style={{width: 20}}>
                    {   // avoid null authority
                        loaded && <Button
                            variant='outline-success'
                            size='sm'
                            className='float-right'
                            onClick={() => setModal({copy: true, user: defaultUser})}
                        >
                            <PersonAddIcon />
                        </Button>
                    }
                    </th>
                </tr>
            </thead>
            <tbody>
            {
                // users => users.slice(pageSize * pageNum, pageSize * (pageNum + 1))
                loaded ? users.map((user, index) => <Tr
                    key={user.id}
                >
                    <td>
                        <Form.Switch
                            id={index + 1} // need a none zero id to work
                            label='' // need label to show the component
                            checked={user.enabled}
                            onChange={toggle}
                        />
                    </td>
                    <td onClick={() => setModal({copy: true, user})}>{user.email}</td>
                    <td onClick={() => setModal({copy: true, user})}>{user.username}</td>
                    <td onClick={() => setModal({copy: true, user})}>{user.auth.displayname}</td>
                    <Td onClick={() => setModal({copy: true, user})}>
                        {user.cameras.map(camera => <MultiValue key={camera.id}><Label>{camera.label}</Label></MultiValue>)}
                    </Td>
                    <td><Delete onClick={() => deleteUser(user)}/></td>
                </Tr>) : <tr>
                    <td colSpan='5'><Spinner animation='grow' /></td>
                </tr>
            }
            </tbody>
        </Table>

        <UserDetails
            show={modal.show}
            onHide={() => setModal({show: false})}
            backdrop='static'
            user={modal.user}
            authorities={authorities}
            cameras={cameras}
            setModal={setModal}
            saveUser={saveUser}
        />
    </>
}