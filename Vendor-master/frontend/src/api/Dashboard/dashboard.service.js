import * as brandService from "../InventoryManagementApis/brand.service";
import * as categoryService from "../InventoryManagementApis/catagory.service";
import * as productService from "../InventoryManagementApis/product.service"; 

export async function getDashboardSummary() {
  const [brands, categories, products] = await Promise.all([
    brandService.getAllBrands(),
    categoryService.getAllCategories(),
    productService.getAllProducts(1,1)
  ]);

  console.log("Product res : ", products)
  const activBrands = brands.filter(b => b.status == "Active").length; 
  const inactiveBrands = brands.filter(b => b.status == "Inactive").length; 

  return {
    totalBrands: brands.length,
    totalCategories: categories.length,
    totalProducts: products?.pagination?.total ?? 0,
    activBrands,
    inactiveBrands
  };
}
