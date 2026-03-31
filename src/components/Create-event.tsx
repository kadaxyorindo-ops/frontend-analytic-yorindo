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
import { Input } from "@/components/ui/input"; // Pastikan path benar
import { Label } from "@/components/ui/label"; // Pastikan path benar

export function CreateEvent() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form dikirim!");
    // Logika simpan data event kamu di sini
  };

  return (
    <Dialog>
      {/* Trigger di luar form */}
      <DialogTrigger asChild>
        <Button className="bg-[#1a40a8] hover:bg-blue-800">+ Create Event</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new event.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input id="event-name" name="eventName" placeholder="Enter event name" required />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-date">Event Date</Label>
              <Input id="event-date" name="eventDate" type="date" required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="event-time">Event Time</Label>
                <Input id="event-time" name="eventTime" type="time" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-location">Event Location</Label>
              <Input id="event-location" name="eventLocation" placeholder="Enter event location" required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="event-description">Event Description</Label>
                <Input id="event-description" name="eventDescription" placeholder="Enter event description" required />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-[#1a40a8] hover:bg-blue-800 w-full sm:w-auto">
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}