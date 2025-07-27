import mysql.connector
from dotenv import load_dotenv
import os
import pandas as pd
from datetime import datetime

load_dotenv()

connection = mysql.connector.connect(
    host='localhost',
    user= os.getenv('DB_USER'),
    password= os.getenv('DB_PASSWORD'),
    database= os.getenv('DB_NAME')
)


cursor = connection.cursor()

query = """
SELECT distinct tripId FROM trip
"""

cursor.execute(query)
rows = list(map(lambda x: x[0], cursor.fetchall()))

print(rows)


query = """
    SELECT
        tripId,
        AVG(count) AS avg_count,
        AVG(timetableCount) AS avg_timetable,
        AVG(costCount) AS avg_cost,
        STDDEV(count) AS std_count,
        STDDEV(timetableCount) AS std_timetable,
        STDDEV(costCount) AS std_cost,

        -- Median count
        CAST(
        SUBSTRING_INDEX(
            SUBSTRING_INDEX(
            GROUP_CONCAT(count ORDER BY count), 
            ',', 
            FLOOR(COUNT(*) / 2) + 1
            ), 
            ',', 
            -1
        ) AS DECIMAL(10,2)
        ) AS median_count,

        -- Median timetableCount
        CAST(
        SUBSTRING_INDEX(
            SUBSTRING_INDEX(
            GROUP_CONCAT(timetableCount ORDER BY timetableCount), 
            ',', 
            FLOOR(COUNT(*) / 2) + 1
            ), 
            ',', 
            -1
        ) AS DECIMAL(10,2)
        ) AS median_timetable,

        -- Median costCount
        CAST(
        SUBSTRING_INDEX(
            SUBSTRING_INDEX(
            GROUP_CONCAT(costCount ORDER BY costCount), 
            ',', 
            FLOOR(COUNT(*) / 2) + 1
            ), 
            ',', 
            -1
        ) AS DECIMAL(10,2)
        ) AS median_cost

    FROM action
    GROUP BY tripId
"""


cursor.execute(query)
rows = cursor.fetchall()
columns = [i[0] for i in cursor.description]

df = pd.DataFrame(rows, columns=columns)
print(df)

timestamp = datetime.now().strftime('%d-%m-%Y_%H-%M-%S')
df.to_csv(f"data/trip_stats_{timestamp}.csv", index=False)


cursor.close()
connection.close()