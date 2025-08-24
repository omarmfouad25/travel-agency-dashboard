import { ButtonComponent } from "@syncfusion/ej2-react-buttons"
import { Link, redirect } from "react-router"
import { loginWithGoogle } from "~/appwrite/auth"
import { account,client } from "~/appwrite/client"

export async function clientLoader() {
    try{
        const user = await account.get()
        if(user.$id) return redirect('/dashboard') // Redirect to dashboard instead of root
        
    } catch(e){
        console.log('Error loading client:', e)

    }
}

const SignIn = () => {
console.log("Appwrite endpoint:", client.config.endpoint);
  return (
    <main className="auth">
        <section className="size-full glassmorphism flex-center px-6">
            <div className="sign-in-card">
                <header className="header">
                    <Link to="/">
                        <img src="assets/icons/logo.svg" alt="Logo" className="size-[30px]"/>
                    </Link>
                    <h1 className="p-28-bold text-dark-100">NunuTour</h1>
                </header>
                <article>
                    <h2 className="p-28-semibold text-dark-100 text-center">Start Your Travel Journey</h2>
                    <p className="p-16-regular text-center text-gray-100 !leading-7">Sign in with Google to manage destinations, itineraries, and user activity with ease.</p>
                </article>
                <ButtonComponent
                type="button" 
                iconCss="e-search-icon" 
                className="button-class !h-11 !w-full"
                onClick={loginWithGoogle}
                >
                    <img
                        src="assets/icons/google.svg"
                        alt="Sign in with Google"
                        className="size-5"
                    />
                    <span className="p-18-semibold text-white">Sign in with Google</span>
                </ButtonComponent>
            </div>
        </section>
        
    </main>
  )
}

export default SignIn