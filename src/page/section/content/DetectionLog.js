import React, {useState, useReducer, useEffect} from 'react'

import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker'
import styled, { withTheme } from 'styled-components'
import {default as BSNav} from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Pagination from 'react-bootstrap/Pagination'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import {default as BSButton} from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Spinner from 'react-bootstrap/Spinner'
import Table from '../../../component/Table'

import RefreshIcon from '@material-ui/icons/Refresh'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'

import http, {intToIp} from '../../../util/http'

import Image from '../modal/Image'
import DropdownItem from 'react-bootstrap/DropdownItem'

const Row = styled.div`
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
`
const Nav = styled(BSNav)`
    margin-top: 15px;
`
const SearchPanel = styled.div`
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    align-items: start;
    flex-wrap: wrap;
    align-items: flex-start;
`
const InfoPanel = styled.span`
    margin-left: 15px;
    font-size: .8rem;
    color: silver;
`
const Tr = styled.tr`
    cursor: default;
`
const Section = styled.section`
    display: flex;
    align-items: center;
`
const PaginationPanel = styled.section`
    display: flex;
    align-items: start;
`
const Th = styled.th`
    cursor: pointer;
`
const Button = styled(BSButton)`
    height: 100%;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: 0;
`
const LOG_URL = '/camera/api/detection-log'
const endDate = moment().add(1, 'days').startOf('day')
const startDate = moment(endDate).add(-7, 'days')

const propToLabel = {
    // at: '時間',
    numHuman: '検知人数',
    maxConfidence: '確信度'
}

const opList = [
    '>=',
    '=',
    '<='
]

const CAMERA_URL = '/camera/api/settings'

function logReducer(log, property) {
    return {...log, ...property}
}

const PAGE_GROUP_SIZE = 10
function pageReducer(page, property) {
    return {...page, ...property}
}

function searchReducer(search, property) {
    // set corresponding operator
    const {prop} = property
    switch (prop) {
        case 'maxConfidence':
            property.operator = opList[0]
            break
        case 'numHuman':
            property.operator = opList[1]
            break
    }
    return {...search, ...property}
}

function imageReducer(image, property) {
    return {...image, ...property}
}

function dateRange([from, to]) {
    return {
        from: moment(from).format('YYYY-MM-DD HH:mm:ss'),
        to: moment(to).format('YYYY-MM-DD HH:mm:ss')
    }
}

function orderReducer(prev, by) {
    return prev.by === by ? {
        by, asc: !prev.asc
    } : {
        by, asc: true
    }
}

function timeFmt(date) {
    return date ? moment(date).format('YYYY-MM-DD HH時mm分ss秒') : ''
}

export default function DetectionLog() {
    // img modal
    const [image, setImage] = useReducer(imageReducer, {
        show: false,
        data: null
    })

    async function loadAndShowImage(id) {
        /*
        setImage({show: true, data: null})
        const img = await http.get(`${LOG_URL}/${id}`)
        setImage({data: img.data})
        */
    }

    // datetimepicker test
    const [range, onChange] = useState([startDate.toDate(), endDate.toDate()])
    // resource from database
    const [camera, setCamera] = useState(new Map())
    const [log, setLog] = useReducer(logReducer, {
        list: [],
        loaded: false
    })

    const [search, setSearch] = useReducer(searchReducer, {
        prop: 'maxConfidence',
        operator: opList[0],
        value: ''
    })
    const [cameraTag, setCameraTag] = useState(null)

    const [order, setOrder] = useReducer(orderReducer, {
        by: 'at',
        asc: false
    })

    const [page, setPage] = useReducer(pageReducer, {
        onChange: false,
        group: 0,
        size: 20,
        no: 0
    })

    async function refresh() {
        setLog({loaded: false})
        setLog({list: await http.get(LOG_URL, dateRange(range))})
        setPage({group: 0, size: page.size, no: 0})
        setLog({loaded: true})
    }

    useEffect(() => {
        // http request: get camera id to label map
        async function getCamera() {
            const cameras = await http.get(CAMERA_URL)
            setCamera(new Map(cameras.map(camera => [camera.id, camera.label])))
        }
        // http request: get logs
        async function getLogs() {
            setLog({list: await http.get(LOG_URL, dateRange(range))})
        }
        // set loaded
        Promise.all([getLogs(), getCamera()]).then(() => setLog({loaded: true}))
    }, [])

    function cameraTagMatched(l) {
        return cameraTag == null || cameraTag === l.cameraId
    }

    function searchCriteriaMatched(l) {
        /*
        let test = ''
        switch (search.prop) {
            case 'at':
                test = moment(l[search.prop]).format('YYYY-MM-DD HH:mm:ss')
                break
            case 'numHuman':
            case 'maxConfidence': 
                test = l[search.prop].toString()
        }
        return test.includes(search.value)
        */
        if (search.value === '') 
            return true;

        switch (search.operator) {
            case '>=': return parseInt(l[search.prop]) >= parseInt(search.value)
            case '=': return l[search.prop] === parseInt(search.value)
            case '<=': return parseInt(l[search.prop]) <= parseInt(search.value)
        }
    }

    const filteredList = log.list.reduce((res, l) => {
        if (cameraTagMatched(l) && searchCriteriaMatched(l))
            res.push(l)
        return res
    }, [])

    const startTime = filteredList.length ? timeFmt(filteredList[0].at) : ''
    const endTime = filteredList.length ? timeFmt(filteredList[filteredList.length - 1].at) : ''

    filteredList.sort((a, b) => (order.asc ? 1 : -1) * (a[order.by] - b[order.by]))

    const totalPages = Math.ceil(filteredList.length / page.size)
    const maxGroupIndex = Math.ceil(totalPages / PAGE_GROUP_SIZE) - 1

    return <>
        <h3>人検知ログ一覧</h3>
        <SearchPanel>
            <Section>
                <DateTimeRangePicker
                    onChange={onChange}
                    value={range}
                    disableClock={true}
                />
                <Button variant='outline-info' onClick={refresh}>
                    <RefreshIcon />
                </Button>
            </Section>
            <InputGroup className="mb-3" style={{maxWidth: 600}}>
                <DropdownButton
                    as={InputGroup.Prepend}
                    variant='outline-secondary'
                    title={propToLabel[search.prop]}
                    id='input-group-dropdown'
                >
                {
                    Object.entries(propToLabel).map(([prop, label]) => <DropdownItem
                        key={prop}
                        onClick={() => {setSearch({prop, value: ''})}}
                    >
                        {label}
                    </DropdownItem>)
                }
                </DropdownButton>
                <InputGroup.Prepend>
                    <InputGroup.Text>{search.operator}</InputGroup.Text>
                </InputGroup.Prepend>
            {/*
                <DropdownButton
                    as={InputGroup.Prepend}
                    variant='outline-secondary'
                    title={search.operator}
                    id='input-group-dropdown'
                >
                {
                    opList.map(operator => <DropdownItem
                        key={operator}
                        onClick={() => {setSearch({operator})}}
                    >
                        {operator}
                    </DropdownItem>)
                }
                </DropdownButton>
            */}
                <Form.Control
                    type='text'
                    placeholder='ここに入力して検索...'
                    value={search.value}
                    onChange={({target: {value}}) => {
                        setSearch({value})
                        setPage({group: 0, no: 0})
                    }}
                />
            </InputGroup>
        </SearchPanel>
        <Nav variant='tabs'>
            <Nav.Item
                key='ALL'
                onClick={() => {
                    setCameraTag(null)
                    setPage({group: 0, no: 0})
                }}
            >
                <Nav.Link className = {cameraTag === null && 'active'}>全部のカメラ</Nav.Link>
            </Nav.Item>
        {
            [...camera].map(([id, label]) => <Nav.Item
                key={id}
                onClick={() => {
                    setCameraTag(id)
                    setPage({group: 0, no: 0})
                }}
            >
                <Nav.Link className = {cameraTag === id && 'active'}>{label}</Nav.Link>
            </Nav.Item>)
        }
        </Nav>
        <Row>
        {
            filteredList.length ? <InfoPanel>
                {startTime}から {endTime}まで 総件数{filteredList.length}件　
            </InfoPanel> : undefined
        }
        {
            filteredList.length ? <PaginationPanel>
                <Pagination size='sm'>
                    <Pagination.First onClick={() => setPage({group: 0})} />
                    <Pagination.Prev onClick={() => (page.group > 0) && setPage({group: page.group - 1})} />
                {
                    [...Array(totalPages).keys()].slice(PAGE_GROUP_SIZE * page.group, PAGE_GROUP_SIZE * (page.group + 1)).map(i => <Pagination.Item
                        key={i}
                        active={i === page.no}
                        onClick={() => setPage({no: i})}
                    >
                        {i + 1}
                    </Pagination.Item>)
                }
                    <Pagination.Next onClick={() => (page.group < maxGroupIndex) && setPage({group: page.group + 1})}/>
                    <Pagination.Last onClick={() => setPage({group: maxGroupIndex})} />
                </Pagination>
                <ButtonGroup size='sm'>
                    <DropdownButton size='sm' as={ButtonGroup} title={page.size}>
                    {
                        [5, 10, 20].map(size => <Dropdown.Item
                            value={size}
                            key={size}
                            onClick={() => setPage({size, group: 0, no: 0})}
                        >
                            {size}
                        </Dropdown.Item>)
                    }
                    </DropdownButton>
                </ButtonGroup>
            </PaginationPanel> : undefined
        }
        </Row>
        <Table hover>
            <thead>
                <tr>
                    <Th onClick={() => setOrder('cameraId')}>
                        カメラ
                        {order.by === 'cameraId' ? order.asc ? <ArrowDropUpIcon /> : <ArrowDropDownIcon /> : ''}
                    </Th>
                    <Th onClick={() => setOrder('at')}>
                        検知時間
                        {order.by === 'at' ? order.asc ? <ArrowDropUpIcon /> : <ArrowDropDownIcon /> : ''}
                    </Th>
                    <Th onClick={() => setOrder('numHuman')}>
                        検知人数
                        {order.by === 'numHuman' ? order.asc ? <ArrowDropUpIcon /> : <ArrowDropDownIcon /> : ''}
                    </Th>
                    <Th onClick={() => setOrder('maxConfidence')}>
                        確信度
                        {order.by === 'maxConfidence' ? order.asc ? <ArrowDropUpIcon /> : <ArrowDropDownIcon /> : ''}
                    </Th>
                </tr>
            </thead>
        {
            <tbody>
            {
                log.loaded ? filteredList.slice(page.size * page.no, page.size * (page.no + 1)).map(
                    ({id, at, cameraId, isHuman, numHuman, maxConfidence}) => <Tr key={id} onClick={() => {loadAndShowImage(id)}}>
                    <td>{camera.get(cameraId) || intToIp(cameraId)}</td>
                    <td>{moment(at).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td>{numHuman}</td>
                    <td>{maxConfidence}%</td>
                </Tr>) : <tr>
                    <td colSpan={4}>
                        <Spinner animation='grow' />
                    </td>
                </tr>
            }
            </tbody>
        }
        </Table>

        <Image show={image.show} onHide={() => setImage({show: false})} data={image.data}/>
    </>
}