import { useQuery } from '@tanstack/react-query';
import { getAllHotels, Hotel } from '@/apiClient/hotelsApi';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getEntityFiles } from '@/apiClient/filesApi';

interface QuickSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ open, setOpen }) => {
  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: getAllHotels,
  });
  const navigate = useNavigate();

  const handleSelect = (id: number) => {
    navigate(`/view/hotel/${id}`);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search hotels..." />
      <CommandList>
        <CommandEmpty>No hotel found.</CommandEmpty>
        <CommandGroup heading="Hotels">
          {hotels.map(h => (
            <CommandItem key={h.id} onSelect={() => handleSelect(h.id!)}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{h.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p>{h.name}</p>
                  {h.city && <p className="text-xs text-muted-foreground">{h.city}</p> }
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default QuickSearch; 