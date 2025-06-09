
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface RoomListProps {
  searchQuery: string;
}

const RoomList = ({ searchQuery }: RoomListProps) => {
  // This would be replaced with actual API data
  const rooms = [
    { id: 1, hotel: "Grand Hotel Berlin", singleRooms: 50, doubleRooms: 75, connectingRooms: 10, features: "AC, WiFi, Safe" },
    { id: 2, hotel: "Business Hotel Frankfurt", singleRooms: 30, doubleRooms: 45, connectingRooms: 5, features: "AC, WiFi, Desk" },
    { id: 3, hotel: "Wellness Resort Munich", singleRooms: 20, doubleRooms: 100, connectingRooms: 15, features: "AC, WiFi, Safe, Balcony" },
    { id: 4, hotel: "City Hotel Hamburg", singleRooms: 40, doubleRooms: 35, connectingRooms: 0, features: "WiFi, TV" },
    { id: 5, hotel: "Family Resort Black Forest", singleRooms: 15, doubleRooms: 85, connectingRooms: 20, features: "AC, WiFi, Safe, Minibar" },
  ];

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => 
    room.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.features.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel</TableHead>
              <TableHead>Single Rooms</TableHead>
              <TableHead>Double Rooms</TableHead>
              <TableHead>Connecting Rooms</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.hotel}</TableCell>
                  <TableCell>{room.singleRooms}</TableCell>
                  <TableCell>{room.doubleRooms}</TableCell>
                  <TableCell>{room.connectingRooms}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={room.features}>
                    {room.features}
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
                  No rooms found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default RoomList;
