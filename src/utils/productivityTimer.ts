import cron from "node-cron";
import { db } from "~/server/db";
import { actionCounters, timetableActionCounters, costActionCounters} from "./actionCounters";
import { v4 as uuidv4 } from 'uuid';

cron.schedule("* * * * *", async () => {
  const now = new Date();

  for (const [tripId, typeCounts] of Object.entries(actionCounters)) {
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > 0) {
        await db.action.create({
          data: {
            actionId: String(uuidv4()),
            tripId,
            type,
            dateTime: now.toISOString(),
            count,
          }
        });

        if (!actionCounters[tripId]) {actionCounters[tripId] = {};}
            if (type == "AI" || type == "GUI") {
                actionCounters[tripId][type] = 0;
            }
      }
    }
  }

  for (const [tripId, typeCounts] of Object.entries(costActionCounters)) {
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > 0) {
        // await db.action.create({
        //   data: {
        //     actionId: String(uuidv4()),
        //     tripId,
        //     type,
        //     dateTime: now.toISOString(),
        //     count,
        //   }
        // });

        if (!costActionCounters[tripId]) {costActionCounters[tripId] = {};}
            if (type == "AI" || type == "GUI") {
                costActionCounters[tripId][type] = 0;
            }
      }
    }
  }

  for (const [tripId, typeCounts] of Object.entries(timetableActionCounters)) {
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > 0) {
        // await db.action.create({
        //   data: {
        //     actionId: String(uuidv4()),
        //     tripId,
        //     type,
        //     dateTime: now.toISOString(),
        //     count,
        //   }
        // });

        if (!timetableActionCounters[tripId]) {timetableActionCounters[tripId] = {};}
            if (type == "AI" || type == "GUI") {
                timetableActionCounters[tripId][type] = 0;
            }
      }
    }
  }
});
