// @ts-ignore
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
    const { barcode } = await req.json()

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Call OpenFoodFacts v2 API
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
    const data = await res.json()

    if (data.status === 1 && data.product) {
      const p = data.product;
      const n = p.nutriments || {};

      const productData = {
        barcode: barcode,
        name: p.product_name || p.product_name_fr || "Unknown Product",
        brands: p.brands || null,
        quantity: p.quantity || null,
        categories: p.categories || null,
        labels: p.labels || null,
        origins: p.origins || null,
        manufacturing_places: p.manufacturing_places || null,
        stores: p.stores || null,
        countries: p.countries || null,
        nutriscore_grade: p.nutriscore_grade || null,
        ecoscore_grade: p.ecoscore_grade || null,
        nova_group: p.nova_group || null,
        image_url: p.image_front_url || p.image_url || null,
        raw_ingredients_text: p.ingredients_text || p.ingredients_text_fr || null,
        // Macros per 100g
        calories: n['energy-kcal_100g'] != null ? Math.round(n['energy-kcal_100g']) : null,
        protein: n.proteins_100g != null ? Math.round(n.proteins_100g * 10) / 10 : null,
        carbs: n.carbohydrates_100g != null ? Math.round(n.carbohydrates_100g * 10) / 10 : null,
        fats: n.fat_100g != null ? Math.round(n.fat_100g * 10) / 10 : null,
        fiber: n.fiber_100g != null ? Math.round(n.fiber_100g * 10) / 10 : null,
        sugars: n['sugars_100g'] != null ? Math.round(n['sugars_100g'] * 10) / 10 : null,
        saturated_fat: n['saturated-fat_100g'] != null ? Math.round(n['saturated-fat_100g'] * 10) / 10 : null,
        salt: n.salt_100g != null ? Math.round(n.salt_100g * 100) / 100 : null,
      };

      return new Response(
        JSON.stringify({ product: productData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(err)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
