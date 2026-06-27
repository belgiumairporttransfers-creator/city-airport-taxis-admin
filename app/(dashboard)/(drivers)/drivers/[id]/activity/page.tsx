"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActivityTimeline from "../components/activity-timeline";

const DriverProfileActivityPage = () => {
  return (
    <Card>
      <CardHeader className="mb-0 flex-row flex-wrap items-center gap-4 border-none">
        <CardTitle className="flex-1 whitespace-nowrap text-2xl font-medium text-default-900">
          Recent Activity
        </CardTitle>
        <InputGroup merged className="max-w-[248px] flex-none">
          <InputGroupText>
            <Icon icon="heroicons:magnifying-glass" />
          </InputGroupText>
          <Input type="text" placeholder="Search.." />
        </InputGroup>
      </CardHeader>
      <CardContent>
        <ActivityTimeline />
        <div className="mt-9 flex justify-center">
          <Button color="secondary">
            <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> Load More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverProfileActivityPage;
