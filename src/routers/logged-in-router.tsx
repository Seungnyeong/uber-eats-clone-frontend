import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { Header } from "../components/header"
import { useMe } from "../hooks/useMe"
import { NotFound } from "../pages/404"
import { Category } from "../pages/client/category"
import { Restaurant } from "../pages/client/restaurant"
import { Restaurants } from "../pages/client/restaurants"
import { Search } from "../pages/client/search"
import { ConfirmEmail } from "../user/confirm-email"
import { EditProfile } from "../user/edit-profile"


const ClientRoutes = [
    <Route key={1} path="/" element={<Restaurants />}/>,
    <Route key={2} path="/confirm" element={<ConfirmEmail />}/>,
    <Route key={3} path="/edit-profile" element={<EditProfile />}/>,
    <Route key={4} path="/search" element={<Search />}/>,
    <Route key={5} path="/category/:slug" element={<Category />}/>,
    <Route key={6} path="/restaurant/:id" element={<Restaurant />}/>,
  ];



export const LoggedInRouter = () => {

    const {data, loading, error} = useMe();
    if (!data || loading || error) {
        return (
            <div className="h-screen flex justify-center items-center">
                <span className="font-medium text-xl tracking-wide">Loading...</span>
            </div>
        )
    }
    return (
        <Router>
            <Header/>
            <Routes>
                {data.me.role === "Client" && ClientRoutes} 
                <Route path="*" element={<NotFound/>}/>
            </Routes>
            
        </Router>
    )
}