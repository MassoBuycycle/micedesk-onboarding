import { UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FoodBeveragePreviewProps {
  foodBeverage: any;
}

const FoodBeveragePreview = ({ foodBeverage }: FoodBeveragePreviewProps) => {
  const { t } = useTranslation();
  
  // Helper function to handle boolean display
  const formatBooleanValue = (value: any): string => {
    // Handle numeric 1/0 as well as boolean true/false
    if (value === 1 || value === true || value === "1" || value === "true") {
      return t('common.yes');
    } else if (value === 0 || value === false || value === "0" || value === "false") {
      return t('common.no');
    }
    return String(value);
  };
  
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
          <p><span className="text-foreground font-medium">Roomservice:</span> {formatBooleanValue(foodBeverage.roomService)}</p>
        )}
        {foodBeverage?.minibar !== undefined && (
          <p><span className="text-foreground font-medium">Minibar:</span> {formatBooleanValue(foodBeverage.minibar)}</p>
        )}
        {foodBeverage?.breakfast !== undefined && (
          <p><span className="text-foreground font-medium">Frühstück:</span> {formatBooleanValue(foodBeverage.breakfast)}</p>
        )}
        {foodBeverage?.breakfastStyle && <p><span className="text-foreground font-medium">Frühstücksart:</span> {foodBeverage.breakfastStyle}</p>}
      </div>
    </div>
  );
};

export default FoodBeveragePreview;
