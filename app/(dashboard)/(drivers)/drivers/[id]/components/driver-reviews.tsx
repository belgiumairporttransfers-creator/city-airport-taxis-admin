"use client";

import React from "react";
import { Plus, Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DriverReview } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

type DriverReviewsProps = {
  reviews: DriverReview[];
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={cn("h-4 w-4", {
          "fill-amber-400 text-amber-400": index < rating,
          "fill-default-200 text-default-200": index >= rating,
        })}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }: { review: DriverReview }) => (
  <article className="relative flex h-full min-h-[320px] flex-col overflow-visible rounded-md border border-default-200 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div className="absolute -right-2 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
      <Quote className="h-3.5 w-3.5 fill-current" />
    </div>

    <StarRating rating={review.rating} />

    <blockquote className="mt-5 flex-1 text-sm italic leading-7 text-default-700">
      &ldquo;{review.comment}&rdquo;
    </blockquote>

    <div className="my-5 border-t border-default-200" />

    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
          {getInitials(review.passengerName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-default-900">{review.passengerName}</p>
        <p className="mt-0.5 text-xs text-default-500">
          Verified Passenger · {formatDate(review.createdAt)}
        </p>
      </div>
    </div>
  </article>
);

const DriverReviews = ({ reviews }: DriverReviewsProps) => {
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : 0;

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <Card className="mt-6 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-default-50/40 pb-5">
        <div>
          <CardTitle className="text-2xl font-semibold text-default-900">Reviews</CardTitle>
          <p className="mt-1 text-sm text-default-500">
            Passenger feedback and ratings for this driver
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-3xl font-bold leading-none text-default-900">
                {averageRating.toFixed(1)}
              </p>
              <div className="mt-1.5 flex justify-end">
                <StarRating rating={Math.round(averageRating)} />
              </div>
            </div>
            <div className="hidden h-12 w-px bg-border sm:block" />
            <div>
              <p className="text-sm font-semibold text-default-900">
                {reviews.length} passenger review{reviews.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-xs text-default-500">
                Showing {visibleReviews.length} of {reviews.length}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        {reviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  color="secondary"
                  className="min-w-[150px] rounded-full"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-default-50/50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-default-700">No passenger reviews yet</p>
            <p className="mt-1 text-sm text-default-500">
              Reviews will appear here once passengers rate this driver.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverReviews;
