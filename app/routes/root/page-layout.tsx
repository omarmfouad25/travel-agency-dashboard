import { useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";

// const navigate = useNavigate();

const PageLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/sign-in');
  }

  return (
    <div>
      <button 
      onClick={handleLogout} 
      className="cursor-pointer"
      >
        <img 
        src="/assets/icons/logout.svg" 
        alt="Log Out" 
        className="size-6" 
        />
      </button>

      <button onClick={() => {navigate('/dashboard')}}
        className="cursor-pointer bg-amber-600 text-white p-2 rounded-md m-4"
        >
        Go to Dashboard
      </button>
    </div>
  )
}


export default PageLayout