import { Link, NavLink } from "react-router"
import { sidebarItems } from "~/constants"
import { cn } from "~/lib/utils"

const NavItems = ({ handleClick } : {handleClick?:() => void }) => {
    const user = {
        id: 1,
        name: "Omar Fouad",
        email: "fouad@sayhey.ae",
        imageUrl: "/assets/images/fouad.png"
    }
  return (
    <section className="nav-items">
        <Link to="/" className="link-logo">
            <img src="/assets/icons/logo.svg" alt="Logo" className="size-[30px]" />
            <h1 className="">NunuTour</h1>

        </Link>
        <div className="container">
            <nav>
                {sidebarItems.map((item) => (
                    <Link key={item.id} to={item.href}>
                        
                        <div>
                           <NavLink to={item.href} key={item.id}>
                            {({ isActive } : {isActive : boolean}) => (
                                <div className={cn('group nav-item', {
                                'bg-primary-100 !text-white' : isActive})}
                                onClick={handleClick}>
                                    <img 
                                    src={item.icon}
                                    alt={item.label}
                                    className={`group-hover: brightness-0 size-5 group-hover:invert ${isActive ? 'brightness-0 invert' : 'text-dark-200'}`}
                                    />
                                    {item.label}
                                </div>
                            )}
                            </NavLink>
                        </div>
                    </Link>
                ))}
            </nav>
            <footer className="nav-footer">
                <img src={user?.imageUrl || '/assets/images/david.webp'} alt={user?.name || 'Omar Fouad'} />
                <article>
                    <h2>{user?.name || 'Omar Fouad'}</h2>
                    <p>{user?.email || 'fouad@sayhey.ae'}</p>
                </article>
                <button onClick={() => 
                    console.log('Log Out Successfully')
                } className="cursor-pointer">
                    <img src="/assets/icons/logout.svg" alt="Log Out" className="size-6"/>
                </button>
            </footer>
        </div>
    </section>
  )
}

export default NavItems