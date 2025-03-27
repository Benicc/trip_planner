import React, { useEffect, useRef, useState } from 'react';
import Link from "next/link";


interface tripProps {
    tripId: string;
    tripName: string;
}

const TripView: React.FC<tripProps> = ({tripId, tripName}) => {
    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return (
    <div>
        <div className="pl-[10%] pt-[2%] space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 flex hover:underline"
            >
                <h1 className='text-lg mb-1'>Assistant</h1>
                <svg width="20" height="20" viewBox="-5 -5 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#6B7280"></path> </g></svg>
            </button>
            {isOpen && (
                <div className="flex flex-col w-48 p-2 ml-2 absolute bg-neutral-800 rounded-md shadow-lg gap-2">
                    <Link href={`/assistant/${tripId}`}>
                        <button className='flex items-center h-8 rounded-md hover:bg-neutral-600'>
                        <svg width="21" height="21" fill="#FFFFFF" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z"></path></g></svg>
                        <div className='text-left text-white pl-2'>Assistant</div>
                        </button>
                    </Link>
                    <Link href={`/timetable/${tripId}`}>
                        <button  className='flex items-center h-8 w-full rounded-md hover:bg-neutral-600'>
                            <svg width="21" height="21" viewBox="0 0.5 24 24" id="_24x24_On_Light_Schedule" data-name="24x24/On Light/Schedule" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect id="view-box" width="24" height="24" fill="none"></rect> <path id="Shape" d="M2.75,17.5A2.753,2.753,0,0,1,0,14.75v-10A2.754,2.754,0,0,1,2.5,2.011V.75A.75.75,0,0,1,4,.75V2h9.5V.75a.75.75,0,0,1,1.5,0V2.011A2.754,2.754,0,0,1,17.5,4.75v10a2.752,2.752,0,0,1-2.75,2.75ZM1.5,14.75A1.251,1.251,0,0,0,2.75,16h12A1.251,1.251,0,0,0,16,14.75V8H1.5ZM16,6.5V4.75A1.251,1.251,0,0,0,14.75,3.5h-12A1.251,1.251,0,0,0,1.5,4.75V6.5Z" transform="translate(3.25 3.25)" fill="#FFFFFF"></path> </g></svg>
                            <div className='text-left text-white pl-2'>Timetable</div>
                        </button>
                    </Link>
                    <button className='flex items-center h-8 rounded-md hover:bg-neutral-600'>
                        <svg width="21" height="21" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.7003 17.1099V18.22C12.7003 18.308 12.6829 18.395 12.6492 18.4763C12.6156 18.5576 12.5662 18.6316 12.504 18.6938C12.4418 18.7561 12.3679 18.8052 12.2867 18.8389C12.2054 18.8725 12.1182 18.8899 12.0302 18.8899C11.9423 18.8899 11.8551 18.8725 11.7738 18.8389C11.6925 18.8052 11.6187 18.7561 11.5565 18.6938C11.4943 18.6316 11.4449 18.5576 11.4113 18.4763C11.3776 18.395 11.3602 18.308 11.3602 18.22V17.0801C10.9165 17.0072 10.4917 16.8468 10.1106 16.6082C9.72943 16.3695 9.39958 16.0573 9.14023 15.6899C9.04577 15.57 8.99311 15.4226 8.99023 15.27C8.99148 15.1842 9.00997 15.0995 9.04459 15.021C9.0792 14.9425 9.12927 14.8718 9.19177 14.813C9.25428 14.7542 9.32794 14.7087 9.40842 14.679C9.4889 14.6492 9.57455 14.6359 9.66025 14.6399C9.74504 14.6401 9.82883 14.6582 9.90631 14.6926C9.98379 14.7271 10.0532 14.7773 10.1102 14.8401C10.4326 15.2576 10.8657 15.5763 11.3602 15.76V13.21C10.0302 12.69 9.36023 11.9099 9.36023 10.8999C9.38027 10.3592 9.5928 9.84343 9.9595 9.44556C10.3262 9.04769 10.8229 8.79397 11.3602 8.72998V7.62988C11.3602 7.5419 11.3776 7.45482 11.4113 7.37354C11.4449 7.29225 11.4943 7.21847 11.5565 7.15625C11.6187 7.09403 11.6925 7.04466 11.7738 7.01099C11.8551 6.97732 11.9423 6.95996 12.0302 6.95996C12.1182 6.95996 12.2054 6.97732 12.2867 7.01099C12.3679 7.04466 12.4418 7.09403 12.504 7.15625C12.5662 7.21847 12.6156 7.29225 12.6492 7.37354C12.6829 7.45482 12.7003 7.5419 12.7003 7.62988V8.71997C13.0724 8.77828 13.4289 8.91103 13.7485 9.11035C14.0681 9.30967 14.3442 9.57137 14.5602 9.87988C14.6555 9.99235 14.7117 10.1329 14.7202 10.28C14.7229 10.3662 14.7084 10.4519 14.6776 10.5325C14.6467 10.613 14.6002 10.6867 14.5406 10.749C14.481 10.8114 14.4096 10.8613 14.3306 10.8958C14.2516 10.9303 14.1665 10.9487 14.0802 10.95C13.99 10.9475 13.9013 10.9257 13.8202 10.886C13.7391 10.8463 13.6675 10.7897 13.6102 10.72C13.3718 10.4221 13.0575 10.1942 12.7003 10.0601V12.3101L12.9503 12.4099C14.2203 12.9099 15.0103 13.63 15.0103 14.77C14.9954 15.3808 14.7481 15.9629 14.3189 16.3977C13.8897 16.8325 13.3108 17.0871 12.7003 17.1099ZM11.3602 11.73V10.0999C11.1988 10.1584 11.0599 10.2662 10.963 10.408C10.8662 10.5497 10.8162 10.7183 10.8203 10.8899C10.8173 11.0676 10.8669 11.2424 10.963 11.3918C11.0591 11.5413 11.1973 11.6589 11.3602 11.73ZM13.5502 14.8C13.5502 14.32 13.2203 14.03 12.7003 13.8V15.8C12.9387 15.7639 13.1561 15.6427 13.3123 15.459C13.4685 15.2752 13.553 15.0412 13.5502 14.8Z" fill="#FFFFFF"></path> <path d="M18 3.96997H6C4.93913 3.96997 3.92172 4.39146 3.17157 5.1416C2.42142 5.89175 2 6.9091 2 7.96997V17.97C2 19.0308 2.42142 20.0482 3.17157 20.7983C3.92172 21.5485 4.93913 21.97 6 21.97H18C19.0609 21.97 20.0783 21.5485 20.8284 20.7983C21.5786 20.0482 22 19.0308 22 17.97V7.96997C22 6.9091 21.5786 5.89175 20.8284 5.1416C20.0783 4.39146 19.0609 3.96997 18 3.96997Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        <div className='text-left text-white pl-2'>Costs</div>
                    </button>
                    <button className='flex items-center h-8 rounded-md hover:bg-neutral-600'>
                        <svg width="21" height="21" fill="#FFFFFF" viewBox="0 0 35 35" data-name="Layer 2" id="Layer_2" xmlns="http://www.w3.org/2000/svg" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,33.81a1.24,1.24,0,0,1-.33,0L1.17,30.92a1.26,1.26,0,0,1-.92-1.21V2.35a1.26,1.26,0,0,1,.49-1,1.28,1.28,0,0,1,1.09-.21L12.34,4a1.25,1.25,0,0,1-.66,2.41L2.75,4V28.75l9.59,2.6A1.25,1.25,0,0,1,12,33.81Z"></path><path d="M33.5,33.9a1.24,1.24,0,0,1-.33,0L22.66,31a1.25,1.25,0,0,1-.92-1.21V2.44a1.23,1.23,0,0,1,.49-1,1.25,1.25,0,0,1,1.09-.22L33.83,4.08a1.26,1.26,0,0,1,.92,1.21V32.65a1.26,1.26,0,0,1-.49,1A1.3,1.3,0,0,1,33.5,33.9Zm-9.26-5,8,2.17V6.25l-8-2.18Z"></path><path d="M12.31,33.9a1.3,1.3,0,0,1-.76-.25,1.26,1.26,0,0,1-.49-1V5.29A1.26,1.26,0,0,1,12,4.08L22.49,1.23a1.25,1.25,0,1,1,.66,2.42l-9.59,2.6V31l8.93-2.42A1.25,1.25,0,1,1,23.15,31L12.64,33.86A1.24,1.24,0,0,1,12.31,33.9Z"></path></g></svg>
                        <div className='text-left text-white pl-2'>Map</div>
                    </button>
                </div>
            )}
        </div>

    </div>
    )

}; 

export default TripView;