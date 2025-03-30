const express = require('express')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors'); 
const path = require('path')
const bcrypt = require('bcryptjs');
const Database = require('./database'); 

const app = express(); 
const db = new Database('path_to_sql_script.sql', 'users.db', 'users');
const tasks = new Database('tasks.sql', 'tasks.db', 'tasks'); 
const work_stats = new Database('work_stats.sql', 'work_stats.db', 'work_stats'); 

console.log("hello"); 

app.use(cors());

async function initializeDatabases() {
    await db.initDb();
    await tasks.initDb();
    await work_stats.initDb(); 
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
    secret: 'your_secret_key', // Keep this secure and private
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://arpanagar06:Mongo4@rpN!1@cluster0.jvl79lz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        collectionName: 'sessions', // Optional: specify the collection name
        ttl: 60 * 60 * 24, // Session expiration time in seconds (1 day)
    }),
    cookie: {
        secure: false, // Use `true` if your app runs on HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    },
}));

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
}); 

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    const userExists = await db.checkExistence('username', username);
    if (userExists) {
        return res.status(400).send('Username already registered.');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
        const userId = await db.insert('username, passcode', [username, hashedPassword]);
        res.redirect('/login.html');
    } catch (err) {
        console.error('Error inserting user into database:', err);
        res.status(500).send('Internal server error.');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const storedPassword = await db.getSpecific('passcode', 'username', username);
    
    if (!storedPassword) {
        return res.status(400).send('Username not found');
    }

    const isPasswordValid = await bcrypt.compare(password, storedPassword);

    if (isPasswordValid) {
        req.session.username = username; // Set username in session
        res.redirect('/To-Do.html');
    } else {
        res.status(400).send('Invalid password');
    }
});

app.post('/add-task', async (req, res) => {
    const { task_description, date_time} = req.body;
    const username = req.session.username;

    if (!username || !task_description) {
        return res.status(400).send('Username and task description are required.');
    }

    try {
        const taskId = await tasks.insert('username, task_description, date_time', [username, task_description, date_time]);
        res.status(200).send('Task added successfully');
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).send('Internal server error.');
    }
});

app.get('/fetchTasks', async (req, res) => {
    const dateTime = req.query.date_time;
    if (!req.session.username) {
        return res.status(401).send('User not logged in');
    }

    const username = req.session.username;

    try {
        const task = await tasks.getTasks('task_description', 'username', username, dateTime); 
        res.json(task); 
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Internal server error');
    }
});

app.post('/fetchWorkStats', async (req, res) => {
    const username = req.session.username;
    const inputDate = req.body.date;  // Assuming the date is sent as a string in the body

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

        // Pass the date to the getWorkStatsEntries function
        const workEntries = await work_stats.getWorkStatsEntries(username, date); 
        res.json(workEntries);  // Send the fetched work entries as a JSON response
    } catch (err) {
        console.log('Error fetching work stats entries: ', err);
        res.status(500).send('Internal server error');
    }
});


app.post('/remove-task', async (req, res) => {
    const { task_description, date_time } = req.body; 
    if (!req.session.username) {
        return res.status(401).send('User not logged in');
    }

    const username = req.session.username;

    try {
        const taskID = await tasks.getTask('id', 'task_description', task_description, date_time);

        if (!taskID) {
            return res.status(404).send('Task not found');
        }

        await tasks.deleteRow(taskID); 
        res.status(200).send('Task deleted successfully');
    } catch (error) {
        console.error('Error deleting task:', error); 
        res.status(500).send('Internal server error.');
    }
});

app.post('/add-work', async (req, res) => {
    let { date_time, timeSpent, workTime, breakTime } = req.body; 
    const username = req.session.username; 

    if(!username) {
        return res.status(400).send('Username and task description are required.')
    }

    try {
        if(await work_stats.checkWorkExistence(username, date_time)){
            const currentTimeSpent = await work_stats.getWorkSpecific('time_spent', username, date_time); 
            timeSpent += currentTimeSpent
            await work_stats.updateWorkTable('time_spent', timeSpent, username, date_time)

            const currentWorkTime = await work_stats.getWorkSpecific('work_time', username, date_time); 
            workTime += currentWorkTime;
            await work_stats.updateWorkTable('work_time', workTime, username, date_time)
            const currentBreakTime = await work_stats.getWorkSpecific('break_time', username, date_time);
            breakTime += currentBreakTime
            await work_stats.updateWorkTable('break_time', breakTime, username, date_time)
        }

        else{
            await work_stats.insert('username, date_time, time_spent, work_time, break_time', [username, date_time, timeSpent, workTime, breakTime]); 
        }
    } 
    catch (error) {
        console.error('Error adding task:', error);
        res.status(500).send('Internal server error.');
    }
}); 
