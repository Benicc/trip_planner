import React, { useState } from "react";
import { addDays, format, set, startOfWeek, subDays } from "date-fns";
import PlanPopup from "./createPlan";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Details from "./details";
import DeletePopup from "./deletePlan";


const roundTime = (time: string, type:string): string => {
  const [hours, minutes] = time.split(':').map(Number); // Split time into hours and minutes

  if (hours != undefined && minutes != undefined) {
    // Round the time based on the minutes (if minutes are 30 or more, round up to the next hour)
    let roundedHours = hours;
    if (type == "end" && minutes >= 1) {
      roundedHours = (hours + 1) % 24; // Round up and handle 24:00 correctly
    }

    // Return the rounded time in HH:00 format
    return `${String(roundedHours).padStart(2, '0')}:00`;
  }
  return "00:00"
};

export default function Timetable() {
  const router = useRouter();
  const {tripId} = router.query;
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [details, setDetails] = useState({});

  let times = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];


  console.log(roundTime("14:30", "end"))
  // State to track the current week's start date
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Function to move forward/backward by a week
  const changeWeek = (direction: number) => {
    setStartDate((prev) => (direction === 1 ? addDays(prev, 7) : subDays(prev, 7)));
  };

  // Example events with start and end times
  const {data, isLoading, isError, error} = api.database.getPlans.useQuery(String(tripId));

  const events = data

  // const events = [
  //   { date: "2025-03-25", startTime: "09:00", endTime: "11:00", planName: "Math Class", colour:"bg-blue-500"},
  //   { date: "2025-03-26", startTime: "10:00", endTime: "13:00", planName: "Science Lecture", colour:"bg-yellow-500" },
  //   { date: "2025-03-27", startTime: "14:00", endTime: "19:00", planName: "History Seminar", colour:"bg-green-500" },
  //   { date: "2025-03-29", startTime: "12:00", endTime: "14:00", planName: "Programming Workshop", colour:"bg-red-500"},
  // ];

  // Generate the week days dynamically
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Convert times into an index for easier comparison
  const timeIndexMap = Object.fromEntries(times.map((time, index) => [time, index]));

  // Convert events into a lookup table for easier rendering
  const eventMap: Record<string, { colour:string; planId: string; planName: string; span: number } | null> = {};

  const eventIndexMap: Record<string, number> = {};

  events?.forEach((event, index) => {
    const eventDay = event.date;
    const startIdx = timeIndexMap[roundTime(event.startTime, "start")];
    const endIdx = timeIndexMap[roundTime(event.endTime, "end")];
    eventIndexMap[event.planId] = index;

    if (startIdx !== undefined && endIdx !== undefined) {
      for (let i = startIdx; i < endIdx; i++) {
        const key = `${eventDay}-${times[i]}`;
        eventMap[key] = i === startIdx ? { colour: event.colour, planId: event.planId, planName: event.planName, span: endIdx - startIdx } : null; // Only display planName on first row
      }
    }
  });

  console.log(eventIndexMap);

  return (
    <div className="h-full min-w-[1200px] bg-[#121212] z-10">
      <h2 className="text-xl font-bold mb-4 text-center text-white">Trip Timetable</h2>

      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeWeek(-1)} className="px-3 py-2 bg-gray-300 rounded">← Previous Week</button>
        <h3 className="text-lg font-semibold text-white">
          {format(startDate, "MMMM d, yyyy")} - {format(addDays(startDate, 6), "MMMM d, yyyy")}
        </h3>
        <button onClick={() => changeWeek(1)} className="px-3 py-2 bg-gray-300 rounded">Next Week →</button>
      </div>

      {/* Timetable */}
      <div className="h-[90%] overflow-auto">
        <div className="sticky top-0 bg-[#121212] flex w-full border justify-around">
            <div className="px-4 py-2 text-white">Time / Date</div>
            {weekDays.map((day) => (
              <div key={day.toString()} className="px-4 py-2 text-white">
                {format(day, "EEE, MMM d")}
              </div>
            ))}
        </div>
        <table className="w-full table-fixed min-w-max">
          {/* <thead className="h-[50%]">
            <tr>
              <th className="px-4 py-2 text-white border">Time / Date</th>
              {weekDays.map((day) => (
                <th key={day.toString()} className="border px-4 py-2 text-white">
                  {format(day, "EEE, MMM d")}
                </th>
              ))}
            </tr>
          </thead> */}
          <tbody>
            {times.map((time, timeIdx) => (
              <tr key={time}>
                <td className="border px-4 py-2 text-white">{time}</td>
                {weekDays.map((day) => {
                  const key = `${format(day, "yyyy-MM-dd")}-${time}`;
                  const event = eventMap[key];

                  if (event === null) return null; // Skip rendering if part of a merged row

                  return (
                    <td
                      key={key}
                      className={`border px-4 py-2 text-center ${
                        event ? `${event.colour} text-white font-bold` : ""
                      }`}
                      rowSpan={event?.span || 1}
                    >
                      <button 
                          onClick={() => {
                            if (events !== undefined && event?.planId !== undefined) {
                              const index = eventIndexMap[event.planId];
                              if (index !== undefined) {
                                setDetails(events[index] || {});
                              } else {
                                setDetails({});
                              }
                            } else {
                              setDetails({});
                            }
                          }}
                        className="w-full h-full min-h-full">{event?.planName || ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-4 space-y-4">
        <Details plan={details}/>
        <div className="flex space-x-4 ml-2">
          <button onClick={() => setShowPopup(!showPopup)} className="text-white w-[25%] h-12 bg-gray-800 rounded-xl">Create Plan</button>
          {Object.keys(details).length > 0 && (
            <div className="w-full space-x-4">
              <button className="text-white w-[25%] h-12 bg-gray-800 rounded-xl">Edit Plan</button>
              <button onClick={() => setShowDeletePopup(!showDeletePopup)} className="text-white w-[25%] h-12 bg-red-500 rounded-xl">Delete Plan</button>
            </div>
          )}
        </div>
      </div>
      {showPopup && <PlanPopup onClose={() => setShowPopup(!showPopup)}/>}
      {showDeletePopup && <DeletePopup onClose={() => setShowDeletePopup(!showDeletePopup)} planId={(details as { planId?: string }).planId ?? ""} planName={(details as { planName?: string }).planName ?? ""}/>}
      
    </div>
  );
}
