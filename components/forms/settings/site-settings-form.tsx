"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Moon, Settings2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  fromSettingsResponse,
  siteSettingsFormSchema,
  toSettingsPayload,
  type SiteSettingsFormSchema,
} from "@/lib/schemas";
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings";
import LayoutLoader from "@/components/layout-loader";
import { CURRENCY_SYMBOL } from "@/lib/utils";
import SettingsSection from "@/components/forms/settings/settings-section";
import ToggleRow from "@/components/forms/settings/toggle-row";
import FeeRow from "@/components/forms/settings/fee-row";

const defaultValues: SiteSettingsFormSchema = {
  maintenanceMode: false,
  comingSoonMode: false,
  livePaymentMode: false,
  minBookingMinutes: 0,
  airportPickup: 0,
  waitingTimePricePerMinute: 0,
  waitingTimePricePerHour: 0,
  driverCommissionPercent: 10,
  nightPricingStartTime: "22:00",
  nightPricingEndTime: "06:00",
  nightPricingPercent: 0,
  driverNotificationDelayMinutes: 10,
};

const SiteSettingsForm = () => {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<SiteSettingsFormSchema>({
    resolver: zodResolver(siteSettingsFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (settings) {
      form.reset(fromSettingsResponse(settings));
    }
  }, [settings, form]);

  const onSubmit = (values: SiteSettingsFormSchema) => {
    updateSettings(toSettingsPayload(values));
  };

  if (isLoading) {
    return <LayoutLoader />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-default-900">Site Settings</h2>
            <p className="mt-0.5 text-xs text-default-500">
              Site behaviour, payments, and booking fees.
            </p>
          </div>
          <Button type="submit" isLoading={isPending} loadingText="Saving..." size="sm">
            Save changes
          </Button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <SettingsSection
            icon={Settings2}
            title="Environment"
            description="Site availability and payment processing."
          >
            <ToggleRow
              title="Maintenance mode"
              description="Block public visitors during updates."
              name="maintenanceMode"
            />
            <ToggleRow
              title="Coming soon mode"
              description="Show the coming soon page instead of the full site."
              name="comingSoonMode"
            />
            <ToggleRow
              title="Live payment mode"
              description="Live credentials at checkout; off uses test mode."
              name="livePaymentMode"
            />
          </SettingsSection>

          <SettingsSection
            icon={Clock}
            title="Scheduling & waiting"
            description="Minimum advance booking time and driver waiting rates."
          >
            <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
              <FeeRow
                variant="card"
                name="minBookingMinutes"
                title="Minimum booking time"
                description="How far in advance customers must book."
                label="Minutes"
                step={1}
                placeholder="120"
              />
              <FeeRow
                variant="card"
                name="driverNotificationDelayMinutes"
                title="Driver email delay"
                description="Minutes to wait after a booking is confirmed before emailing all drivers. If you assign a driver in that window, the blast email is skipped. Set 0 to email immediately."
                label="Minutes"
                step={1}
                placeholder="10"
              />
              <div className="flex h-full flex-col justify-between gap-3 rounded-md border border-border p-3.5 sm:col-span-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-default-900">Driver waiting time</p>
                  <p className="text-xs leading-snug text-default-500">
                    Per minute under 1 hr; per hour for longer waits. Set to 0 to disable.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    name="waitingTimePricePerMinute"
                    type="number"
                    label={`Per minute (${CURRENCY_SYMBOL})`}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    inputClassName="h-9 text-sm tabular-nums text-right"
                  />
                  <Input
                    name="waitingTimePricePerHour"
                    type="number"
                    label={`Per hour (${CURRENCY_SYMBOL})`}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    inputClassName="h-9 text-sm tabular-nums text-right"
                  />
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Users}
            title="Fees & commission"
            description="Airport pickup charges and the commission deducted from each trip fare. Drivers only see their net earning."
          >
            <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
              <FeeRow
                variant="card"
                name="driverCommissionPercent"
                title="Commission deducted"
                description="Example: 10% on a €50 trip means the driver earns €45."
                label="Rate (%)"
                max={100}
                step={0.01}
                placeholder="10"
              />
              <FeeRow
                variant="card"
                name="airportPickup"
                title="Airport pickup"
                description="When pickup is at an airport. Set to 0 to disable."
                label={`Amount (${CURRENCY_SYMBOL})`}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Moon}
            title="Night pricing"
            description="Extra fare percent applied when pickup time falls in the night window. Set percent to 0 to disable."
          >
            <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex h-full flex-col justify-between gap-3 rounded-md border border-border p-3.5">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-default-900">Start time</p>
                  <p className="text-xs leading-snug text-default-500">
                    Night pricing begins at this time.
                  </p>
                </div>
                <Input
                  name="nightPricingStartTime"
                  type="time"
                  label="Start"
                  inputClassName="h-9 text-sm"
                />
              </div>
              <div className="flex h-full flex-col justify-between gap-3 rounded-md border border-border p-3.5">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-default-900">End time</p>
                  <p className="text-xs leading-snug text-default-500">
                    Night pricing ends at this time (can cross midnight).
                  </p>
                </div>
                <Input
                  name="nightPricingEndTime"
                  type="time"
                  label="End"
                  inputClassName="h-9 text-sm"
                />
              </div>
              <FeeRow
                variant="card"
                name="nightPricingPercent"
                title="Night surcharge"
                description="Percent added to the fare during the night window."
                label="Rate (%)"
                max={100}
                step={0.01}
                placeholder="0"
              />
            </div>
          </SettingsSection>
        </div>
      </form>
    </Form>
  );
};

export default SiteSettingsForm;
