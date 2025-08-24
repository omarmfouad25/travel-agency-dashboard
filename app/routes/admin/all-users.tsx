import { Header } from "components"
import { ColumnDirective, ColumnsDirective, GridComponent } from '@syncfusion/ej2-react-grids';
import { users } from "~/constants";
import { cn, formatDate } from "~/lib/utils";
import { getAllUser } from "~/appwrite/auth";
import type { Route } from "./+types/all-users";

export const loader = async () => {
  const { users, total } = await getAllUser(10, 0);
  return { users, total };
};

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
  const { users, total } = loaderData;
  return (
    <main className='all-users wrapper'>
      <Header
        title={`Manage Users`}
        description="Filter, Sort, and Manage Users Details"
      />
      
      <GridComponent dataSource={users} gridLines="None">
        <ColumnsDirective>
          <ColumnDirective 
            field="name"
            headerText="Name"
            width="200"
            textAlign="Left"
            template={(Props: UserData) => (
              <div className="flex items-center gap-1.5 px-4">
                <img src={Props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer"/>
                <span className="">{Props.name}</span>
              </div>
            )}
          />
          <ColumnDirective 
            field="email"
            headerText="Email"
            width="200"
            textAlign="Left"
          />
          <ColumnDirective 
            field="joinedAt"
            headerText="Date Joined"
            width="140"
            textAlign="Left"
            template={({ joinedAt }: { joinedAt: string }) => formatDate(joinedAt)}
          />
          <ColumnDirective 
            field="status"
            headerText="Status"
            width="100"
            textAlign="Left"
            template={( {status} : UserData) => (
              <article className={cn('status-column', status === 'user' ? 'bg-success-50' : 'bg-light-300')}> 
                <div className={cn('size-1.5 rounded-full', status === 'user' ? 'bg-success-500' : 'bg-gray-500')} />
                  <h3 className={cn('font-inter text-xs font-medium', status === 'user' ? 'text-success-700' : 'text-gray-500')}>{status}</h3>
                
              </article>
            )}
          />


        </ColumnsDirective>
    </GridComponent>
    </main>
  )
}

export default AllUsers