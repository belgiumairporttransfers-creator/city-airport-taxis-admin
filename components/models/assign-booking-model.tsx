"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAssignment } from "@/hooks/queries/use-assignments";
import { useDrivers } from "@/hooks/queries/use-drivers";
import type { Booking } from "@/lib/schemas";

export type AssignBookingModelProps = {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
};

const AssignBookingModel = ({ open, booking, onClose }: AssignBookingModelProps) => {
  const [driverId, setDriverId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: driversData, isLoading: isLoadingDrivers } = useDrivers({
    status: "approved",
    page: 1,
    limit: 100,
    sort: "firstName",
  });

  const { mutate: assignDriver, isPending } = useCreateAssignment();

  useEffect(() => {
    if (!open) {
      setDriverId("");
      setAdminNotes("");
    }
  }, [open]);

  const drivers = driversData?.items ?? [];

  const handleAssign = () => {
    if (!booking || !driverId) return;

    assignDriver(
      {
        bookingId: booking.id,
        driverId,
        ...(adminNotes.trim() ? { adminNotes: adminNotes.trim() } : {}),
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="md" className="p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Assign driver</DialogTitle>
          <DialogDescription>
            {booking
              ? `Assign booking ${booking.bookingNumber} to an approved driver. This skips the all-drivers email if the delay window is still open.`
              : "Select a driver for this booking."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="assign-driver">Driver</Label>
            <Select
              value={driverId || undefined}
              onValueChange={setDriverId}
              disabled={isLoadingDrivers || isPending}
            >
              <SelectTrigger id="assign-driver">
                <SelectValue
                  placeholder={isLoadingDrivers ? "Loading drivers…" : "Select a driver"}
                />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.firstName} {driver.lastName}
                    {driver.licensePlate ? ` · ${driver.licensePlate}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLoadingDrivers && drivers.length === 0 ? (
              <p className="text-xs text-default-500">No approved drivers available.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-notes">Admin notes (optional)</Label>
            <Textarea
              id="assign-notes"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Notes for this assignment"
              rows={3}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!driverId || isPending || !booking}
          >
            {isPending ? "Assigning…" : "Assign driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignBookingModel;
