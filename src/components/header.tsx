import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import nuberLogo from "../images/logo.svg"

export const Header: React.FC = () => {
    const {data} = useMe();

    return <>
        {!data?.me.verified && (
            <div className="bg-red-500 p-3 px-3 text-center text-xs text-white">please verify your email</div>
        )}
        <header className="py-4">
            <div className="w-full px-5 xl:px-10 max-w-screen-2xl mx-auto flex justify-between items-center">
                <img src={nuberLogo} alt="logo" className="w-24 mb-5"/>
                <Link to="/edit-profile">
                <span className="text-xs"><FontAwesomeIcon icon={faUser} className="text-lg"/></span>
                </Link>
            </div>
        </header>
    </>
}