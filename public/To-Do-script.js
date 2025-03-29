const backendUrl = "https://pomodoro-schedular-829cab746192.herokuapp.com"; 

const listContainer = document.getElementById("taskList"); 

let date = new Date(); 
let year = date.getFullYear(); 
let month = date.getMonth(); 

const day = document.querySelector(".calendar-dates"); 
const currdate = document.querySelector(".calendar-current-date"); 
const prenexIcons = document.querySelectorAll(".calendar-navigation span"); 

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const manipulate = () => {
    let dayOne = new Date(year, month, 1).getDay(); 
    let lastdate = new Date(year, month + 1, 0).getDate(); 
    let dayend = new Date(year, month, lastdate).getDay(); 
    let monthlastdate = new Date(year, month, 0).getDate();
    let calendarHTML = ""; 

    for(let i = dayOne; i > 0; i--){
        calendarHTML += `<li class = 'inactive'>${monthlastdate - i + 1}</li>`; 
    }

    for(let i = 1; i <= lastdate; i++){
        let isToday = i === date.getDate() ? "active" : "";
        calendarHTML += `<li class = "${isToday}" onclick = "changeDay(this)">${i}</li>`;
    }

    for(let i = dayend; i < 6; i++){
        calendarHTML += `<li class = "inactive">${i - dayend + 1}</li>`; 
    }

    currdate.innerText = `${months[month]} ${year}`; 

    day.innerHTML = calendarHTML; 
}

manipulate(); 

prenexIcons.forEach(icon => {
    icon.addEventListener('click', ()=>{
        month = icon.id === "calendar-prev" ? month - 1: month + 1; 
        if (month < 0 || month > 11) {
            date = new Date(year, month, date.getDate()); 
            year = date.getFullYear(); 
            month = date.getMonth(); 
        }
        else{
            date = new Date(year, month, date.getDate()); 
        }
        manipulate(); 
        fetchTasksForUser(); 
    }); 
});

function changeDay(selectedDay) {
    let previousSelected = document.querySelector(".active");
    if (previousSelected) {
        previousSelected.classList.remove("active");
    }
    selectedDay.classList.add("active");

    let dayNumber = parseInt(selectedDay.textContent);

    date.setDate(dayNumber); 

    fetchTasksForUser();

}

async function addTask() {
    const inputBox = document.getElementById('taskInput');
    const taskDescription = inputBox.value;

    if (taskDescription === '') {
        alert("You must write something");
        return;
    }

    try { 
        const response = await fetch(`${backendUrl}/add-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task_description: taskDescription,
                date_time: date.toDateString(), 
            }),
        });
        if (response.ok) { 
            await fetchTasksForUser();
        } else {
            console.log('Failed to add task');
        }
    } catch (error) {
        alert('error'); 
        console.error('Error adding task:', error);
    }

    inputBox.value = "";   
}

async function fetchTasksForUser() {
    const params = new URLSearchParams({
        date_time: date.toDateString()
    });

    try {
        const response = await fetch(`${backendUrl}/fetchTasks?${params.toString()}`, {
            method: 'GET'
        });
    
        if (response.ok) {
            const tasks = await response.json();
            const listContainer = document.getElementById("taskList");
            listContainer.innerHTML = ''; // Clear any existing tasks

            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.task_description;
                listContainer.appendChild(li);
                let span = document.createElement("span"); 
                span.innerHTML = "\u00d7"; 
                li.appendChild(span); 
            });

        } else {
            console.log('No tasks found or user not logged in');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

listContainer.addEventListener("click", async function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");

    } else if (e.target.tagName === "SPAN") {
        try {
            const taskDescription = e.target.parentElement.firstChild.textContent; 
            const response = await fetch(`${backendUrl}/remove-task`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_description: taskDescription, 
                    date_time: date.toDateString() 
                }),
            });

            if (response.ok) {
                await fetchTasksForUser();
            } else {
                console.log('Failed to remove task');
            }
        } catch (error) {
            console.error('Error removing task:', error);
        }
    }
}, false);

function redirectToTimer(){
    window.location.href = 'pomodoro.html'; 
}

window.onload = () => {
    fetchTasksForUser();
};