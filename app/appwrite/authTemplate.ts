/**
 * ========================================
 * TRAVEL DASHBOARD - AUTHENTICATION MODULE
 * ========================================
 * 
 * This file handles all authentication-related operations for the travel dashboard application.
 * It uses Appwrite as the backend service for authentication and database operations.
 * 
 * Key Features:
 * - Google OAuth login integration
 * - User data management in Appwrite database
 * - Profile picture fetching from Google People API
 * - Session management and logout functionality
 * 
 * Dependencies:
 * - Appwrite SDK for backend services
 * - React Router for navigation/redirects
 * - Google People API for profile data
 */

// ===== IMPORTS =====
import { redirect } from "react-router"                    // For programmatic navigation in React Router
import { account, databases, appwriteConfig } from "./client"  // Appwrite client instances and config
import { OAuthProvider, Query, ID } from "appwrite"        // Appwrite utilities for OAuth, queries, and ID generation


/**
 * ========================================
 * GOOGLE OAUTH LOGIN FUNCTION
 * ========================================
 * 
 * Initiates the Google OAuth login process using Appwrite's OAuth2 system.
 * This function redirects the user to Google's login page where they can authenticate.
 * After successful authentication, Google redirects back to the app with an access token.
 * 
 * Flow:
 * 1. User clicks login button
 * 2. This function is called
 * 3. User is redirected to Google's OAuth page
 * 4. User grants permissions to the app
 * 5. Google redirects back with authentication data
 * 6. Appwrite creates a session for the user
 * 
 * @returns {Promise<void>} - No return value, initiates redirect to Google
 */
export const loginWithGoogle = async() =>{
    try{
        // Create an OAuth2 session with Google as the provider
        // This will redirect the user to Google's authentication page
        account.createOAuth2Session(OAuthProvider.Google)
    } catch(e) {
        // Log any errors that occur during the OAuth initiation process
        console.log('(loginWithGoogle):Error logging in with Google:', e)
    }
}

/**
 * ========================================
 * GET USER INFORMATION FUNCTION
 * ========================================
 * 
 * Retrieves the current authenticated user's information from both Appwrite authentication
 * and the custom user database. This function combines authentication data with stored
 * profile information to provide complete user details.
 * 
 * Purpose:
 * - Verify user is authenticated
 * - Fetch user's profile data from database
 * - Redirect to login if not authenticated
 * 
 * Database Query Details:
 * - Searches users collection by accountId (links auth account to database record)
 * - Only selects specific fields to optimize performance
 * - Returns user profile data for use in the application
 * 
 * @returns {Promise<Object|void>} - User document from database, or redirects to sign-in
 */
export const getUser = async() =>{
    try{
        // ===== STEP 1: GET AUTHENTICATED USER FROM APPWRITE =====
        // This checks if someone is currently logged in to the application
        // If no active session exists, this will throw an error
        const user = await account.get()

        // ===== STEP 2: REDIRECT IF NOT AUTHENTICATED =====
        // If no user is found (not logged in), redirect them to the sign-in page
        // This protects routes that require authentication
        if(!user) return redirect('/sign-in')

        // ===== STEP 3: FETCH USER'S PROFILE DATA FROM DATABASE =====
        // Query the users collection to get additional profile information
        // This gets data that was stored when the user first signed up
        const { documents } = await databases.listDocuments(
            appwriteConfig.databaseId,              // Which database to query
            appwriteConfig.usersCollectionId,       // Which collection (users table)
            [
                // Query filters and options:
                Query.equal('accountId', user.$id),  // Find user by their Appwrite account ID
                Query.select(['name', 'email', 'imageUrl', 'JoinedAt', 'accountId'])  // Only get these fields (performance optimization)
            ]
        )

        // ===== STEP 4: RETURN USER DATA =====
        // Note: This function currently doesn't return the documents
        // You might want to add: return documents[0] || null
        
    } catch(e) {
        // ===== ERROR HANDLING =====
        // Log any errors that occur during user data fetching
        // This could be network issues, database problems, or authentication failures
        console.log(e)
    }
}

/**
 * ========================================
 * USER LOGOUT FUNCTION
 * ========================================
 * 
 * Handles the complete logout process for authenticated users. This function
 * terminates the user's active session in Appwrite and redirects them to the
 * sign-in page, ensuring they can't access protected routes.
 * 
 * Security Features:
 * - Completely destroys the user's session (not just client-side logout)
 * - Server-side session termination prevents session hijacking
 * - Automatic redirect prevents access to protected routes
 * 
 * Flow:
 * 1. User clicks logout button
 * 2. This function is called
 * 3. Appwrite session is deleted on the server
 * 4. User is redirected to sign-in page
 * 5. All authentication tokens are invalidated
 * 
 * @returns {Promise<Response>} - Redirect response to sign-in page
 * @throws {Error} - Re-throws any logout errors for handling by calling code
 */
export const logoutUser = async() =>{
    try{
        // ===== STEP 1: DELETE ACTIVE SESSION =====
        // This terminates the user's current session on Appwrite servers
        // 'current' refers to the currently active session
        // This invalidates all authentication tokens and cookies
        await account.deleteSession('current')
        
        // ===== STEP 2: REDIRECT TO SIGN-IN PAGE =====
        // After successful logout, redirect user to sign-in page
        // This prevents them from accessing protected routes
        // return true; (commented out - redirect is preferred)
        return redirect('/sign-in')
        
    } catch(e) {
        // ===== ERROR HANDLING =====
        // Log the specific logout error for debugging
        console.log('Error logging out user:', e)
        
        // Re-throw the error so calling code can handle it
        // This allows UI to show error messages or retry logic
        throw e
    }
}

/**
 * ========================================
 * GOOGLE PROFILE PICTURE FETCHER
 * ========================================
 * 
 * Fetches the user's profile picture from Google People API using their OAuth token.
 * This function leverages the Google access token from the OAuth session to make
 * authenticated requests to Google's People API and retrieve profile photos.
 * 
 * Technical Details:
 * - Uses Google People API v1 endpoint
 * - Requires 'photos' permission scope (granted during OAuth)
 * - Returns high-resolution profile picture URLs
 * - Handles cases where users have no profile picture
 * 
 * API Endpoint: https://people.googleapis.com/v1/people/me?personFields=photos
 * 
 * @returns {Promise<string|null>} - Profile picture URL or null if unavailable
 */
export const getGooglePicture = async() =>{
    try{
        // ===== STEP 1: GET CURRENT OAUTH SESSION =====
        // Retrieve the active session to access the Google access token
        // This session was created during the Google OAuth login process
        const session = await account.getSession('current')
        
        // ===== STEP 2: VALIDATE SESSION AND PROVIDER =====
        // Ensure we have a valid session and it's specifically from Google OAuth
        // This prevents errors when users login via other methods in the future
        if (!session || session.provider !== 'google') {
            throw new Error('No active Google OAuth session found')
        }

        // ===== STEP 3: EXTRACT GOOGLE ACCESS TOKEN =====
        // The access token allows us to make authenticated requests to Google APIs
        // This token was provided by Google during the OAuth process
        const accessToken = session.providerAccessToken

        // Validate that we actually have an access token
        if (!accessToken) {
            throw new Error('No Google access token available')
        }

        // ===== STEP 4: FETCH USER PROFILE FROM GOOGLE PEOPLE API =====
        // Make an authenticated request to Google's People API
        // The 'photos' personField specifically requests profile picture data
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,  // OAuth Bearer token authentication
                'Content-Type': 'application/json'         // Specify JSON response format
            }
        })

        // ===== STEP 5: HANDLE API RESPONSE ERRORS =====
        // Check if the Google API request was successful
        if (!response.ok) {
            throw new Error(`Google People API error: ${response.status} ${response.statusText}`)
        }

        // ===== STEP 6: PARSE RESPONSE DATA =====
        // Convert the response to JSON to access the profile data
        const data = await response.json()
        
        // ===== STEP 7: EXTRACT PROFILE PHOTO URL =====
        // Google returns an array of photos (profile pictures)
        if (data.photos && data.photos.length > 0) {
            // Try to find the primary photo first, otherwise use the first available photo
            // Primary photo is usually the main profile picture set by the user
            const primaryPhoto = data.photos.find((photo: any) => photo.metadata?.primary) || data.photos[0]
            return primaryPhoto.url  // Return the direct URL to the image
        }

        // ===== STEP 8: HANDLE NO PHOTO CASE =====
        // Return null if the user doesn't have a profile picture set
        return null // No profile photo available
        
    } catch(e) {
        // ===== ERROR HANDLING =====
        // Log detailed error information for debugging
        console.log('Error fetching Google profile picture:', e)
        // Return null instead of throwing to allow graceful handling
        return null
    }
}

export const storeUserData = async() =>{
    try{
        // ===== STEP 1: GET AUTHENTICATED USER =====
        // This gets the current logged-in user's account information from Appwrite
        // The user must be authenticated (logged in) for this to work
        const user = await account.get()
        
        // If no user is found (not logged in), throw an error
        if (!user) {
            throw new Error('No authenticated user found')
        }

        // ===== STEP 2: CHECK IF USER ALREADY EXISTS =====
        // Before creating a new user record, check if they already exist in our database
        // This prevents duplicate user records when someone logs in multiple times
        const existingUser = await getExistingUser()
        
        // If user already exists, return their existing data instead of creating duplicate
        if (existingUser) {
            console.log('User already exists in database')
            return existingUser
        }

        // ===== STEP 3: GET USER'S PROFILE PICTURE =====
        // Fetch the user's profile picture from Google using the Google People API
        // This uses their OAuth token to access their Google profile photo
        const imageUrl = await getGooglePicture()

        // ===== STEP 4: PREPARE USER DATA OBJECT =====
        // Create a structured object with all the user information we want to store
        const userData = {
            accountId: user.$id,           // Appwrite's unique user ID (links to their account)
            name: user.name,               // User's display name from Google account
            email: user.email,             // User's email address from Google account
            imageUrl: imageUrl || '',      // Profile picture URL from Google (empty string if none)
            JoinedAt: new Date().toISOString(), // Current timestamp when user joined our app
        }

        // ===== STEP 5: SAVE TO DATABASE =====
        // Create a new document (record) in the Appwrite database
        // This stores the user's information in our "users" collection
        const newUserDocument = await databases.createDocument(
            appwriteConfig.databaseId,           // Which database to use
            appwriteConfig.usersCollectionId,    // Which collection (table) to store in
            ID.unique(),                         // Generate a unique document ID automatically
            userData                             // The actual data to store
        )

        // ===== STEP 6: SUCCESS LOGGING & RETURN =====
        // Log success message for debugging and return the created user document
        console.log('User data stored successfully:', newUserDocument)
        return newUserDocument

    } catch(e) {
        // ===== ERROR HANDLING =====
        // If anything goes wrong, log the error and re-throw it
        // This allows the calling function to handle the error appropriately
        console.log('Error storing user data:', e)
        throw e
    }
}

/**
 * ========================================
 * USER EXISTENCE CHECKER FUNCTION
 * ========================================
 * 
 * Checks if the currently authenticated user already has a profile record
 * in the application's database. This prevents creating duplicate user
 * records when someone logs in multiple times.
 * 
 * Use Cases:
 * - Called before creating new user records
 * - User profile validation
 * - Onboarding flow control
 * 
 * Database Query Strategy:
 * - Searches by accountId (links Appwrite auth to database record)
 * - Limits results to 1 for performance (we only need to know if ANY record exists)
 * - Returns the actual user document if found (useful for profile data)
 * 
 * @returns {Promise<Object|null>} - User document if exists, null if not found
 */
export const getExistingUser = async() =>{
    try{
        // ===== STEP 1: GET CURRENT AUTHENTICATED USER =====
        // Retrieve the currently logged-in user's account information
        // This gives us the accountId to search for in the database
        const user = await account.get()
        
        // ===== STEP 2: HANDLE UNAUTHENTICATED CASE =====
        // If no user is authenticated, return null immediately
        // This prevents unnecessary database queries
        if (!user) {
            return null
        }

        // ===== STEP 3: SEARCH DATABASE FOR EXISTING USER RECORD =====
        // Query the users collection to find any existing record for this user
        const { documents } = await databases.listDocuments(
            appwriteConfig.databaseId,              // Target database
            appwriteConfig.usersCollectionId,       // Target collection (users table)
            [
                // Query filters:
                Query.equal('accountId', user.$id),  // Find record matching the user's account ID
                Query.limit(1)                      // Only get first result (performance optimization)
            ]
        )

        // ===== STEP 4: RETURN RESULT =====
        // If documents array has items, return the first (and only) user document
        // If documents array is empty, return null (user doesn't exist in database)
        return documents.length > 0 ? documents[0] : null

    } catch(e) {
        // ===== ERROR HANDLING =====
        // Log any errors that occur during the existence check
        console.log('Error checking existing user:', e)
        
        // Return null on error to allow graceful handling
        // This prevents blocking user flows due to database issues
        return null
    }
}