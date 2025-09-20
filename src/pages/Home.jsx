import { Link } from "react-router-dom"
import Navigation from "../Components/Navigation"

export default function Home(){
    const menuItems = [{ name: "Login", url: "/login"}, { name: "Register", url: "/register"}]

    return(
        <>
            <Navigation menuItems={ menuItems } />
            <div id = "home-container">
                <h1>Stay Organized, Be Productive</h1>
                <p>Keep track of your daily work tasks, use pomodoro to productively complete tasks, and gain analytical insights on your productivity</p>
                <button><Link id = "home_link_tag" to = "/register">Click Here to Get Started!</Link></button>
            </div>
        </>
    )
}