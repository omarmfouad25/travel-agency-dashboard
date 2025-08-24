import React from 'react'
import { Outlet, redirect } from 'react-router'
import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import  { NavItems, MobileSidebar } from 'components';
import { getExistingUser, storeUserData } from "~/appwrite/auth"
import { account } from '~/appwrite/client';


export async function clientLoader() {
    try{
        const user = await account.get()
        if(!user.$id) return redirect('/sign-in')
          
        const exisitingUser = await getExistingUser(user.$id)

        if(exisitingUser?.status === 'user'){
          return redirect('/')
        } 

        return exisitingUser?.$id ? exisitingUser : await storeUserData()
    } catch(e){
        console.log('Error loading client:', e)
        return redirect('/sign-in')

    }
}

const AdminLayout = () => {
  return (
    <div className='admin-layout'>
        
        <MobileSidebar />

        <aside className='w-full max-w-[270px] hidden lg:block'>
            <SidebarComponent width={270} enableGestures={false}>
                <NavItems />
            </SidebarComponent>    
        </aside>  

        <aside className='children'>
         <Outlet />
        </aside>  
    </div>
  )
}

export default AdminLayout