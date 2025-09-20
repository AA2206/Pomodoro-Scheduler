CREATE TABLE IF NOT EXISTS work_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT NOT NULL,
    date_time TEXT, 
    time_spent INTEGER, 
    work_time INTEGER, 
    break_time INTEGER 
); 