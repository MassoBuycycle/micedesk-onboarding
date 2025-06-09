
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface EventListProps {
  searchQuery: string;
}

const EventList = ({ searchQuery }: EventListProps) => {
  // This would be replaced with actual API data
  const events = [
    { id: 1, hotel: "Grand Hotel Berlin", contactName: "John Smith", spaces: 3, equipment: true },
    { id: 2, hotel: "Business Hotel Frankfurt", contactName: "Emma Johnson", spaces: 2, equipment: false },
    { id: 3, hotel: "Wellness Resort Munich", contactName: "Michael Brown", spaces: 5, equipment: true },
    { id: 4, hotel: "City Hotel Hamburg", contactName: "Sarah Wilson", spaces: 1, equipment: false },
    { id: 5, hotel: "Family Resort Black Forest", contactName: "Daniel Lee", spaces: 4, equipment: true },
  ];

  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    event.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Event Spaces</TableHead>
              <TableHead>AV Equipment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.hotel}</TableCell>
                  <TableCell>{event.contactName}</TableCell>
                  <TableCell>{event.spaces} spaces</TableCell>
                  <TableCell>
                    {event.equipment ? (
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
                <TableCell colSpan={5} className="text-center py-8">
                  No events found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default EventList;
