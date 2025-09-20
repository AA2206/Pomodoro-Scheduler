import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/login"
import Register from "./pages/Register"
import ToDo from "./pages/To-Do"
import Analytics from "./pages/Analytics"
import Work from "./pages/Work"

export default function App(){
    return(
        <BrowserRouter>

            <Routes>
                <Route path = "/" element = {<Home />} />
                <Route path = "/login" element = {<Login />} />
                <Route path = "/register" element = {<Register />} /> 
                <Route path = "/to-do" element = {<ToDo />} />
                <Route path = "/work" element = {<Work />} />
                <Route path = "/analytics" element = {<Analytics />} />
            </Routes>

        </BrowserRouter>
    )
}