import { Header } from "components"

const Trips = () => {
  return (
    <main className='all-users wrapper'>
      <Header
        title={`Trips`}
        description="View and edit AI-Generated travel plans"
        ctaText="Create New Trip"
        ctaUrl="/trips/create"
      />
      </main>
  )
}

export default Trips