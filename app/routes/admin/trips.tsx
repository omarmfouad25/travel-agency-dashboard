import { Header, TripCard } from "components"
import type {LoaderFunctionArgs} from "react-router";
import { getAllTrips, getTripById } from "~/appwrite/trips";
import { parseTripData } from "~/lib/utils";
import type {Route} from './+types/trips'

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const limit = 8
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const offset = (page - 1) * limit

    const {allTrips, total} = await getAllTrips(limit, offset)

    return {
        trips: allTrips.map(({ $id, tripDetails, imageUrls }) => ({
            id: $id,
            ...parseTripData(tripDetails),
            imageUrls: imageUrls ?? []
        })),
        total
    }
}

const Trips = ({ loaderData }: Route.ComponentProps) => {
  const trips = loaderData.trips as Trip[] | [];
  // const total = loaderData?.total as number || 0;
  return (
    <main className='all-users wrapper'>
      <Header
        title={`Trips`}
        description="View and edit AI-Generated travel plans"
        ctaText="Create New Trip"
        ctaUrl="/trips/create"
      />
      <section>
        <h1 className="p-24-semibold text-dark-100 mb-4">Manage Created Trips</h1>
         <div className="trip-grid">
                    {trips.map((trip) => (
                       <TripCard
                            key={trip.id}
                            id={trip.id}
                            name={trip.name}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ""}
                            tags={[trip.interests, trip.travelStyle]}
                            price={trip.estimatedPrice}
                        />
                    ))}
                </div>
      </section>
      </main>
  )
}

export default Trips