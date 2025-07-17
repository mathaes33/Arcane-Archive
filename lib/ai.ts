
export interface AnalyzedBookData {
    title: string;
    author: string;
    year: number;
    description: string;
    tags: string[];
}

/**
 * Analyzes a given text by calling a secure serverless function.
 * @param textContent The text of the document to analyze.
 * @returns A promise that resolves to the structured book data.
 */
export async function analyzeText(textContent: string): Promise<AnalyzedBookData> {
    try {
        const response = await fetch('/.netlify/functions/analyze-manuscript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ textContent }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred during analysis.' }));
            // Use the more specific error from the function if available
            throw new Error(errorData.error || `The AI scribe failed. Status: ${response.status}`);
        }

        const data = await response.json();

        // Basic validation of the response from our function
        if (!data.title || !data.author || typeof data.year !== 'number' || !data.description || !Array.isArray(data.tags)) {
            throw new Error("AI response was incomplete or malformed.");
        }
        
        return data as AnalyzedBookData;

    } catch (error) {
        console.error("Error calling analyze function:", error);
        const errorMessage = error instanceof Error ? error.message : "The AI scribe failed to interpret the manuscript. Please try again.";
        // Re-throw the refined error message to be caught by the UI
        throw new Error(errorMessage);
    }
}
