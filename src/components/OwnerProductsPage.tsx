import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ArrowLeft,
  LogOut,
  ShoppingBag,
  Plus,
  Trash2,
  PackagePlus,
  Package,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Product, Ingredient, ProductIngredient } from '../App';

interface OwnerProductsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  coffee: 'bg-amber-100 text-amber-800',
  'non-coffee': 'bg-blue-100 text-blue-800',
  snacks: 'bg-green-100 text-green-800',
  'moon-bowls': 'bg-purple-100 text-purple-800',
};

// Category display names
const categoryNames: Record<string, string> = {
  coffee: 'Coffee',
  'non-coffee': 'Non-Coffee',
  snacks: 'Snacks',
  'moon-bowls': 'Moon Bowls',
};

export function OwnerProductsPage({ onBack, onLogout }: OwnerProductsPageProps) {
  // State for products and ingredients
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [productIngredients, setProductIngredients] = useState<
    Record<string, ProductIngredient[]>
  >({});
  const [loading, setLoading] = useState(true);

  // View state - 'products' or 'ingredients'
  const [currentView, setCurrentView] = useState<'products' | 'ingredients'>('products');

  // Dialog states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [isManageIngredientsOpen, setIsManageIngredientsOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Form states - Add Product
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');

  // Form states - Edit Product
  const [editProductName, setEditProductName] = useState('');
  const [editProductCategory, setEditProductCategory] = useState('');

  // Form states - Add Ingredient
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');

  // Form states - Manage Product Ingredients
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  // Real-time listener for products
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const loadedProducts: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            category: data.category || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
          };
        });
        setProducts(loadedProducts);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time listener for ingredients
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'ingredients'),
      (snapshot) => {
        const loadedIngredients: Ingredient[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            quantity: Number(data.quantity) || 0,
            unit: data.unit || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
          };
        });
        setIngredients(loadedIngredients);
      },
      (error) => {
        console.error('Error fetching ingredients:', error);
        toast.error('Failed to load ingredients');
      }
    );
    return () => unsubscribe();
  }, []);

  // Load product ingredients for all products (re-subscribe only when the set of product ids changes)
  const productIdsKey = products.map((p) => p.id).sort().join('|');
  useEffect(() => {
    const productIds = productIdsKey ? productIdsKey.split('|') : [];

    // Drop cached ingredient lists for products that no longer exist
    setProductIngredients((prev) => {
      const next: Record<string, ProductIngredient[]> = {};
      productIds.forEach((id) => {
        if (prev[id]) next[id] = prev[id];
      });
      return next;
    });

    if (productIds.length === 0) return;

    const unsubscribes = productIds.map((productId) => {
      return onSnapshot(
        collection(db, 'products', productId, 'ingredients'),
        (snapshot) => {
          const loadedIngredients: ProductIngredient[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ingredientId: data.ingredientId || '',
              ingredientName: data.ingredientName || '',
              quantity: Number(data.quantity) || 0,
              unit: data.unit || '',
            };
          });
          setProductIngredients((prev) => ({
            ...prev,
            [productId]: loadedIngredients,
          }));
        },
        (error) => {
          console.error('Error fetching product ingredients:', error);
        }
      );
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [productIdsKey]);

  // Handler: Add Product
  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (!newProductCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);
    try {
      const productsCollection = collection(db, 'products');
      const productDocRef = doc(productsCollection);

      await setDoc(productDocRef, {
        productId: productDocRef.id,
        name: newProductName.trim(),
        category: newProductCategory,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      toast.success('Product added successfully!');
      setNewProductName('');
      setNewProductCategory('');
      setIsAddProductOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Add Ingredient to master database
  const handleAddIngredient = async () => {
    if (!newIngredientName.trim()) {
      toast.error('Please enter an ingredient name');
      return;
    }
    if (!newIngredientUnit) {
      toast.error('Please select a unit');
      return;
    }

    setIsSaving(true);
    try {
      const ingredientsCollection = collection(db, 'ingredients');
      const ingredientDocRef = doc(ingredientsCollection);

      await setDoc(ingredientDocRef, {
        ingredientId: ingredientDocRef.id,
        name: newIngredientName.trim(),
        unit: newIngredientUnit,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      toast.success('Ingredient added to database!');
      setNewIngredientName('');
      setNewIngredientUnit('');
      setIsAddIngredientOpen(false);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to add ingredient');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Delete Ingredient from master database
  const handleDeleteIngredient = async (ingredientId: string, ingredientName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${ingredientName}" from the database?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'ingredients', ingredientId));
      toast.success('Ingredient deleted successfully!');
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  // Handler: Edit Product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProductName(product.name);
    setEditProductCategory(product.category);
    setIsEditProductOpen(true);
  };

  // Handler: Save Edited Product
  const handleSaveEditProduct = async () => {
    if (!selectedProduct) return;
    if (!editProductName.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (!editProductCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);
    try {
      const productDocRef = doc(db, 'products', selectedProduct.id);
      await updateDoc(productDocRef, {
        name: editProductName.trim(),
        category: editProductCategory,
        lastUpdated: serverTimestamp(),
      });

      toast.success('Product updated successfully!');
      setIsEditProductOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Open Delete Product Confirmation
  const handleOpenDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteProductOpen(true);
  };

  // Handler: Delete Product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      // Delete the product's ingredient subcollection docs together with the product
      const batch = writeBatch(db);
      (productIngredients[selectedProduct.id] || []).forEach((ing) => {
        batch.delete(doc(db, 'products', selectedProduct.id, 'ingredients', ing.id));
      });
      batch.delete(doc(db, 'products', selectedProduct.id));
      await batch.commit();

      toast.success('Product deleted successfully!');
      setIsDeleteProductOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Add ingredient to product
  const handleAddIngredientToProduct = async () => {
    if (!selectedProduct) return;
    if (!selectedIngredientId) {
      toast.error('Please select an ingredient');
      return;
    }
    const quantity = parseFloat(ingredientQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const selectedIng = ingredients.find((i) => i.id === selectedIngredientId);
    if (!selectedIng) {
      toast.error('Selected ingredient not found');
      return;
    }

    const alreadyAdded = (productIngredients[selectedProduct.id] || []).some(
      (ing) => ing.ingredientId === selectedIng.id
    );
    if (alreadyAdded) {
      toast.error(`${selectedIng.name} is already in this product. Remove it first to change the quantity.`);
      return;
    }

    setIsSaving(true);
    try {

      const productIngredientsCollection = collection(
        db,
        'products',
        selectedProduct.id,
        'ingredients'
      );
      const productIngredientDocRef = doc(productIngredientsCollection);

      await setDoc(productIngredientDocRef, {
        ingredientId: selectedIng.id,
        ingredientName: selectedIng.name,
        quantity,
        unit: selectedIng.unit,
      });

      toast.success('Ingredient added to product!');
      setSelectedIngredientId('');
      setIngredientQuantity('');
    } catch (error) {
      console.error('Error adding ingredient to product:', error);
      toast.error('Failed to add ingredient to product');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Remove ingredient from product
  const handleRemoveIngredient = async (productId: string, ingredientId: string) => {
    try {
      const docRef = doc(db, 'products', productId, 'ingredients', ingredientId);
      await deleteDoc(docRef);
      toast.success('Ingredient removed from product');
    } catch (error) {
      console.error('Error removing ingredient:', error);
      toast.error('Failed to remove ingredient');
    }
  };

  // Handler: Open manage ingredients dialog
  const handleManageIngredients = (product: Product) => {
    setSelectedProduct(product);
    setSelectedIngredientId('');
    setIngredientQuantity('');
    setIsManageIngredientsOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                aria-label="Go back"
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-pink-900">Product Management</h1>
                  <p className="text-sm text-gray-600">Manage your products and ingredients</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              aria-label="Log out"
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle - Pill Style */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full bg-cyan-100 p-1">
            <button
              type="button"
              aria-pressed={currentView === 'products'}
              onClick={() => setCurrentView('products')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'products'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-cyan-600 hover:text-cyan-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
            <button
              type="button"
              aria-pressed={currentView === 'ingredients'}
              onClick={() => setCurrentView('ingredients')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'ingredients'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-cyan-600 hover:text-cyan-700'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              Master Ingredients
            </button>
          </div>
        </div>

        {/* Master Ingredients View */}
        {currentView === 'ingredients' && (
          <>
            {/* Add Ingredient Button */}
            <div className="mb-6">
              <Button
                onClick={() => setIsAddIngredientOpen(true)}
                style={{ backgroundColor: '#db2777', color: '#ffffff' }}
                className="hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Ingredient
              </Button>
            </div>

            {/* Ingredients Table */}
            {ingredients.length === 0 ? (
              <div className="text-center py-12">
                <PackagePlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-600">No ingredients in database</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click "Add New Ingredient" to add your first ingredient
                </p>
              </div>
            ) : (
              <Card className="border-pink-200">
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Ingredient Name</TableHead>
                        <TableHead className="font-semibold">Unit</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell className="font-medium">{ingredient.name}</TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIngredient(ingredient.id, ingredient.name)}
                              aria-label={`Delete ${ingredient.name}`}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Products View */}
        {currentView === 'products' && (
          <>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            type="button"
            onClick={() => setIsAddProductOpen(true)}
            style={{ backgroundColor: '#db2777', color: '#ffffff' }}
            className="hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">No products yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Add Product" to create your first product
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const prodIngredients = productIngredients[product.id] || [];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="border-pink-200 hover:border-pink-300 transition-all hover:shadow-xl relative h-full">
                    <CardContent className="pt-6 flex flex-col h-full">
                      {/* Category Badge */}
                      <Badge
                        className={`absolute top-3 right-3 ${
                          categoryColors[product.category] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {categoryNames[product.category] || product.category}
                      </Badge>

                      {/* Product Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-4 pr-20">
                        {product.name}
                      </h3>

                      {/* Ingredients Section */}
                      <div className="flex-1 mb-4">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                          Ingredients:
                        </p>
                        {prodIngredients.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No ingredients added</p>
                        ) : (
                          <div className="space-y-1">
                            {prodIngredients.map((ing) => (
                              <div
                                key={ing.id}
                                className="flex justify-between text-sm bg-gray-50 px-2 py-1 rounded"
                              >
                                <span className="font-medium text-gray-700">{ing.ingredientName}</span>
                                <span className="text-gray-600">
                                  {ing.quantity} {ing.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageIngredients(product)}
                          className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
                        >
                          Manage Ingredients
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          aria-label={`Edit ${product.name}`}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDeleteProduct(product)}
                          aria-label={`Delete ${product.name}`}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
          </>
        )}
      </main>

      {/* Add Product Dialog - Custom Modal */}
      {isAddProductOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsAddProductOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Add New Product
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="e.g., Cappuccino"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                style={{ marginTop: '0.25rem' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <Label htmlFor="product-category">Category</Label>
              <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                <SelectTrigger id="product-category" style={{ marginTop: '0.25rem' }}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 10000 }}>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="non-coffee">Non-Coffee</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="moon-bowls">Moon Bowls</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={isSaving}
                style={{ backgroundColor: '#db2777', color: '#ffffff' }}
                className="hover:bg-pink-700"
              >
                Add Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Dialog - Custom Modal */}
      {isAddIngredientOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsAddIngredientOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Add New Ingredient to Database
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <Label htmlFor="ingredient-name">Ingredient Name</Label>
              <Input
                id="ingredient-name"
                placeholder="e.g., Milk"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                style={{ marginTop: '0.25rem' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <Label htmlFor="ingredient-unit">Unit</Label>
              <Select value={newIngredientUnit} onValueChange={setNewIngredientUnit}>
                <SelectTrigger id="ingredient-unit" style={{ marginTop: '0.25rem' }}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 10000 }}>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="L">Liters (L)</SelectItem>
                  <SelectItem value="ml">Milliliters (ml)</SelectItem>
                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsAddIngredientOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddIngredient}
                disabled={isSaving}
                style={{ backgroundColor: '#db2777', color: '#ffffff' }}
                className="hover:bg-pink-700"
              >
                Add Ingredient
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Dialog */}
      {isEditProductOpen && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsEditProductOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Edit Product
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <Label htmlFor="edit-product-name">Product Name</Label>
              <Input
                id="edit-product-name"
                placeholder="e.g., Cappuccino"
                value={editProductName}
                onChange={(e) => setEditProductName(e.target.value)}
                style={{ marginTop: '0.25rem' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <Label htmlFor="edit-product-category">Category</Label>
              <Select value={editProductCategory} onValueChange={setEditProductCategory}>
                <SelectTrigger id="edit-product-category" style={{ marginTop: '0.25rem' }}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 10000 }}>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="non-coffee">Non-Coffee</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="moon-bowls">Moon Bowls</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditProduct}
                disabled={isSaving}
                style={{ backgroundColor: '#db2777', color: '#ffffff' }}
                className="hover:bg-pink-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Dialog */}
      {isDeleteProductOpen && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsDeleteProductOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#dc2626' }}>
              Delete Product
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
              Are you sure you want to delete <strong>"{selectedProduct.name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsDeleteProductOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteProduct}
                disabled={isSaving}
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                className="hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Product Ingredients Modal */}
      {isManageIngredientsOpen && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsManageIngredientsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Manage Ingredients for {selectedProduct.name}
            </h2>

            {/* Current Ingredients */}
            <div style={{ marginBottom: '1.5rem' }}>
              <Label className="text-base font-semibold">Current Ingredients:</Label>
              {(productIngredients[selectedProduct.id]?.length || 0) === 0 ? (
                <p className="text-sm text-gray-500 italic" style={{ marginTop: '0.5rem' }}>
                  No ingredients added yet
                </p>
              ) : (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {productIngredients[selectedProduct.id]?.map((ing) => (
                      <div
                        key={ing.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <span className="font-medium text-gray-900">{ing.ingredientName}</span>
                          <span className="text-gray-600 ml-2">
                            - {ing.quantity} {ing.unit}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveIngredient(selectedProduct.id, ing.id)}
                          aria-label={`Remove ${ing.ingredientName}`}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Add New Ingredient */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <Label className="text-base font-semibold">Add Ingredient:</Label>
              <div className="grid grid-cols-2 gap-3" style={{ marginTop: '0.75rem' }}>
                <div>
                  <Label htmlFor="select-ingredient">Select Ingredient</Label>
                  <Select
                    value={selectedIngredientId}
                    onValueChange={setSelectedIngredientId}
                  >
                    <SelectTrigger id="select-ingredient" style={{ marginTop: '0.25rem' }}>
                      <SelectValue placeholder="Choose ingredient" />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 10000 }}>
                      {ingredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ingredient-qty">Quantity Needed</Label>
                  <Input
                    id="ingredient-qty"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={ingredientQuantity}
                    onChange={(e) => setIngredientQuantity(e.target.value)}
                    style={{ marginTop: '0.25rem' }}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddIngredientToProduct}
                disabled={isSaving}
                style={{ backgroundColor: '#db2777', color: '#ffffff', marginTop: '0.75rem' }}
                className="w-full hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Product
              </Button>

              {/* Quick Add to Master DB */}
              <Button
                variant="outline"
                onClick={() => {
                  setIsManageIngredientsOpen(false);
                  setIsAddIngredientOpen(true);
                }}
                className="w-full border-pink-300 text-pink-700 hover:bg-pink-50"
                style={{ marginTop: '0.75rem' }}
              >
                <PackagePlus className="w-4 h-4 mr-2" />
                Create New Ingredient in Database
              </Button>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsManageIngredientsOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
