



const inputBox = document.getElementById("input-box"); 
const listContainer = document.getElementById("list-container"); 
const date = new Date();


function redirect(){
    window.location.href = 'pomodoro.html'; 
}

async function addTask() {
    const inputBox = document.getElementById('input-box');
    const taskDescription = inputBox.value;
    const username = localStorage.getItem('username');

    if (taskDescription === '') {
        alert("You must write something");
        return;
    }

    try { 
        const response = await fetch('/add-task', {
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
        const response = await fetch(`/fetchTasks?${params.toString()}`, {
            method: 'GET'
        });
    
        if (response.ok) {
            const tasks = await response.json();
            const listContainer = document.getElementById('list-container');
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

function setDate(){
    date = new Date(); 
    localStorage.setItem("date_time", date.toDateString());
}

listContainer.addEventListener("click", async function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveData();
    } else if (e.target.tagName === "SPAN") {
        try {
            const taskDescription = e.target.parentElement.firstChild.textContent; 
            const response = await fetch('/remove-task', { 
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

function saveData(){
    localStorage.setItem("data", listContainer.innerHTML); 
}

function showTask(){
    listContainer.innerHTML = localStorage.getItem("data"); 
} 

function changeDay(selectedDay) {
    let previousSelected = document.querySelector(".today");
    if (previousSelected) {
        previousSelected.classList.remove("today");
    }
    selectedDay.classList.add("today");

    let dayNumber = parseInt(selectedDay.textContent);

    date.setDate(dayNumber); 

    document.querySelector('.date p').innerHTML = date.toDateString(); 

    localStorage.setItem("date_time", date.toDateString());

    fetchTasksForUser(); 

}

const renderCalendar = () => {
    date.setDate(1); 

    const monthDays = document.querySelector(".days");

    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); 

    const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate(); 

    const firstDayIndex = date.getDay(); 

    const lastDayIndex = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay(); 

    const nextDays = 7 - lastDayIndex - 1; 


    const months = [
        "January", 
        "February", 
        "March", 
        "April", 
        "May", 
        "June", 
        "July", 
        "August", 
        "September", 
        "October", 
        "November", 
        "December",
    ]; 

    document.querySelector(".date h1").innerHTML = months[date.getMonth()]; 
    
    document.querySelector('.date p').innerHTML = new Date().toDateString(); 

    let days = ""

    for(let x = firstDayIndex; x > 0; x--){
        days += `<div class = "prev-date">${prevLastDay - x + 1}</div>`
    }

    for(let i = 1; i <= lastDay; i++){
        if(i === new Date().getDate() && date.getMonth() === new Date().getMonth()){
            days += `<div class = "today" onclick = "changeDay(this)">${i}</div>`; 
        }
        else{
            days += `<div onclick = "changeDay(this)">${i}</div>`; 
        }
    }

    for(let j = 1; j <= nextDays; j++){
        days += `<div class = "next-date">${j}</div>`
    }

    monthDays.innerHTML = days;

    date = new Date(); 

}

document.querySelector(".prev").addEventListener('click', () => {
    date.setMonth(date.getMonth() - 1); 
    renderCalendar(); 
}); 

document.querySelector(".next").addEventListener('click', () => {
    date.setMonth(date.getMonth() + 1); 
    renderCalendar(); 
});

window.onload = () => {
    fetchTasksForUser();
    setDate();
};

document.addEventListener("DOMContentLoaded", function () {
    renderCalendar();
});


