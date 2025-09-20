import { Link } from "react-router-dom";
import logo from "../images/Pomodoro_Planner_Logo.png"

export default function AuthForm({ title, handleSubmit, inputRef }){
    return (
        <>
            <div className="logo_container">
                <Link className="link_tag" to = "/">
                    <img src = {logo} className="logo" />
                </Link>
                <h1>
                    <Link className="link_tag" to = "/">Pomodoro Planner</Link>
                </h1>
            </div>

            <div id = "AuthForm_container">
                <form id = "inputForm" onSubmit={handleSubmit}>
                    <h1>{title}</h1>

                    <div id = "usernameContainer">
                        <label htmlFor="username">Username</label>
                        <br />
                        <input type = "text" id = "username" name = "username" required />
                    </div>

                    <div id = "passwordContainer">
                        <label htmlFor="password">Password</label>
                        <br />
                        <input type = "password" id = "password" name = "password" required />
                    </div>

                    <input id = "submit" type = "submit" />
                </form>
                <p ref = {inputRef} id = "errorMessage" style = {{color: "red"}}></p>
            </div>
        </>
    )
}