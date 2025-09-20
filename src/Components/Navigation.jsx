import { Link } from "react-router-dom"
import logo from "../images/Pomodoro_Planner_Logo.png"

export default function Navigation({ menuItems }){
    const menu_items = menuItems.map((item, index) => (
        <li key = {index} className="bg-black m-r-[1em]"><Link className="link_tag" to = {item.url}>{item.name}</Link></li>
    ))
    return(
        <>
            <div className = "flex align-middle justify-between bg-white border-b-2 border-black">
                <div className = "flex w-1/2">
                    <Link className = "link_tag" to = "/"><img src = {logo} className = "h-[80px] w-auto" /></Link>
                    <h1><Link className = "link_tag" to = "/">Pomodoro Planner</Link></h1>
                </div>
                <nav id = "navbar">
                    <ul className="flex flex-row-reverse list-none m-0 p-0">
                        {menu_items}
                    </ul>
                </nav>
            </div>
        </>
    )
}