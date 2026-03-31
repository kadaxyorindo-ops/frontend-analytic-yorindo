import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateEvent } from "@/components/Create-event";


const dummyEvents = [
  { id: 1, date: "Oct 12, 2026", name: "Global Innovation Summit 2026", location: "San Francisco, CA" },
  { id: 2, date: "Nov 05, 2026", name: "Designers Meetup: Winter Edition", location: "Austin, TX" },
  { id: 3, date: "Dec 18, 2026", name: "Yorindo Charity Gala", location: "London, UK" },
];

export function Events() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start mb-6 pb-2 border-b border-dashed border-slate-200">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-gray-500">Orchestrate your upcoming experiences.</p>
          </div>
          <CreateEvent />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-dashed border-2 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Impact Placeholder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">2,840</div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200 border-dashed border-2 shadow-none">
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 uppercase tracking-wider">Milestone Placeholder</CardTitle>
            </CardHeader>
             <CardContent>
              <div className="text-xl font-bold text-amber-900">Global Tech Summit</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[150px]">Event Date</TableHead>
                <TableHead>Event Name</TableHead>
                <TableHead>Event Location</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-slate-600">{event.date}</TableCell>
                  <TableCell className="font-bold">{event.name}</TableCell>
                  <TableCell className="text-slate-500">{event.location}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <span className="text-xl font-bold pb-2">...</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">Edit Event</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Manage Participant</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}