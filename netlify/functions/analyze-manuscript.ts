
import { GoogleGenAI, Type } from "@google/genai";

// This schema guides the AI to return data in the desired format.
const schema = {
  type: Type.OBJECT,
  properties: {
    title: { 
        type: Type.STRING, 
        description: "The full title of the document. Infer it from the text if not explicitly stated." 
    },
    author: { 
        type: Type.STRING, 
        description: "The author of the document. Use 'Unknown' if no author can be found." 
    },
    year: { 
        type: Type.INTEGER, 
        description: "The year the document was written or published as a number. Provide a reasonable estimate if not specified (e.g., 350 for 350 AD, -300 for 300 BC)." 
    },
    description: { 
        type: Type.STRING, 
        description: "A concise, one-paragraph summary of the document's esoteric content, themes, and purpose." 
    },
    tags: {
      type: Type.ARRAY,
      description: "Up to 5 relevant esoteric tags that categorize the text. Choose from: Hermeticism, Metaphysics, Alchemy, Gnosticism, Philosophy, Occult, Symbolism, Tarot, Thelema, Magic, Renaissance, Kabbalah, Mysticism, Judaism, Coptic, Psychology, Astrology, Christian Hermeticism, Rosicrucianism. If none of these apply, you can create new, relevant tags.",
      items: { type: Type.STRING }
    }
  },
  required: ["title", "author", "year", "description", "tags"]
};

const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set on server.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API key not found." }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const textContent = body.textContent;

        if (!textContent || typeof textContent !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing or invalid textContent in request body.' }),
            };
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following text from an esoteric document. Extract or generate the title, author, a concise summary, the likely year or era of writing as a number, and up to five relevant tags. Provide the output in the requested JSON format. Here is the text: \n\n---\n\n${textContent.substring(0, 30000)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonString = result.text.trim();
        const data = JSON.parse(jsonString);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
        
    } catch (error) {
        console.error("Error in Netlify function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "The AI scribe failed to interpret the manuscript.", details: errorMessage }),
        };
    }
};

export { handler };
