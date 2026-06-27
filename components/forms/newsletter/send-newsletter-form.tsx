"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fromZonedTime } from "date-fns-tz";
import { Save, Send } from "lucide-react";
import { DEFAULT_TIMEZONE } from "@/constants/app-default";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  useCreateNewsletterDraft,
  useNewsletterDraft,
  useUpdateNewsletterDraft,
} from "@/hooks/queries/use-newsletter-drafts";
import { useSendNewsletter } from "@/hooks/queries/use-newsletter-campaigns";
import { useUpload } from "@/hooks/queries/use-upload";
import {
  newsletterAudienceOptions,
  newsletterSendModeOptions,
  saveNewsletterDraftSchema,
  sendNewsletterFormSchema,
  type SaveNewsletterDraftPayload,
  type SendNewsletterFormSchema,
  type SendNewsletterPayload,
} from "@/lib/schemas";

const defaultValues: SendNewsletterFormSchema = {
  campaignName: "",
  subject: "",
  preheader: "",
  message: "",
  fromName: "City Airport Taxis",
  replyTo: "info@cityairporttaxis.com",
  audience: "all",
  sendMode: "immediate",
  scheduledDate: "",
  scheduledTime: "",
  ctaText: "",
  ctaUrl: "",
  image: null,
};

const toDraftPayload = (
  values: SendNewsletterFormSchema,
  image?: { url: string; publicId: string } | null
): SaveNewsletterDraftPayload => ({
  campaignName: values.campaignName.trim(),
  subject: values.subject?.trim() || undefined,
  preheader: values.preheader?.trim() || undefined,
  message: values.message || undefined,
  fromName: values.fromName?.trim() || undefined,
  replyTo: values.replyTo?.trim() || undefined,
  audience: values.audience,
  sendMode: values.sendMode,
  scheduledDate: values.scheduledDate || undefined,
  scheduledTime: values.scheduledTime || undefined,
  ctaText: values.ctaText?.trim() || undefined,
  ctaUrl: values.ctaUrl?.trim() || undefined,
  imageUrl: image?.url,
  imagePublicId: image?.publicId,
});

const buildScheduledAt = (date?: string, time?: string) => {
  if (!date || !time) return undefined;
  return fromZonedTime(`${date}T${time}:00`, DEFAULT_TIMEZONE).toISOString();
};

const toSendPayload = (
  values: SendNewsletterFormSchema,
  image: { url: string; publicId: string } | null,
  draftId?: string
): SendNewsletterPayload => ({
  campaignName: values.campaignName.trim(),
  subject: values.subject.trim(),
  preheader: values.preheader?.trim() || undefined,
  message: values.message,
  fromName: values.fromName.trim(),
  replyTo: values.replyTo.trim(),
  audience: values.audience,
  sendMode: values.sendMode,
  scheduledDate: values.scheduledDate || undefined,
  scheduledTime: values.scheduledTime || undefined,
  scheduledAt:
    values.sendMode === "scheduled"
      ? buildScheduledAt(values.scheduledDate, values.scheduledTime)
      : undefined,
  ctaText: values.ctaText?.trim() || undefined,
  ctaUrl: values.ctaUrl?.trim() || undefined,
  imageUrl: image?.url,
  imagePublicId: image?.publicId,
  draftId,
});

interface SendNewsletterFormProps {
  draftId?: string;
}

const SendNewsletterForm = ({ draftId }: SendNewsletterFormProps) => {
  const router = useRouter();
  const { data: draft, isLoading: isDraftLoading } = useNewsletterDraft(draftId);
  const { mutateAsync: createDraft } = useCreateNewsletterDraft();
  const { mutateAsync: updateDraft } = useUpdateNewsletterDraft();
  const { mutateAsync: sendNewsletter } = useSendNewsletter();
  const { mutateAsync: uploadImage } = useUpload();
  const [activeAction, setActiveAction] = useState<"draft" | "send" | null>(null);
  const [savedImage, setSavedImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  const form = useForm<SendNewsletterFormSchema>({
    resolver: zodResolver(sendNewsletterFormSchema),
    mode: "all",
    defaultValues,
  });

  const sendMode = form.watch("sendMode");
  const isSavingDraft = activeAction === "draft";
  const isSubmitting = activeAction === "send";
  const isBusy = activeAction !== null;

  useEffect(() => {
    if (!draft) return;

    form.reset({
      campaignName: draft.campaignName,
      subject: draft.subject,
      preheader: draft.preheader,
      message: draft.message,
      fromName: draft.fromName || defaultValues.fromName,
      replyTo: draft.replyTo || defaultValues.replyTo,
      audience: draft.audience,
      sendMode: draft.sendMode,
      scheduledDate: draft.scheduledDate,
      scheduledTime: draft.scheduledTime,
      ctaText: draft.ctaText,
      ctaUrl: draft.ctaUrl,
      image: null,
    });

    setSavedImage(
      draft.imageUrl
        ? { url: draft.imageUrl, publicId: draft.imagePublicId }
        : null
    );
  }, [draft, form]);

  const resolveDraftImage = async (values: SendNewsletterFormSchema) => {
    if (values.image instanceof File) {
      const uploaded = await uploadImage({
        file: values.image,
        folder: "newsletter-drafts",
      });
      return { url: uploaded.url, publicId: uploaded.public_id };
    }

    if (savedImage) {
      return { url: savedImage.url, publicId: savedImage.publicId };
    }

    return null;
  };

  const handleSaveDraft = async () => {
    const campaignName = form.getValues("campaignName").trim();
    const parsed = saveNewsletterDraftSchema.safeParse({
      ...form.getValues(),
      campaignName,
    });

    if (!parsed.success) {
      form.setError("campaignName", {
        type: "manual",
        message: parsed.error.issues[0]?.message ?? "Campaign name is required",
      });
      return;
    }

    setActiveAction("draft");
    try {
      const image = await resolveDraftImage(form.getValues());
      const payload = toDraftPayload(form.getValues(), image);

      if (draftId) {
        await updateDraft({ id: draftId, payload });
        router.push("/drafts");
        return;
      }

      await createDraft(payload);
      router.push("/drafts");
    } finally {
      setActiveAction(null);
    }
  };

  const onSubmit = async (values: SendNewsletterFormSchema) => {
    setActiveAction("send");
    try {
      const image = await resolveDraftImage(values);
      const payload = toSendPayload(values, image, draftId);
      await sendNewsletter(payload);
      router.push("/campaigns");
    } finally {
      setActiveAction(null);
    }
  };

  if (draftId && isDraftLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-default-500">
        Loading draft...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-5 lg:col-span-8">
            <Input name="campaignName" label="Campaign name" />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input name="subject" label="Subject" />
              <Input name="preheader" label="Preheader" maxLength={150} />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-default-600">
                    Message
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Write your newsletter message..."
                      minHeight={400}
                      variant="enterprise"
                      hasError={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input name="ctaText" label="Button text" />
              <Input name="ctaUrl" label="Button URL" type="text" />
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-4">
            <Input name="fromName" label="From name" />
            <Input name="replyTo" label="Reply-to email" type="email" />
            <Input
              name="audience"
              type="select"
              label="Audience"
              options={newsletterAudienceOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
            />
            <Input
              name="sendMode"
              type="select"
              label="Delivery"
              options={newsletterSendModeOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
            />

            {sendMode === "scheduled" ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input name="scheduledDate" type="date" label="Schedule date" />
                <Input name="scheduledTime" type="time" label="Schedule time" />
              </div>
            ) : null}

            <Input
              name="image"
              type="file"
              label="Cover image"
              accept="image/*"
              uploadCompact
              uploadDescription="Drag and drop or click to upload"
              existingImageUrl={savedImage?.url}
              onClearExistingImage={() => setSavedImage(null)}
            />
          </aside>
        </div>

        <div className="-mx-6 -mb-6 mt-8 flex flex-col-reverse gap-3 border-t border-border bg-default-50/60 px-6 py-5 sm:-mx-8 sm:-mb-8 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-8">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            className="w-full sm:w-auto"
            disabled={isBusy}
            isLoading={isSavingDraft}
            loadingText="Saving draft..."
            onClick={() => void handleSaveDraft()}
          >
            <Save className="mr-2 h-4 w-4" />
            {draftId ? "Update draft" : "Save draft"}
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isBusy}
            isLoading={isSubmitting}
            loadingText={sendMode === "scheduled" ? "Scheduling..." : "Sending..."}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendMode === "scheduled"
              ? "Schedule Newsletter"
              : "Send Newsletter"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SendNewsletterForm;
