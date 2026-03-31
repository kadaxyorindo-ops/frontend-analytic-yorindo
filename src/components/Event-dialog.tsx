import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 1. Definisi tipe data agar kode lebih aman (TypeScript)
interface EventDialogProps {
  mode: "create" | "edit";
  defaultData?: {
    name: string;
    date: string;
    time: string;
    location: string;
    description: string;
  };
}

export function EventDialog({ mode, defaultData }: EventDialogProps) {
  const isEdit = mode === "edit";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Mengambil semua data dari input
    const data = {
      name: formData.get("eventName"),
      date: formData.get("eventDate"),
      time: formData.get("eventTime"),
      location: formData.get("eventLocation"),
      description: formData.get("eventDescription"),
    };

    console.log(`Action: ${mode.toUpperCase()}`, data);
    alert(`Event ${isEdit ? "updated" : "created"} successfully!`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isEdit ? (
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm cursor-pointer">
            Edit Event
          </button>
        ) : (
          <Button className="bg-[#1a40a8] hover:bg-blue-800 cursor-pointer">
            + Create Event
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              {isEdit 
                ? "Update the details of your existing event." 
                : "Fill in the details for your new event."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input 
                id="event-name" 
                name="eventName" 
                defaultValue={defaultData?.name} 
                placeholder="Enter event name" 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-date">Event Date</Label>
              <Input 
                id="event-date" 
                name="eventDate" 
                type="date" 
                defaultValue={defaultData?.date} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-time">Event Time</Label>
              <Input 
                id="event-time" 
                name="eventTime" 
                type="time" 
                defaultValue={defaultData?.time} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-location">Event Location</Label>
              <Input 
                id="event-location" 
                name="eventLocation" 
                defaultValue={defaultData?.location} 
                placeholder="Enter event location" 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-description">Event Description</Label>
              <Input 
                id="event-description" 
                name="eventDescription" 
                defaultValue={defaultData?.description} 
                placeholder="Enter event description" 
                required 
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-[#1a40a8] hover:bg-blue-800 w-full sm:w-auto">
              {isEdit ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}