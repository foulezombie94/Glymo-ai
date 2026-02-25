/**
 * Utility for Open Food Facts API
 */

export const fetchProductByBarcode = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1) {
      const p = data.product;
      return {
        name: p.product_name || p.generic_name || 'Unknown Product',
        brands: p.brands || '',
        calories: p.nutriments?.['energy-kcal_100g'] || 0,
        protein: p.nutriments?.protein_100g || 0,
        carbs: p.nutriments?.carbohydrates_100g || 0,
        fats: p.nutriments?.fat_100g || 0,
        image_url: p.image_url || null,
        barcode: barcode
      };
    }
    return null;
  } catch (error) {
    console.error('OFF API Error:', error);
    return null;
  }
};
