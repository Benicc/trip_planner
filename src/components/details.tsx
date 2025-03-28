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
        <div className='flex space-x-[128px] bg-[#808080] h-[128px] rounded-xl p-4 overflow-auto'>
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
        </div>
    )
};

export default Details;