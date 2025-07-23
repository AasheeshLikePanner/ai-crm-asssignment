import { updateCustomerAIResults, getCustomerAIProfile } from './services/interactionService.js';

const aiProcessingQueue = new Map();
const PROCESSING_DELAY_MS = 5 * 1000;

export function addInteractionToAIQueue(interaction) {
    aiProcessingQueue.set(interaction.id, { ...interaction, queuedAt: Date.now() });
    console.log(`Interaction ${interaction.id} added to AI processing queue.`);
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const AI_PROMPT = `Analyze the provided sales interaction note. Your task is to extract and update a customer profile based on the note.

**Instructions:**
1.  **Analyze the New Note:** Identify any new customer preferences, objections, or buying signals.
2.  **Update the Profile:**
    - Add new items to the appropriate arrays.
    - Remove or update existing items if the new note contradicts them.
    - Adjust the 'confidence_score' (a float between 0.0 and 1.0) based on the sentiment and signals in the new note. A higher score indicates a higher likelihood of closing a deal.
3.  **Output Format:**
    - Your response MUST be ONLY a single, valid JSON object.
    - Do NOT include any text, explanations, or markdown formatting (like /'/'/'json) before or after the JSON object.
    - The JSON object must have the following structure:
      {
        "preferences": ["string"],
        "objections": ["string"],z
        "buying_signals": ["string"],
        "confidence_score": float
      }

**Example Interaction:**

**Existing Profile:**
{
  "preferences": ["Wants a 5-year warranty"],
  "objections": ["Price is too high"],
  "buying_signals": ["Asked for a quote"],
  "confidence_score": 0.6
}

**New Note:**
"Customer mentioned the price is no longer an issue, but is now concerned about the implementation timeline. They asked for a detailed project plan."

**Correct Output (JSON only):**
{
  "preferences": ["Wants a 5-year warranty"],
  "objections": ["Concerned about implementation timeline"],
  "buying_signals": ["Asked for a quote", "Asked for a detailed project plan"],
  "confidence_score": 0.7
}
`;
 
async function processNoteWithAI(noteContent, existingCustomerAIProfile) {
    let messages = [
        { role: "user", content: AI_PROMPT }
    ];

    if (existingCustomerAIProfile && (existingCustomerAIProfile.preferences || existingCustomerAIProfile.objections || existingCustomerAIProfile.buying_signals)) {
        messages.push({
            role: "user", content: `Existing customer profile:
            Preferences: ${existingCustomerAIProfile.preferences ? existingCustomerAIProfile.preferences.join(', ') : 'None'}
            Objections: ${existingCustomerAIProfile.objections ? existingCustomerAIProfile.objections.join(', ') : 'None'}
            Buying Signals: ${existingCustomerAIProfile.buying_signals ? existingCustomerAIProfile.buying_signals.join(', ') : 'None'}
            confidence_scrore: ${existingCustomerAIProfile.confidence_score ? existingCustomerAIProfile.confidence_score : 'None'}


            Based on the new note, refine or add to these.` });
    }

    messages.push({ role: "user", content: `New Note: ${noteContent}` });

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct", 
                messages: messages,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const aiResponseContent = data.choices[0].message.content;
        console.log(aiResponseContent);

        const jsonMatch = aiResponseContent.match(/\{.*\}/s);
        if (!jsonMatch) {
            throw new Error("No valid JSON object found in the AI response.");
        }
        const jsonResponse = jsonMatch[0];

        return JSON.parse(jsonResponse);
    } catch (error) {
        console.error("Error processing note with AI:", error);
        return null;
    }
}

async function runAIProcessor() {
    try {
        const now = Date.now();
        for (const [id, interaction] of aiProcessingQueue.entries()) {
            if (now - interaction.queuedAt >= PROCESSING_DELAY_MS) {
                console.log(`Processing interaction ${interaction.id} from queue.`);
                const customerAIProfile = await getCustomerAIProfile(interaction.customer_id);
                console.log(customerAIProfile);

                const aiResults = await processNoteWithAI(interaction.note, customerAIProfile);
                if (aiResults) {
                    await updateCustomerAIResults(interaction.customer_id, {
                        preferences: aiResults.preferences,
                        objections: aiResults.objections,
                        buying_signals: aiResults.buying_signals,
                        confidence_score: aiResults.confidence_score || 0.8,
                    });
                    aiProcessingQueue.delete(id);
                    console.log(`Processed interaction ${interaction.id} and updated customer ${interaction.customer_id} with AI results.`);
                } else {
                    console.warn(`AI processing failed for interaction ${interaction.id}. Keeping in queue for retry.`);
                }
            }
        }
    } catch (error) {
        console.error("Error in AI processor:", error);
    }
}

export function startAIProcessor() {
    runAIProcessor();
    setInterval(runAIProcessor, 5 * 1000);
}