
import { UtensilsCrossed } from "lucide-react";

interface FoodBeveragePreviewProps {
  foodBeverage: any;
}

const FoodBeveragePreview = ({ foodBeverage }: FoodBeveragePreviewProps) => {
  if (!foodBeverage || Object.keys(foodBeverage).length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <UtensilsCrossed className="h-4 w-4" /> Food & Beverage
      </h3>
      <div className="text-sm text-muted-foreground space-y-1.5">
        {foodBeverage?.restaurants && <p><span className="text-foreground font-medium">Restaurants:</span> {foodBeverage.restaurants}</p>}
        {foodBeverage?.bars && <p><span className="text-foreground font-medium">Bars:</span> {foodBeverage.bars}</p>}
        {foodBeverage?.cuisine && <p><span className="text-foreground font-medium">Cuisine:</span> {foodBeverage.cuisine}</p>}
        {foodBeverage?.specialDiets && <p><span className="text-foreground font-medium">Special Diets:</span> {foodBeverage.specialDiets}</p>}
        {foodBeverage?.roomService !== undefined && (
          <p><span className="text-foreground font-medium">Room Service:</span> {foodBeverage.roomService ? 'Available' : 'Not Available'}</p>
        )}
        {foodBeverage?.minibar !== undefined && (
          <p><span className="text-foreground font-medium">Minibar:</span> {foodBeverage.minibar ? 'Available' : 'Not Available'}</p>
        )}
        {foodBeverage?.breakfast !== undefined && (
          <p><span className="text-foreground font-medium">Breakfast:</span> {foodBeverage.breakfast ? 'Available' : 'Not Available'}</p>
        )}
        {foodBeverage?.breakfastStyle && <p><span className="text-foreground font-medium">Breakfast Style:</span> {foodBeverage.breakfastStyle}</p>}
      </div>
    </div>
  );
};

export default FoodBeveragePreview;
