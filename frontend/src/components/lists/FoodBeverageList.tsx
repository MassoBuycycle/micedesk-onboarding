
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface FoodBeverageListProps {
  searchQuery: string;
}

const FoodBeverageList = ({ searchQuery }: FoodBeverageListProps) => {
  // This would be replaced with actual API data
  const fnbData = [
    { id: 1, hotel: "Grand Hotel Berlin", restaurants: 3, bars: 2, contact: "Chef Michael", roomService: true },
    { id: 2, hotel: "Business Hotel Frankfurt", restaurants: 1, bars: 1, contact: "F&B Manager Sarah", roomService: true },
    { id: 3, hotel: "Wellness Resort Munich", restaurants: 4, bars: 3, contact: "Director John", roomService: true },
    { id: 4, hotel: "City Hotel Hamburg", restaurants: 1, bars: 1, contact: "Manager Emma", roomService: false },
    { id: 5, hotel: "Family Resort Black Forest", restaurants: 2, bars: 2, contact: "F&B Lead Daniel", roomService: true },
  ];

  // Filter F&B data based on search query
  const filteredFnB = fnbData.filter(item => 
    item.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel</TableHead>
              <TableHead>Restaurants</TableHead>
              <TableHead>Bars</TableHead>
              <TableHead>Primary Contact</TableHead>
              <TableHead>Room Service</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFnB.length > 0 ? (
              filteredFnB.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.hotel}</TableCell>
                  <TableCell>{item.restaurants}</TableCell>
                  <TableCell>{item.bars}</TableCell>
                  <TableCell>{item.contact}</TableCell>
                  <TableCell>
                    {item.roomService ? (
                      <Badge variant="default">Available</Badge>
                    ) : (
                      <Badge variant="outline">Not Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No F&B data found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default FoodBeverageList;
