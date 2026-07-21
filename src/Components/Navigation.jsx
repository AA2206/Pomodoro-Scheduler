import { Link } from "react-router-dom"
import logo from "../images/Pomodoro_Planner_Logo.png"

export default function Navigation({ menuItems }){
    const menu_items = menuItems.map((item, index) => (
        <li key = {index} className="menu_item"><Link className="link_tag" to = {item.url}>{item.name}</Link></li>
    ))
    return(
        <div id = "navigation">
            <div className = "logo_container">
                <Link className = "link_tag" to = "/"><img src = {logo} className = "logo" /></Link>
                <h1 className = "nav_title"><Link className = "link_tag" to = "/">Pomodoro Planner</Link></h1>
            </div>
            <nav id = "navbar">
                <ul id = "menu">
                    {menu_items}
                </ul>
            </nav>
        </div>
    )
}