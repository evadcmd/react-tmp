import React, {useState, useEffect, useCallback} from 'react'
import styled from 'styled-components'
import {Calendar} from 'react-modern-calendar-datepicker'
import {toMoment} from '../util/cron'

import 'react-modern-calendar-datepicker/lib/DatePicker.css'

const Input = styled.div`
    display: flex;
    flex-wrap: wrap;
    height: auto;
    min-height: calc(1.5em + .75rem + 2px);
    border-radius: ${({focus}) => focus ? '4px': '1px'};
    border-color: ${({focus, isInvalid}) => focus ? '#2684FF': isInvalid ? 'red' : 'hsl(0, 0%, 80%)'};
`
const MultiValue = styled.div`
    background-color: hsl(0, 0%, 90%);
    border-radius: 2px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    margin: 2px;
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
const Remove = styled.div`
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    border-radius: 2px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;
    &:hover {
        background-color: #FFBDAD;
        color: #DE350B;
    }
`

function getKey({year, month, day}) {
    return year << 9 | month << 5 | day
}

function compareFunc(a, b) {
    return getKey(a) - getKey(b)
}

export default function DatePicker({isInvalid, isManager, selectedDays, setModal}) {
    const [show, setShow] = useState(false)

    function changeHandler(days) {
        if (!isManager)
            return
        days.sort(compareFunc)
        const from = toMoment(days[0])
        const to = toMoment(days[days.length - 1])
        if (from.year() >= moment().year() && from.diff(to, 'days') < 366)
            setModal({indices: days})
    }

    function remove(event) {
        if (!isManager)
            return
        event.stopPropagation()
        const i = event.currentTarget.getAttribute('id')
        const days = [...selectedDays]
        days.splice(i, 1)
        setModal({indices: days})
    }

    const closeCalendar = useCallback(() => {
        isManager && setShow(false)
    }, [])

    const stopPropagation = useCallback(event => {
        event.nativeEvent.stopImmediatePropagation()
    }, [])

    useEffect(() => {
        document.addEventListener('click', closeCalendar)
        return () => document.removeEventListener('click', closeCalendar)
    }, [])

    return <div onClick={stopPropagation}>
        <Input
            className='form-control'
            focus={show}
            onClick={() => isManager && setShow(true)}
            isInvalid={isInvalid}
        >
        {
            selectedDays.map((date, i) => <MultiValue
                key={getKey(date)}
            >
                <Label>{`${date.year}/${date.month}/${date.day}`}</Label>
            {
                isManager && <Remove id={i} onClick={remove}>
                    <svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="css-6q0nyr-Svg">
                        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                    </svg>
                </Remove>
            }
            </MultiValue>)
        }
        </Input>
    {
        show && <Calendar
            value={selectedDays}
            onChange={changeHandler}
            shouldHighlightWeekends
        />
    }
    </div>
}