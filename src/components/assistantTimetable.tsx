import React, { useState } from "react";
import { addDays, format, set, startOfWeek, subDays } from "date-fns";
import PlanPopup from "./createPlan";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Details from "./details";
import DeletePopup from "./deletePlan";
import { assert } from "console";
import EditPlanPopup from "./editPlan";
import { v4 as uuidv4 } from 'uuid';
import ApplyChangesPopup from "./applyAssistant";



interface PlansProps {
    plans: any[];
}


function generateTimeArray(): string[] {
  const times: string[] = [];
  
  // Loop through hours (0-23) and minutes (00, 15, 30, 45)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      // Format the hour and minute to "HH:mm"
      const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push(formattedTime);
    }
  }
  
  // Add 24:00 as the final time
  times.push("24:00");

  return times;
}

const roundToNearestQuarter = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);

  // Calculate total minutes from midnight
  const totalMinutes = hours! * 60 + minutes!;
  
  // Round total minutes to the nearest 15-minute interval
  const roundedMinutes = Math.round(totalMinutes / 15) * 15;
  
  // Calculate the new rounded hour and minute
  const roundedHours = Math.floor(roundedMinutes / 60);
  const finalMinutes = roundedMinutes % 60;

  // Return formatted time
  return `${String(roundedHours).padStart(2, "0")}:${String(finalMinutes).padStart(2, "0")}`;
};

const AssistantTimetable: React.FC<PlansProps> = ({ plans }) => {
  const router = useRouter();
  const {tripId} = router.query;
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [details, setDetails] = useState({});

  let times = generateTimeArray()
  //["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];

  // State to track the current week's start date
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Function to move forward/backward by a week
  const changeWeek = (direction: number) => {
    setStartDate((prev) => (direction === 1 ? addDays(prev, 7) : subDays(prev, 7)));
  };


  const events = plans;

  // Generate the week days dynamically
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Convert times into an index for easier comparison
  const timeIndexMap = Object.fromEntries(times.map((time, index) => [time, index]));

  // Convert events into a lookup table for easier rendering
  const eventMap: Record<string, { colour:string; planId: string; planName: string; span: number} | null> = {};

  const eventIndexMap: Record<string, number> = {};

  events?.forEach((event, index) => {
    const eventDay = event.date;
    const startIdx = timeIndexMap[roundToNearestQuarter(event.startTime)];
    const endIdx = timeIndexMap[roundToNearestQuarter(event.endTime)];
    eventIndexMap[event.planId] = index;

    if (startIdx !== undefined && endIdx !== undefined) {
      for (let i = startIdx; i < endIdx; i++) {
        const key = `${eventDay}-${times[i]}`;
        eventMap[key] = i === startIdx ? { colour: event.colour, planId: event.planId, planName: event.planName, span: endIdx - startIdx} : null; // Only display planName on first row
      }
    }
  });

  console.log(events);

  return (
    <div className="h-full pt-2 w-full min-w-[800px] bg-[#121212] z-20">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeWeek(-1)} className="px-3 py-2 bg-gray-300 rounded">← Previous Week</button>
        <h3 className="text-lg font-semibold text-white">
          {format(startDate, "MMMM d, yyyy")} - {format(addDays(startDate, 6), "MMMM d, yyyy")}
        </h3>
        <button onClick={() => changeWeek(1)} className="px-3 py-2 bg-gray-300 rounded">Next Week →</button>
      </div>

      {/* Timetable */}
      <div className="sticky top-0 bg-[#121212] flex w-full border justify-around">
            <div className="px-4 py-2 text-white">Time / Date</div>
            {weekDays.map((day) => (
              <div key={day.toString()} className="px-4 py-2 text-white">
                {format(day, "EEE, MMM d")}
              </div>
            ))}
      </div>
      <div className="h-[55%] overflow-auto">
        <table className="w-full table-fixed min-w-max border-collapse">
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
                <td className="border px-4 py-[0.05px] text-white text-xs">{time}</td>
                {weekDays.map((day) => {
                  const key = `${format(day, "yyyy-MM-dd")}-${time}`;
                  const event = eventMap[key];

                  if (event === null) return null; // Skip rendering if part of a merged row

                  return (
                    <td
                      key={key}
                      className="relative border border-neutral-500 px-4 py-[0.5px] text-center text-white font-bold"
                      rowSpan={event?.span || 1}
                    >
                      <div className="w-full h-full absolute top-0 left-0">
                      { (event?.planName !== undefined) &&<button 
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
                        className={`w-full h-full ${event?.colour}`}>{event?.planName}
                      </button>}
                      </div>
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
          <button onClick={() => setShowPopup(!showPopup)} className="text-white w-[25%] h-12 bg-gray-800 rounded-xl">Apply Changes</button>
        </div>
      </div>
      {showPopup && <ApplyChangesPopup onClose={() => setShowPopup(!showPopup)} plans={plans}/>}
    </div>
  );
}

export default AssistantTimetable;
