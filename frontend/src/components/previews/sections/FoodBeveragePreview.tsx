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
        {Array.isArray(foodBeverage?.restaurants) && foodBeverage.restaurants.length > 0 && (
          <p>
            <span className="text-foreground font-medium">Restaurants:</span> {foodBeverage.restaurants.map((r: any) => r.name || "Unnamed").join(", ")}
          </p>
        )}
        {Array.isArray(foodBeverage?.bars) && foodBeverage.bars.length > 0 && (
          <p>
            <span className="text-foreground font-medium">Bars:</span> {foodBeverage.bars.map((b: any) => b.name || "Unnamed").join(", ")}
          </p>
        )}
        {foodBeverage?.cuisine && <p><span className="text-foreground font-medium">Küche:</span> {foodBeverage.cuisine}</p>}
        {foodBeverage?.specialDiets && <p><span className="text-foreground font-medium">Spezialdiäten:</span> {foodBeverage.specialDiets}</p>}
        {foodBeverage?.roomService !== undefined && (
          <p><span className="text-foreground font-medium">Roomservice:</span> {foodBeverage.roomService ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
        {foodBeverage?.minibar !== undefined && (
          <p><span className="text-foreground font-medium">Minibar:</span> {foodBeverage.minibar ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
        {foodBeverage?.breakfast !== undefined && (
          <p><span className="text-foreground font-medium">Frühstück:</span> {foodBeverage.breakfast ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
        {foodBeverage?.breakfastStyle && <p><span className="text-foreground font-medium">Frühstücksart:</span> {foodBeverage.breakfastStyle}</p>}
      </div>
    </div>
  );
};

export default FoodBeveragePreview;
