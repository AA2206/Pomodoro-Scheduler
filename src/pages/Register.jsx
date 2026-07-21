import { useNavigate } from "react-router-dom";
import React, { useRef } from "react";
import AuthForm from "../Components/AuthForm";
import { API_URL } from "../config";

export default function Register(){
    const inputRef = useRef(null);

    const navigate = useNavigate(); 

    async function handleRegister(event){
        event.preventDefault(); 
        const formEl = event.currentTarget; 
        const formData = new FormData(formEl)

        const username = formData.get("username");
        const password = formData.get("password");

        try{
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if(response.ok){
                inputRef.current.innerText = "";
                navigate('/to-do');
            }
            else{
                const errorMessage = await response.text(); 
                inputRef.current.innerText = errorMessage || 'Registration failed. Please try again.';
            }
        } catch (error) {
            console.error("Error:", error); 
            inputRef.current.innerText = 'Something went wrong. Please try again later.';
        }

    }

    return(
        <AuthForm title = "Register" handleSubmit={handleRegister} inputRef={inputRef}/>
    )
}