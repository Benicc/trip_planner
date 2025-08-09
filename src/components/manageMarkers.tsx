import React, { useEffect, useState } from "react";
import { api } from '~/utils/api';
import { useRouter } from "next/router";
import { v4 as uuidv4 } from 'uuid';


interface PopupProps {
    onClose: () => void;
    getMarkers: any;
}

const MarkersPopup: React.FC<PopupProps> = ({getMarkers, onClose}) => {
    const router = useRouter();
    const {tripId} = router.query;

    const [currentMarkers, setCurrentMarkers] = useState<{markerId: string, lat: number, lng: number, label: string}[]>([]);
    const [deletedMarkers, setDeletedMarkers] = useState<string[]>([]);

    const deleteMarkersMutation = api.map.deleteMarkers.useMutation({
        onSuccess: newMarkers => {
            console.log("success")
        },
    })

    useEffect(() => {
        if (getMarkers.data) {
            setCurrentMarkers(
                getMarkers.data
                .map((marker: {id: string, lat: number, lng: number, label: string}) => ({
                    markerId: marker.id,
                    lat: marker.lat,
                    lng: marker.lng,
                    label: marker.label,
                })),
            );
        }
    }, [getMarkers.data]);


    function removeMarker(id: string): void {
        const newMarkers = currentMarkers.filter((marker) => marker.markerId !== id);
        setCurrentMarkers(newMarkers);
        setDeletedMarkers([...deletedMarkers, id]);
        
    }

    const handleUpdate = () => {

        deleteMarkersMutation.mutateAsync(deletedMarkers);

        setDeletedMarkers([]);
        getMarkers.refetch();
        onClose();
    
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col justify-between bg-white p-8 rounded-lg shadow-lg space-y-4 w-[400px]">
                <h1 className="text-xl font-bold">Delete Markers</h1>

                <div className="max-h-[300px] overflow-y-auto">
                    {currentMarkers?.map((marker) => (
                    marker && marker.markerId ? (
                        <div key={marker.markerId} className="flex items-center justify-between space-x-4">
                            <div>{marker.label}</div>
                            <button className="px-4 py-2" onClick={() => {removeMarker(marker.markerId)}}>
                                <svg height="21" width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            </button>
                        </div>
                    ) : null
                    ))}
                </div>

                
                <div className="flex justify-between items-center w-full">
                    <button onClick={onClose} className="border border-2 px-4 py-2">Cancel</button>
                    <button onClick={() => {handleUpdate()}} className="border border-2 px-4 py-2 bg-red-500 text-white">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default MarkersPopup;