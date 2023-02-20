import { Link } from "react-router-dom";

interface IRestaurantProps {
    id: string;
    coverImage: string;
    name: string;
    categoryName? : string;
}

export const Restaurant: React.FC<IRestaurantProps> = ({ id, coverImage, name, categoryName}) => {
    return (
        <Link to={`/restaurant/${id}`}>
            <div className="flex flex-col ">
                <div style={{
                    backgroundImage: `url(${coverImage})`
                }} className="bg-red-500 py-28 bg-cover bg-center mb-2"></div>
                <h3 className="text-lg font-medium">{name}</h3>
                <span className="border-t-2 border-gray-300 py-3 mt-2 text-xs opacity-50">{categoryName}</span>
            </div>
        </Link>
    )
}