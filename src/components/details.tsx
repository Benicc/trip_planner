import React, { useEffect, useRef, useState } from 'react';
import Link from "next/link";

interface Dictionary {
    [key: string]: any;  // Key is a string, value can be any type
  }

interface DetailsProps {
    plan: Dictionary;
}

const Details: React.FC<DetailsProps> = ({plan}) => {

    return (
        <div className='flex space-x-[10%] text-white bg-[#282828] h-[128px] w-[99%] ml-2 rounded-xl p-4 overflow-auto'>
            <div>
            Plan name: {plan.planName}
            <br></br>
            Plan type: {plan.planType}
            <br></br>
            Colour: {plan.colour}
            <br></br>
            Date: {plan.date}
            <br></br>
            </div>
            <div>
            Start time: {plan.startTime}
            <br></br>
            End time: {plan.endTime}
            </div>
            <div className='flex flex-grow'>
                <div className='pr-2'>Notes:</div>
                <div className='w-[200px]'>{plan.notes}</div>
            </div>
        </div>
    )
};

export default Details;