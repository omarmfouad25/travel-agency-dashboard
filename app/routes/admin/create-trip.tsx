import { Header } from 'components'
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { MapsComponent, LayersDirective, LayerDirective, Coordinate } from '@syncfusion/ej2-react-maps';
import type { Route } from './+types/trips';
import { comboBoxItems, selectItems } from '~/constants';
import { cn, formatKey } from '~/lib/utils';
import { useState } from 'react';
import { world_map } from '~/constants/world_map';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { account } from '~/appwrite/client';
import { useNavigate } from 'react-router';


export const loader = async () =>{
    const response = await fetch('https://restcountries.com/v3.1/independent?status=true')
    if(!response.ok){
        throw new Error('Failed to fetch countries')
    }
    const data = await response.json()

    return data.map((country: any) => ({
        name: country.flag + ' ' + country.name.common,
        coordinate: country.latlng,
        value: country.name.common,
        openStreetMaps: country.maps?.openStreetMaps
    }))
}
const CreateTrip = ({loaderData} : Route.ComponentProps) => {
    const countries = Array.isArray(loaderData) ? (loaderData as Country[]) : [];
    const navigate = useNavigate()

    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: ''
    })

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        if(
            !formData.country ||
            !formData.travelStyle ||
            !formData.interest ||
            !formData.budget ||
            !formData.groupType
        ) {
            setError('Please provide values for all fields')
            setLoading(false)
            return;
        }
        //not working to be fixed
        if(formData.duration < 1 || formData.duration > 10){
            setError('Duration must be between 1 and 10 days')
            setLoading(false)
            return;
        }

        const user = await account.get();
        if(!user.$id){
            console.error('user not authenticated')
            setLoading(false)
            return;
        }

        try {
            console.log('🚀 Submitting trip data:', {
                country: formData.country,
                numberOfDays: formData.duration,
                travelStyle: formData.travelStyle,
                interests: formData.interest,
                budget: formData.budget,
                groupType: formData.groupType,
                userId: user.$id
            });

            const response = await fetch('/api/create-trip',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.$id}`
                },
                body: JSON.stringify({
                   country: formData.country,
                   numberOfDays: formData.duration, // ✅ Fixed: changed from 'duration' to 'numberOfDays'
                   travelStyle: formData.travelStyle,
                   interests: formData.interest,
                   budget: formData.budget,
                   groupType: formData.groupType,
                   userId: user.$id
                })
            })

            console.log('📡 API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result: CreateTripResponse = await response.json()
            console.log('✅ API Success Response:', result);
            
            if(result?.id) {
                navigate(`/admin/trips/${result.id}`)
            } else {
                console.error('❌ No ID in response:', result);
                setError('Trip was created but navigation failed. Please check the trips list.');
            }
        } catch (e) {
            console.error('❌ Error generating trip-handleSubmit:', e)
            
            // More specific error messages
            if (e instanceof TypeError && e.message.includes('fetch')) {
                setError('Network error: Unable to connect to the server. Please check your connection.')
            } else if (e instanceof Error) {
                setError(`Error: ${e.message}`)
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
            setLoading(false)
        } finally {
            setLoading(false)
        }
        
    }
    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({ ...formData, [key]: value })
    }

    const countryData = countries.map((country) => ({
        text: country.name,
        value: country.value
    }));
    const mapData = [{
        country: formData.country,
        color: '#EA382E',
        coordinate: countries.find((c: Country) => c.name === formData.country)?.coordinates || []
    }]
  return (
    <main className='flex flex-col gap-10 pb-20 wrapper'> 
      <Header
        title={`Create Trip`}
        description="Create a new AI-Generated travel plan"
      />
      <section className='mt-2.5 wrapper-md'>
        <form className='trip-form' onSubmit={handleSubmit}>
            <div>
                <label htmlFor="country">
                    Country
                </label>
                <ComboBoxComponent 
                    id='country'
                    dataSource={countryData}
                    fields={{
                        text: 'text',
                        value: 'value'
                    }} 
                    placeholder='Select a country'
                    className='combo-box'
                    change={(e: {value: string | undefined}) => {
                        if(e.value){
                            handleChange('country',e.value)
                        }
                    }}
                    allowFiltering
                    filtering={(e) => {
                        const query = e.text.toLowerCase()
                        e.updateData(
                            countries.filter((country) => 
                                country.name.toLowerCase().includes(query)).map(((country) =>
                                     ({
                                        text: country.name,
                                        value: country.value
                                    })))
                        )
                    }}

                />
            </div>

            <div>
                <label htmlFor='duration'>
                    Duration
                </label>
                <input 
                id='duration' 
                name='duration' 
                placeholder='Enter duration in days'
                className='form-input placeholder:text-gray-100'
                type='number' 
                min={1} 
                onChange={(e) => handleChange('duration', Number(e.target.value))} 
                />
            </div>
            {selectItems.map((key) => 
                <div key={key}>
                    <label htmlFor={key}>
                        {formatKey(key)}
                    </label>
                    <ComboBoxComponent 
                        id={key}
                        dataSource={comboBoxItems[key].map((item)=> ({
                            text: item,
                            value: item
                        }))}
                        //not nessesary
                        fields={{
                            text: 'text',
                            value: 'value'
                        }}
                        placeholder={`Select ${formatKey(key)}`}
                        change={(e) => {
                            if (e.value) {
                                handleChange(key, e.value);
                            }
                        }}
                        allowFiltering
                        filtering={(e) => {
                            const query = e.text.toLowerCase()
                            e.updateData(
                                comboBoxItems[key].filter((item) =>
                                    item.toLowerCase().includes(query)
                                ).map((item) => ({
                                    text: item,
                                    value: item
                                }))
                            )
                        }}
                        className='combo-box'


                    />
                </div>
            )}

            <div>
                <label htmlFor='location'>
                    Location on world map.
                </label>
                <MapsComponent>
                    <LayersDirective>
                        <LayerDirective 
                        shapeData={world_map}
                        dataSource={mapData}
                        shapePropertyPath='name'
                        shapeDataPath='country'
                        shapeSettings={{ colorValuePath: 'color' , fill: '#E5E5E5' }}
                        />
                    </LayersDirective>
                </MapsComponent>
            </div>

            <div className='bg-gray-200 h-px w-full'/>
            {error && 
            <div className='error'>
                <p>{error}</p>
            </div>}
            
            <footer className='px-6 w-full'>
                <ButtonComponent type='submit' className='button-class !h-12 !w-full' disabled={loading}>
                    <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} className={cn('size-5', {'animate-spin' : loading})}/>
                    <span className='p-16-semibold text-white'>{loading ? 'Generating...' : 'Generate Trip'}</span>
                </ButtonComponent>
            </footer>

        </form>
      </section>
    </main>
  )
}

export default CreateTrip