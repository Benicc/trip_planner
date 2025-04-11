import cron from "node-cron";
import { db } from "~/server/db";
import { actionCounters } from "./actionCounters";
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
});
