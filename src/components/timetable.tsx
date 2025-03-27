import React, { useState } from "react";
import { addDays, format, startOfWeek, subDays } from "date-fns";

export default function Timetable() {
  const times = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];

  // State to track the current week's start date
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Function to move forward/backward by a week
  const changeWeek = (direction: number) => {
    setStartDate((prev) => (direction === 1 ? addDays(prev, 7) : subDays(prev, 7)));
  };

  // Example events (this can come from an API)
  const events = [
    { date: "2025-03-25", time: "9 AM", title: "Math Class" },
    { date: "2025-03-26", time: "10 AM", title: "Science Lecture" },
    { date: "2025-03-27", time: "2 PM", title: "History Seminar" },
    { date: "2025-03-29", time: "12 PM", title: "Programming Workshop" },
  ];

  // Generate the week days dynamically
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Convert events into a lookup table
  const eventMap = events.reduce((acc, event) => {
    acc[`${event.date}-${event.time}`] = event.title;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Weekly Timetable</h2>

      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeWeek(-1)} className="px-3 py-2 bg-gray-300 rounded">← Previous Week</button>
        <h3 className="text-lg font-semibold">{format(startDate, "MMMM d, yyyy")} - {format(addDays(startDate, 6), "MMMM d, yyyy")}</h3>
        <button onClick={() => changeWeek(1)} className="px-3 py-2 bg-gray-300 rounded">Next Week →</button>
      </div>

      {/* Timetable */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2">Time / Date</th>
              {weekDays.map((day) => (
                <th key={day.toString()} className="border px-4 py-2">
                  {format(day, "EEE, MMM d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td className="border px-4 py-2">{time}</td>
                {weekDays.map((day) => {
                  const key = `${format(day, "yyyy-MM-dd")}-${time}`;
                  return (
                    <td
                      key={key}
                      className={`border px-4 py-2 text-center ${
                        eventMap[key] ? "bg-blue-500 text-white font-bold" : "bg-gray-100"
                      }`}
                    >
                      {eventMap[key] || ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}