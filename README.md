# AI-Powered CRM

This project is an AI-powered Customer Relationship Management (CRM) system designed to help sales teams manage customer interactions, deals, and gain insights from notes using AI.

## Current Features

### Backend (Node.js with Express & Supabase)

*   **Customer Management:** APIs for creating, reading, updating, and deleting customer records.
*   **Deal Management:** APIs for managing sales deals associated with customers.
*   **Interaction Management:** APIs for recording and managing interactions (e.g., calls, meetings, emails) with customers.
    *   **Interaction Linking:** When a new interaction is created, its ID is now automatically pushed into the `interaction_ids` array of the associated customer record in the `customers` table.
    *   **Batch Interaction Fetching:** Added a new endpoint (`POST /interactions/batch`) to fetch multiple interaction details given a list of interaction IDs.
*   **Supabase Integration:** Uses Supabase as the database for storing all CRM data.
*   **AI Note Processing:**
    *   **AI-Powered Insight Generation:** The AI processes raw interaction notes to automatically extract and generate structured insights such as customer preferences, objections, and buying signals.
    *   **In-Memory Queue Processing:** AI processing for new notes now uses an in-memory queue for immediate analysis after creation.
    *   **Background Processing:** A background task runs periodically (every minute) to process notes from the in-memory queue.
    *   **OpenRouter Integration:** Sends note content to the OpenRouter AI service for analysis.
    *   **Enhanced AI Prompting:** Incorporates existing customer AI profile data (preferences, objections, buying signals) into the AI prompt to provide context and improve the quality of AI-generated insights.
    *   **AI Data Storage:** Extracts customer preferences, objections, and buying signals from notes and stores them directly in the `customers` table, enriching the customer's profile.

### Frontend (React with Vite)

*   **Customer Dashboard:** Displays a list of customers.
*   **Customer Details Panel:** Shows detailed information for a selected customer.
    *   **AI Insights Display:** Now displays AI-generated preferences, objections, buying signals, and confidence score directly on the customer details panel.
    *   **Scrollable Panel:** The customer details panel is now independently scrollable for better UX with long content.
    *   **Interaction Display:** Displays historical interactions associated with each customer by fetching full interaction objects based on `interaction_ids` stored on the customer object.
*   **Realtime Note Taker:** A rich text editor for capturing interaction notes.
*   **Auto-Save for Notes:** Implements a 5-second debounce auto-save mechanism for notes, ensuring data persistence during note-taking.

## Setup for AI Features

To enable the AI processing features, you need to perform the following steps:

1.  **Environment Variable:**
    Create or update the `.env` file in the `backend/` directory with your OpenRouter API key:
    ```
    OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
    ```

2.  **Supabase Database Schema Updates:**

    *   **`customers` table:**
        Add the following columns to your `customers` table:
        *   `preferences` (Type: `TEXT[]` or `JSONB` if you prefer structured JSON)
        *   `objections` (Type: `TEXT[]` or `JSONB`)
        *   `buying_signals` (Type: `TEXT[]` or `JSONB`)
        *   `confidence_score` (Type: `REAL` or `FLOAT`, Default Value: `0.8`)
        *   `interaction_ids` (Type: `TEXT[]` or `JSONB` to store an array of interaction UUIDs)

    *   **`interactions` table:**
        Ensure the `updated_at` column is configured to automatically update on row changes (this is often a default or can be set up with a trigger in Supabase).
        Add the following column:
        *   `ai_processed` (Type: `BOOLEAN`, Default Value: `FALSE`)

Once these steps are completed, the backend AI processor will automatically start analyzing notes and updating customer profiles when the backend server is running.
