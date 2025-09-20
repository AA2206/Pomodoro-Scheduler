const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class Database {
  constructor(sql, db, tableName) {
    this.sql = sql;
    this.db = db;
    this.tableName = tableName;
  }

  initDb() {
    const connection = new sqlite3.Database(this.db);
    const sqlScript = fs.readFileSync(this.sql, 'utf-8');
    connection.exec(sqlScript, (err) => {
      if (err) {
        console.error('Error initializing database:', err.message);
      } else {
        console.log('Database initialized successfully.');
      }
    });
    connection.close();
  }

  getAll() {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${this.tableName}`;
      connection.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        connection.close();
      });
    });
  }

  getTask(colName, col2Name, value, dateTime) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const query = `SELECT ${colName} FROM ${this.tableName} WHERE ${col2Name} = ? AND date_time = ?`;
      connection.get(query, [value, dateTime], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row[colName] : null);
        }
        connection.close();
      });
    });
  }

  getSpecific(colName, col2Name, value) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const query = `SELECT ${colName} FROM ${this.tableName} WHERE ${col2Name} = ?`;
      connection.get(query, [value], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row[colName] : null);
        }
        connection.close();
      });
    });
  }

  getWorkSpecific(colName, username, date_time) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      // Update query to check both username and date_time
      const query = `SELECT ${colName} FROM ${this.tableName} WHERE username = ? AND date_time = ?`;
  
      // Pass the username and date_time values
      connection.get(query, [username, date_time], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row[colName] : null);  // Return the specific column value or null if no match
        }
        connection.close();
      });
    });
  }

  getSubset(colName, col2Name, value) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
        const query = `SELECT ${colName} FROM ${this.tableName} WHERE ${col2Name} = ?`;
        connection.all(query, [value], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); 
            }
            connection.close();
        });
    });
  }

  getTasks(colName, col2Name, value, date_time) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
        const query = `SELECT ${colName} FROM ${this.tableName} WHERE ${col2Name} = ? AND date_time = ?`;
        connection.all(query, [value, date_time], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); 
            }
            connection.close();
        });
    });
  }

  insert(columns, values) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const placeholders = values.map(() => '?').join(', ');
      const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
      connection.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
        connection.close();
      });
    });
  }

  updateTable(columnName, value, column2Name, value2) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const query = `UPDATE ${this.tableName} SET ${columnName} = ? WHERE ${column2Name} = ?`;
      connection.run(query, [value, value2], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
        connection.close();
      });
    });
  }

  updateWorkTable(columnName, value, username, date_time) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      // Modify the query to update a row where both username and date_time match
      const query = `UPDATE ${this.tableName} SET ${columnName} = ? WHERE username = ? AND date_time = ?`;
  
      // Pass the values for the column and the specific username and date_time
      connection.run(query, [value, username, date_time], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);  // Returns the number of rows affected by the update
        }
        connection.close();
      });
    });
  }

  deleteRow(id) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      connection.run(query, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
        connection.close();
      });
    });
  }

  checkExistence(columnName, value) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      const query = `SELECT 1 FROM ${this.tableName} WHERE ${columnName} = ?`;
      connection.get(query, [value], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? true : false);
        }
        connection.close();
      });
    });
  }

  checkWorkExistence(username, date_time) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
      // Modify the query to check both username and date_time columns
      const query = `SELECT 1 FROM ${this.tableName} WHERE username = ? AND date_time = ?`;
      
      // Pass both values in the query parameters
      connection.get(query, [username, date_time], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? true : false);
        }
        connection.close();
      });
    });
  }

  getAllTasksForUser(username) {
    const connection = this.getDbConnection();
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${this.tableName} WHERE username = ?`;
        connection.all(query, [username], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            connection.close();
        });
    });
  }

  getWorkStatsEntries(username, input_date){
    const connection = this.getDbConnection(); 
    const today = new Date(input_date);
    const dayOfWeek = today.getDay();
    const lastMonday = new Date(today);
  
    if (dayOfWeek === 0) {
      lastMonday.setDate(today.getDate() - 6);
    } else {
      lastMonday.setDate(today.getDate() - (dayOfWeek - 1));
    }
  
    const datesArr = [];
  
    for (let dt = new Date(lastMonday); dt <= today; dt.setDate(dt.getDate() + 1)) {
      datesArr.push(new Date(dt).toDateString());
    }
  
    const queryConditions = datesArr
      .map(date => `date_time = '${date}'`)
      .join(' OR ');
  
    const query = `SELECT * FROM ${this.tableName} WHERE username = ? AND (${queryConditions})`;
  
    return new Promise((resolve, reject) => {
      connection.all(query, [username], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        connection.close();
      });
    });
  }
  

  getDbConnection() {
    const connection = new sqlite3.Database(this.db, (err) => {
      if (err) {
        console.error('Error connecting to database:', err.message);
      }
    });
    return connection;
  }

}

module.exports = Database;