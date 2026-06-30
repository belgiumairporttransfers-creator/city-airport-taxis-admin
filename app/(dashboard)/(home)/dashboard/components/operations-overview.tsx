"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/hooks/queries/use-trips";

const OperationsOverview = () => {
  const { data } = useTrips({ page: 1, limit: 8 });
  const activeTrips = (data?.items ?? []).filter((trip) => trip.status !== "completed").slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Active trip execution</CardTitle>
          <p className="mt-1 text-sm text-default-500">
            Monitor drivers currently executing trips.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/trips">View all trips</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeTrips.length === 0 ? (
          <p className="text-sm text-default-500">No trips currently in progress.</p>
        ) : (
          activeTrips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.bookingNumber}`}
              className="block rounded-lg border border-border p-3 transition-colors hover:bg-default-50"
            >
              <p className="font-medium text-default-900">{trip.bookingNumber}</p>
              <p className="text-sm text-default-600">
                {trip.customer.firstName} {trip.customer.lastName} · {trip.status.replaceAll("_", " ")}
              </p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default OperationsOverview;
