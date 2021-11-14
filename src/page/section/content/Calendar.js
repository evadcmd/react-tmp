import React, {useState, useRef} from 'react'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import jaLocale from '@fullcalendar/core/locales/ja'

import styled from 'styled-components'
import Col from 'react-bootstrap/Col'

import './main.scss' // webpack must be configured to do this

/*
const Container = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`
*/

const Frame = styled.div`
    max-width: 80%;
`

export default function Calendar() {
    const [events, setEvents] = useState([
        {
            title: 'タスク1',
            start: moment().add(7, 'days').format('YYYY-MM-DD'),
            end: moment().add(14, 'days').format('YYYY-MM-DD'),
        },
        {
            title: 'タスク2',
            start: moment().add(-1, 'days').format('YYYY-MM-DD'),
            end: moment().add(6, 'days').format('YYYY-MM-DD'),
        },
        {
            title: 'タスク3',
            start: moment().add(-7, 'days').format('YYYY-MM-DD'),
            end: moment().add(-4, 'days').format('YYYY-MM-DD'),
        },
    ])
    return <Col md={{span: 10, offset: 1}}>
        <FullCalendar
            defaultView="dayGridMonth"
            locale={jaLocale}
            plugins={[dayGridPlugin, interactionPlugin]}
            height='parent'
            editable={true}
            events={events}
            eventDrop={({event}) => setEvents(events.reduce((arr, e) => {
                if (e.title === event.title)
                    arr.append(event)
                else
                    arr.append(e)
                return arr
            }), [])}
        />
    </Col>
}