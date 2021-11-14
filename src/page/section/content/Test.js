import React from 'react'

export default function Test() {
    return <div>
        {[...new Array(200).keys()].map(i => <div key={i}>{i}</div>)}
    </div>
}