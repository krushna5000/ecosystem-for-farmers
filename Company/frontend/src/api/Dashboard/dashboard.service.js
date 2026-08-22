import * as brandService from "../InventoryManagementApis/brand.service";
import * as categoryService from "../InventoryManagementApis/catagory.service";
import * as productService from "../InventoryManagementApis/product.service"; 

export async function getDashboardSummary() {
  const [brandRes, categories, products] = await Promise.all([
    brandService.getAllBrands(),
    categoryService.getAllCategories(),
    productService.getAllProducts()
  ]);

  const brands = brandRes.brands || []
  const activBrands = brands.filter(b => b.status == "Active").length; 
  const inactiveBrands = brands.filter(b => b.status == "Inactive").length; 

  return {
    totalBrands: brandRes?.length ?? 0,
    totalCategories: categories?.length,
    totalProducts: products?.length ?? 0,
    activBrands,
    inactiveBrands
  };
}
