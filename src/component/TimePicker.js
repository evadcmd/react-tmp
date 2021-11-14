import React, {useState, useRef} from 'react'
import TimeKeeper from 'react-timekeeper'
import styled from 'styled-components'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import ScheduleIcon from '@material-ui/icons/Schedule'
import {timeFormat} from '../util/cron'

const Clock = styled(TimeKeeper)`
    position: absolute !important;
    top: 2.5rem;
`
const Button = styled.div`
    text-align: center;
    padding: 10px 0;
`

export default function TimePicker({isManager, time, onChange}) {
    const [show, setShow] = useState(false)
    const inputRef = useRef(null)
    
    return <InputGroup>
        <FormControl
            ref={inputRef}
            value={timeFormat(time)}
            onFocus={() => isManager && setShow(true)}
            onBlur={() => isManager && setShow(false)}
            readOnly
        />
        <InputGroup.Append onClick={() => inputRef.current.focus()}>
            <InputGroup.Text><ScheduleIcon /></InputGroup.Text>
        </InputGroup.Append>
    {
        show && <Clock
            hour24Mode
            switchToMinuteOnHourSelect
            // forceCoarseMinutes
            coarseMinutes={1}
            time={time}
            onChange={({hour, minute}) => onChange({hour, minute})}
            onDoneClick={() => setShow(false)}
            doneButton={() => <Button>設定</Button>}
        />
    }
    </InputGroup>
}