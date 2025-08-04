import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Food } from "@/lib/api";
import { Plus, Minus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface FoodCardProps {
  food: Food;
  isAdmin?: boolean;
  onAddToCart?: (food: Food, quantity: number) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  cartQuantity?: number;
}

export const FoodCard = ({ 
  food, 
  isAdmin = false, 
  onAddToCart, 
  onEdit, 
  onDelete, 
  cartQuantity = 0 
}: FoodCardProps) => {
  const [quantity, setQuantity] = useState(cartQuantity);

  const handleAddToCart = () => {
    if (quantity > 0 && onAddToCart) {
      onAddToCart(food, quantity);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(0, prev - 1));

  return (
    <Card className="overflow-hidden hover:shadow-warm transition-all duration-300 bg-card">
      <div className="aspect-video bg-gradient-warm relative">
        {food.image ? (
          <img 
            src={food.image} 
            alt={food.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-foreground">
            <span className="text-2xl">🍱</span>
          </div>
        )}
        <Badge 
          variant={food.available ? "default" : "destructive"} 
          className="absolute top-2 right-2"
        >
          {food.available ? "Available" : "Unavailable"}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{food.name}</CardTitle>
            <CardDescription className="text-sm">{food.description}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">₹{food.price}</p>
            <Badge variant="secondary" className="text-xs">{food.category}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-2">
        {isAdmin ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => onEdit?.(food)} className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete?.(food)} className="flex-1">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={decrementQuantity}
                disabled={quantity === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button variant="outline" size="sm" onClick={incrementQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleAddToCart} 
              disabled={quantity === 0 || !food.available}
              className="bg-gradient-primary hover:opacity-90"
            >
              Add to Cart
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};