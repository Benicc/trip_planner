import { useRouter } from "next/router";
import TripView from "~/components/navbar";


export default function Cost() {
    const router = useRouter()
    const {tripId} = router.query

    return (
        <div className="min-w-[1200px] h-screen bg-[#121212]">
            <TripView tripId={String(tripId)} tripName={""} navType="Costs"/>
            <div className="h-[60%]">
                {/* <CostTable tripId={String(tripId)}/> */}
            </div>
        </div>
    );
};