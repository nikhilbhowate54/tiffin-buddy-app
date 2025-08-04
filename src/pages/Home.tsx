import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { FoodCard } from "@/components/FoodCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Food, foodAPI, orderAPI, getCurrentLocation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { ShoppingCart, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface CartItem extends Food {
  quantity: number;
}

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const data = await foodAPI.getAll();
      setFoods(data.filter(food => food.available));
    } catch (error) {
      toast({
        title: "Error loading foods",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (food: Food, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === food._id);
      if (existing) {
        return prev.map(item =>
          item._id === food._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...food, quantity }];
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity}x ${food.name} added to your cart`,
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart(prev => prev.filter(item => item._id !== foodId));
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(foodId);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item._id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length < 2) {
      toast({
        title: "Minimum order required",
        description: "Please select at least 2 items to place an order",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Get user location
      const location = await getCurrentLocation();
      
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          foodId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        userLocation: location,
      };

      await orderAPI.create(orderData);
      
      toast({
        title: "Order placed successfully!",
        description: "Your delicious tiffin will be delivered soon",
      });
      
      setCart([]); // Clear cart
    } catch (error: any) {
      if (error.message.includes('Location')) {
        toast({
          title: "Location required",
          description: "Please enable location access to place orders",
          variant: "destructive",
        });
      } else if (error.response?.data?.message?.includes('10km')) {
        toast({
          title: "Delivery unavailable",
          description: "Sorry, we don't deliver to your location. Please try from a location within 10km of our restaurant.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order failed",
          description: error.response?.data?.message || "Please try again later",
          variant: "destructive",
        });
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header cartCount={getTotalItems()} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Delicious Tiffins, <span className="text-primary">Delivered Fresh</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Homestyle meals prepared with love and delivered to your doorstep
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>30-45 min delivery</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Free delivery within 10km</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Food Items */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Today's Menu</h2>
              <Badge variant="secondary" className="text-sm">
                {foods.length} items available
              </Badge>
            </div>
            
            {foods.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No items available right now. Please check back later!</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {foods.map((food) => (
                  <FoodCard
                    key={food._id}
                    food={food}
                    onAddToCart={addToCart}
                    cartQuantity={cart.find(item => item._id === food._id)?.quantity || 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Your Cart</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{getTotalAmount()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTotalItems()} items
                      </p>
                    </div>
                    
                    <Button
                      onClick={placeOrder}
                      disabled={isPlacingOrder || cart.length < 2}
                      className="w-full bg-gradient-primary"
                    >
                      {isPlacingOrder ? (
                        <>
                          <Loading size="sm" className="mr-2" />
                          Placing Order...
                        </>
                      ) : (
                        `Place Order (Min. 2 items)`
                      )}
                    </Button>
                    
                    {cart.length < 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Select at least 2 items to place an order
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}