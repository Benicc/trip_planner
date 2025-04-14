import { useRouter } from "next/router";
import { use, useEffect, useRef, useState } from "react";
import LineChart from "~/components/chart";
import TripView from "~/components/navbar";
import { api } from "~/utils/api";
import { ChartData, ChartOptions } from 'chart.js';
import { set } from "date-fns";

const chartAIOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'AI APM Productivity',
        font: {
            size: 20, // 👈 Change this to your desired font size
            weight: 'normal', // optional: 'normal' | 'bold' | number
        }
      },
    },
  };

  const chartGUIOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'GUI APM Productivity',
        font: {
            size: 20, // 👈 Change this to your desired font size
            weight: 'normal', // optional: 'normal' | 'bold' | number
        }
      },
    },
  };


export default function Productivity() {
    const router = useRouter()
    const {tripId} = router.query

    const [dataAI, setDataAI] = useState<{ dateTime: Date; count: number; actionId: string; }[]>([]);
    const [dataGUI, setDataGUI] = useState<{ dateTime: Date; count: number; actionId: string; }[]>([]);
    const [AIChartData, setAIChartData] = useState<ChartData<'line'>>({labels: [], datasets: []});
    const [GUIChartData, setGUIChartData] = useState<ChartData<'line'>>({labels: [], datasets: []});
    const [toggleChart, setToggleChart] = useState(true);

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

    
    useEffect(() => {
        //load AI data
        let labelsAI = [];
        let dataListAI = [];
        const AIDataSize = dataAI.length;
        for (let i = 0; i < AIDataSize; i++){
            if (dataAI[i] !== null) {
                if (dataAI[i]?.dateTime) {
                    const formattedDate = new Date(dataAI[i]?.dateTime ?? new Date()).toLocaleString();
                    labelsAI.push(formattedDate);
                }
                if (dataAI[i]?.count) {
                    dataListAI.push(dataAI[i]?.count);
                }
                
            }
        }

        let labelsGUI = [];
        let dataListGUI = [];
        const GUIDataSize = dataGUI.length;
        for (let i = 0; i < GUIDataSize; i++){
            if (dataGUI[i] !== null) {
                if (dataGUI[i]?.dateTime) {
                    const formattedDate = new Date(dataGUI[i]?.dateTime ?? new Date()).toLocaleString();
                    labelsGUI.push(formattedDate);
                }
                if (dataGUI[i]?.count) {
                    dataListGUI.push(dataGUI[i]?.count);
                }
                
            }
        }

        setAIChartData({
            labels: labelsAI, // x-axis labels
            datasets: [
              {
                label: 'AI APM',           // Name shown in the legend
                data: dataListAI.filter((value): value is number => value !== undefined), // y-values for each x-label
                borderColor: 'rgba(0, 255, 127, 1)',     // Line color
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill under the line (optional)
                tension: 0,                         // Line curve (0 = straight lines)
              },
            ],

        });
        setGUIChartData({
            labels: labelsGUI, // x-axis labels
            datasets: [
              {
                label: 'GUI APM',           // Name shown in the legend
                data: dataListGUI.filter((value): value is number => value !== undefined), // y-values for each x-label
                borderColor: 'rgb(75, 192, 192)',     // Line color
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill under the line (optional)
                tension: 0,                         // Line curve (0 = straight lines)
              },
            ],
        });
    }, [dataActionAI, dataActionGUI]); // Re-run when dataActionAI or dataActionGUI changes
    
    return (
        <div className="h-screen w-screen">
            <div className="flex w-full justify-between items-center">
                <TripView tripId={String(tripId)} tripName={""} navType={"Productivity"} />
                <button 
                    className="text-white h-8 rounded-lg bg-[#282828] pl-4 pr-4 mr-2 hover:bg-[#383838]"
                    onClick={() => {
                        setToggleChart(!toggleChart);
                        refetchAI();
                        refetchGUI();
                    }}
                >Toggle Chart</button>
            </div>

            {toggleChart &&
                <div className="flex justify-center w-full h-[90%] min-w-[1200px]">
                    <LineChart data={AIChartData} options={chartAIOptions}/>
                </div>
            }
            {!toggleChart &&
            <div className="flex justify-center w-full h-[90%] min-w-[1200px]">
                <LineChart data={GUIChartData} options={chartGUIOptions}/>
            </div>
            }

        </div>
    );
}