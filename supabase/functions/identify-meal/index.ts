import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const imageBase64 = body.image
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      // Fallback for demo if no key is set
      return new Response(
        JSON.stringify({ 
          product: {
            name: "Scanned Healthy Bowl",
            calories: 582,
            protein: 42,
            carbs: 12,
            fats: 34,
            raw_ingredients_text: "Grilled Salmon, Fresh Avocado, Quinoa Base, Olive Oil Dressing",
            ingredientsList: [
              { name: "Grilled Salmon", weight_g: 150, calories: 240, protein: 34, carbs: 0, fats: 11, icon: "set_meal" },
              { name: "Fresh Avocado", weight_g: 50, calories: 160, protein: 2, carbs: 8, fats: 15, icon: "eco" },
              { name: "Quinoa Base", weight_g: 100, calories: 120, protein: 4, carbs: 21, fats: 2, icon: "grass" },
              { name: "Olive Oil Dressing", weight_g: 15, calories: 62, protein: 0, carbs: 0, fats: 7, icon: "opacity" }
            ]
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this food image. Provide name, calories, protein, carbs, fats, and a list of ingredients with weight_g, calories, protein, carbs, fats, and a material icon name. Return ONLY valid JSON." },
            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    })

    const data = await response.json()
    const resultText = data.candidates[0].content.parts[0].text
    const product = JSON.parse(resultText)

    return new Response(
      JSON.stringify({ product }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
