import { data, type  ActionFunctionArgs } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToJson } from "~/lib/utils";
import { appwriteConfig, serverDatabases as databases } from "~/appwrite/server";
import { ID } from "appwrite";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const requestData = await request.json();
        const {
            country,
            numberOfDays,
            travelStyle,
            interests,
            budget,
            groupType,
            userId
        } = requestData;

        if (!country || !numberOfDays || !travelStyle || !interests || !budget || !groupType || !userId) {
            return data({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fix: Handle interests as string or array
        const interestsArray = Array.isArray(interests) ? interests : [interests];

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;

        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interestsArray.join(", ")}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${JSON.stringify(interestsArray)},
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          '🌸 Season (from month to month): reason to visit',
          '☀️ Season (from month to month): reason to visit',
          '🍁 Season (from month to month): reason to visit',
          '❄️ Season (from month to month): reason to visit'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        },
        ...
        ]
        }`;

        const textResult = await genAI
        .getGenerativeModel({model: 'gemini-2.5-flash-lite'})
        .generateContent([prompt])

        const trip = parseMarkdownToJson(textResult.response.text())

        const imageResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${country} ${interestsArray.join(", ")} ${travelStyle}&client_id=${unsplashApiKey}`
        );

        if (!imageResponse.ok) {
            console.error('Unsplash API error:', imageResponse.status);
        }

        const imageData = await imageResponse.json();
        const imageUrls = imageData.results?.slice(0,3).map((result:any) => result.urls?.regular || null) || [];

        const result = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripsCollectionId,
            ID.unique(),
            {
                tripDetails: JSON.stringify(trip),
                createdAt: new Date().toISOString(),
                imageUrls,
                userId,
            }
        )
        return data({id: result.$id})

    } catch (e) {
        console.error('API Error:', e instanceof Error ? e.message : 'Unknown error');
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Failed to generate trip' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}