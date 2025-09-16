import React, { useEffect, useState } from 'react'
import { checkHeading, replaceStar } from '../utils/helper'

const Answer = ({ answer, index, totalResult, type }) => {
    const [heading, setHeading] = useState(false)
    const [ans, setAns] = useState(answer)
    useEffect(() => {
        if (checkHeading(answer)) {
            setHeading(true)
            setAns(replaceStar(answer))
        }

    }, [])
    return (
        <>
            {
                totalResult > 1 && index === 0 ? <span className='font-semibold'>{answer}</span> :
                    heading ? <span className='font-semibold pt-1 block text-white'>{ans}</span> : <div className={type == "q" ? "pl-1 text-sm" : "pl-3"}>{ans}</div>}
        </>
    )
}

export default Answer
