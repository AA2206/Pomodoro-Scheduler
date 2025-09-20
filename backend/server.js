const express = require('express')
const session = require('express-session');
const cors = require('cors'); 
const path = require('path')
const bcrypt = require('bcryptjs');
const MongoClient = require('mongodb')
const Database = require('./Database'); 
const DatabaseMongo = require('./DatabaseMongo'); 

const app = express(); 

const url = "mongodb+srv://arpanag06:MongoDB4%40rpN%211@pomodoro-planner.9yrkknx.mongodb.net/";

const users = new DatabaseMongo(); 
const tasks = new DatabaseMongo(); 
const workStats = new DatabaseMongo(); 

console.log("hello"); 

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

async function initializeDatabases() {
    await users.connect(url, "users_data", "users"); 
    await tasks.connect(url, "users_data", "tasks"); 
    await workStats.connect(url, "users_data", "workStats"); 
}

initializeDatabases().then(() => {
    console.log("Databases initialized");
    
    const port = process.env.PORT || 5001; // Use Heroku's port or fallback to 5001 for local development
    app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
    });


}).catch((err) => {
    console.error("Error initializing databases:", err);
    process.exit(1);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false, 
    saveUninitialized: false,
}));

app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    const userExists = await users.read({user: username});
    if (userExists != null) {
        return res.status(400).send('Username already registered.');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
        const userId = await users.create({user: username, passcode: hashedPassword}); 
        return res.status(201).send();
    } catch (err) {
        console.error('Error inserting user into database:', err);
        res.status(500).send('Internal server error.');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await users.read({user: username}); 
    
    if (!user) {
        return res.status(400).send('Username not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passcode);

    if (isPasswordValid) { 
        req.session.user = username; // Set username in session
        return res.status(201).send();
    } else {
        res.status(400).send('Invalid password');
    }
});

app.post('/add-task', async (req, res) => {
    const { task_description, date_time} = req.body;

    const username = req.session.user; 

    if (!task_description) {
        return res.status(400).send('Username and task description are required.');
    }

    if (!username){
        return res.status(450).send('No username');
    }

    try {
        const taskId = await tasks.create({user: username, task: task_description, date: date_time}); 
        res.status(200).send('Task added successfully');
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).send('Internal server error.');
    }
});

app.get('/fetchTasks', async (req, res) => {
    const dateTime = req.query.date_time;
    const username = req.session.user; 

    if (!username) {
        return res.status(401).send('User not logged in');
    }

    try {
        const task = await tasks.readMany({user: username, date: dateTime}); 
        res.json(task); 
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Internal server error');
    }
});

app.post('/fetchWorkStats', async (req, res) => {
    const inputDate = req.body.date;  // Assuming the date is sent as a string in the body
    const username = req.session.user;

    // Ensure the date is provided and valid
    if (!inputDate) {
        return res.status(400).send('Date is required');
    }

    try {
        // Convert the inputDate to a Date object (you can validate or process it if necessary)
        const date = new Date(inputDate);  // Assuming the client sends a valid ISO string

        // Check if the date is valid
        if (isNaN(date)) {
            return res.status(400).send('Invalid date format');
        }

        const dayOfWeek = date.getDay(); 

        const monday = new Date(date); 
        monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7)); 
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday); 
        sunday.setDate(monday.getDate() + 6); 
        sunday.setHours(23, 59, 59, 999);

        // Pass the date to the getWorkStatsEntries function
        const workEntries = await workStats.readMany({user: username, date: {$gte: monday, $lte: sunday}}); 
        res.json(workEntries || {});  // Send the fetched work entries as a JSON response
    } catch (err) {
        console.log('Error fetching work stats entries: ', err);
        res.status(500).send('Internal server error');
    }
});


app.post('/remove-task', async (req, res) => {
    const { task_description, date_time } = req.body; 

    const username = req.session.user;

    if (!username) {
        return res.status(401).send('User not logged in');
    }

    try {
        const taskID = await tasks.read({user: username, task: task_description, date: date_time});

        if (!taskID) {
            return res.status(404).send('Task not found');
        }

        await tasks.delete({user: username, task: task_description, date: date_time}); 
        res.status(200).send('Task deleted successfully');
    } catch (error) {
        console.error('Error deleting task:', error); 
        res.status(500).send('Internal server error.');
    }
});

app.post('/add-work', async (req, res) => {
    let { date_time, timeSpent, workTime, breakTime } = req.body; 

    const date_obj = new Date(date_time)

    const username = req.session.user;

    if(!username) {
        return res.status(400).send('Username and task description are required.')
    }

    try {
        if(await workStats.read({user: username, date: date_obj})){
            const result = await workStats.read({user: username, date: date_obj}); 
            const currentTimeSpent = result.time_spent; 
            const newTimeSpent = timeSpent + currentTimeSpent
            await workStats.update({user: username, date: date_obj}, {time_spent: newTimeSpent})

            const result2 = await workStats.read({user: username, date: date_obj}); 
            const currentWorkTime = result2.work_time; 
            const newWorkTime = currentWorkTime + workTime;
            await workStats.update({user: username, date: date_obj}, {work_time: newWorkTime})

            const result3 = await workStats.read({user: username, date: date_obj}); 
            const currentBreakTime = result3.break_time; 
            const newBreakTime = currentBreakTime + breakTime;
            await workStats.update({user: username, date: date_obj}, {break_time: newBreakTime})
        }

        else{
            await workStats.create({user: username, date: date_obj, time_spent: timeSpent, work_time: workTime, break_time: breakTime}); 
        }

        res.status(200).send('Work added successfully');
    } 
    catch (error) {
        console.error('Error adding task:', error);
        res.status(500).send('Internal server error.');
    }
}); 