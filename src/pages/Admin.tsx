import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { FoodCard } from "@/components/FoodCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Food, Order, foodAPI, orderAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Plus, Package, Calendar, MapPin, User } from "lucide-react";

export default function Admin() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [foodForm, setFoodForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    available: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foodsData, ordersData] = await Promise.all([
        foodAPI.getAll(),
        orderAPI.getAll(),
      ]);
      setFoods(foodsData);
      setOrders(ordersData);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFood = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const foodData = {
        ...foodForm,
        price: parseFloat(foodForm.price),
      };

      if (editingFood) {
        await foodAPI.update(editingFood._id, foodData);
        toast({
          title: "Food item updated",
          description: "Successfully updated the food item",
        });
      } else {
        await foodAPI.create(foodData as Omit<Food, '_id'>);
        toast({
          title: "Food item added",
          description: "Successfully added new food item",
        });
      }

      setIsDialogOpen(false);
      setEditingFood(null);
      setFoodForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        available: true,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error saving food item",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleEditFood = (food: Food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      category: food.category,
      image: food.image || "",
      available: food.available,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFood = async (food: Food) => {
    if (!confirm(`Are you sure you want to delete "${food.name}"?`)) {
      return;
    }

    try {
      await foodAPI.delete(food._id);
      toast({
        title: "Food item deleted",
        description: "Successfully deleted the food item",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error deleting food item",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your tiffin service</p>
        </div>

        <Tabs defaultValue="foods" className="space-y-6">
          <TabsList>
            <TabsTrigger value="foods" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Food Items</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Orders</span>
              <Badge variant="secondary">{orders.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foods" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Food Items ({foods.length})</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFood ? "Edit Food Item" : "Add New Food Item"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitFood} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={foodForm.name}
                        onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={foodForm.description}
                        onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={foodForm.price}
                          onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={foodForm.category}
                          onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL (optional)</Label>
                      <Input
                        id="image"
                        type="url"
                        value={foodForm.image}
                        onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={foodForm.available}
                        onChange={(e) => setFoodForm({ ...foodForm, available: e.target.checked })}
                      />
                      <Label htmlFor="available">Available for orders</Label>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary">
                      {editingFood ? "Update Food Item" : "Add Food Item"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((food) => (
                <FoodCard
                  key={food._id}
                  food={food}
                  isAdmin
                  onEdit={handleEditFood}
                  onDelete={handleDeleteFood}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order._id.slice(-6)}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Customer ID: {order.userId}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            Location: {order.userLocation.lat.toFixed(4)}, {order.userLocation.lng.toFixed(4)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Items:</h4>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x Food Item (ID: {item.foodId.slice(-6)})</span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}