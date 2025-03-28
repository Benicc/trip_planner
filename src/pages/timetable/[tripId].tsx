import { useRouter } from "next/router";
import TripView from "~/components/navbar";
import Timetable from "~/components/timetable";

export default function test() {
    const router = useRouter()
    const {tripId} = router.query
    return (
        <div className="min-w-[1200px] h-screen bg-[#121212]">
            <TripView tripId={String(tripId)} tripName={""} navType="Timetable"/>
            <div className="h-[60%]">
            <Timetable/>
            </div>
        </div>
    );
}