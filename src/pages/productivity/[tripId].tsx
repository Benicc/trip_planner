import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";


export default function Productivity() {
    const router = useRouter()
    const {tripId} = router.query

    const [dataAI, setDataAI] = useState<{ dateTime: Date; count: number; actionId: string; }[]>([]);
    const [dataGUI, setDataGUI] = useState<{ dateTime: Date; count: number; actionId: string; }[]>([]);

    const { data: dataActionAI, 
        isLoading: isLoadingAI, 
        error: errorAI, 
        refetch: refetchAI} = api.database.getAIActions.useQuery(String(tripId));
    const { data: dataActionGUI, 
        isLoading: isLoadingGUI, 
        error: errorGUI, 
        refetch: refetchGUI} = api.database.getGUIActions.useQuery(String(tripId));

    useEffect(() => {
        if (dataActionAI && !isLoadingAI) {
            setDataAI(dataActionAI);
        }
        if (dataActionGUI && !isLoadingGUI) {
            setDataGUI(dataActionGUI);
            }
        console.log("AI Actions: ", dataActionAI);
        console.log("GUI Actions: ", dataActionGUI);
    }, [dataActionAI, dataActionGUI]);

    useEffect(() => {
    const interval = setInterval(() => {refetchAI();refetchGUI();}, 10000); // Refetch every 10 seconds

    return () => clearInterval(interval) // Cleanup on unmount
    }, []);
    
    return (
        <div className="text-white">
        </div>
    );
}