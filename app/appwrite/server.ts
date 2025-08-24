import { Client, Databases, Storage } from "appwrite"

export const serverAppwriteConfig = {
    endpointUrl: process.env.APPWRITE_API_ENDPOINT!,
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!,
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    usersCollectionId: process.env.APPWRITE_USERS_COLLECTION_ID!,
    tripsCollectionId: process.env.APPWRITE_TRIPS_COLLECTION_ID!,
}

// Server-side client with API key for server-to-server operations
const serverClient = new Client()
    .setEndpoint(serverAppwriteConfig.endpointUrl)
    .setProject(serverAppwriteConfig.projectId)

const serverDatabases = new Databases(serverClient)
const serverStorage = new Storage(serverClient)

export { serverClient, serverDatabases, serverStorage, serverAppwriteConfig as appwriteConfig }
