const select = document.getElementById("dropdown");

async function populateDropdown() {
    if (select) {  
        select.innerHTML = ''; // Clear existing options

        date = new Date(); 

        const params = new URLSearchParams({
            date_time: date.toDateString() 
        });

        try {
            const response = await fetch(`/fetchTasks?${params.toString()}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json(); // Convert response to JSON

            tasks.forEach(task => {
                const option = document.createElement("option");
                option.textContent = task.task_description; // Use the task description
                option.value = task.task_description; 
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }
    else{
        alert('Failure'); 
    }
}

document.addEventListener("DOMContentLoaded", populateDropdown);