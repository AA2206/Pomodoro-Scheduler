const sqlite3 = require('sqlite3').verbose();

// Connect to your database file (Change 'your_database.db' to your actual database file)
const db = new sqlite3.Database('work_stats.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
        printAllData();
    }
});

// Function to get all table names
function getAllTables() {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                reject(err);
            } else {
                resolve(tables.map(table => table.name));
            }
        });
    });
}

// Function to print all data from all tables
async function printAllData() {
    try {
        const tables = await getAllTables();
        if (tables.length === 0) {
            console.log('No tables found in the database.');
            db.close();
            return;
        }

        for (const table of tables) {
            console.log(`\n===== Table: ${table} =====`);
            await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                    if (err) {
                        console.error(`Error fetching data from ${table}:`, err.message);
                        reject(err);
                    } else {
                        console.table(rows);
                        resolve();
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        db.close(() => console.log('Database connection closed.'));
    }
}
