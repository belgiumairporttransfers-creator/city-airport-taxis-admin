"use client";

import * as React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { cva } from "class-variance-authority";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/file-upload/file-upload";
import DatePicker from "@/components/ui/date/date-picker";
import TimePicker from "@/components/ui/time/time-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const fieldBaseClasses =
  "w-full rounded-md border border-default-300 bg-card px-3 text-sm text-default-500 transition duration-300 read-only:bg-background placeholder:text-accent-foreground/50 focus:outline-hidden focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:focus:border-default-300 disabled:focus:outline-none read-only:focus:border-default-300 read-only:focus:outline-none read-only:cursor-default";

  const labelBaseClasses =
  "absolute top-2 z-10 origin-[0] -translate-y-5 scale-75 transform bg-card px-2 text-sm text-default-600 duration-300 start-1 group-focus-within:top-2 group-focus-within:-translate-y-5 group-focus-within:scale-75 group-focus-within:px-2 group-focus-within:bg-card group-focus-within:rtl:left-auto group-focus-within:rtl:translate-x-1/4 2xl:text-base group-has-[[placeholder]:placeholder-shown]:top-1/2 group-has-[[placeholder]:placeholder-shown]:-translate-y-1/2 group-has-[[placeholder]:placeholder-shown]:scale-100 group-has-[[placeholder]:placeholder-shown]:bg-transparent group-has-[[placeholder]:autofill]:!top-2 group-has-[[placeholder]:autofill]:!-translate-y-5 group-has-[[placeholder]:autofill]:!scale-75 group-has-[[placeholder]:autofill]:!bg-card group-has-[[placeholder]:autofill]:!px-2 group-has-[[placeholder]:-webkit-autofill]:!top-2 group-has-[[placeholder]:-webkit-autofill]:!-translate-y-5 group-has-[[placeholder]:-webkit-autofill]:!scale-75 group-has-[[placeholder]:-webkit-autofill]:!bg-card group-has-[[placeholder]:-webkit-autofill]:!px-2";

const labelTextareaClasses =
  "absolute top-2 z-10 origin-[0] -translate-y-5 scale-75 transform bg-card px-2 text-sm text-default-600 duration-300 start-1 group-focus-within:top-2 group-focus-within:-translate-y-5 group-focus-within:scale-75 group-focus-within:px-2 group-focus-within:bg-card group-focus-within:rtl:left-auto group-focus-within:rtl:translate-x-1/4 2xl:text-base group-has-[[placeholder]:placeholder-shown]:top-4 group-has-[[placeholder]:placeholder-shown]:translate-y-0 group-has-[[placeholder]:placeholder-shown]:scale-100 group-has-[[placeholder]:placeholder-shown]:bg-transparent group-has-[[placeholder]:autofill]:!top-2 group-has-[[placeholder]:autofill]:!-translate-y-5 group-has-[[placeholder]:autofill]:!scale-75 group-has-[[placeholder]:autofill]:!bg-card group-has-[[placeholder]:autofill]:!px-2 group-has-[[placeholder]:-webkit-autofill]:!top-2 group-has-[[placeholder]:-webkit-autofill]:!-translate-y-5 group-has-[[placeholder]:-webkit-autofill]:!scale-75 group-has-[[placeholder]:-webkit-autofill]:!bg-card group-has-[[placeholder]:-webkit-autofill]:!px-2";

export const inputVariants = cva("", {
  variants: {
    element: {
      input: cn(
        fieldBaseClasses,
        "h-10 read-only:leading-10 file:border-0 file:bg-transparent file:text-sm file:font-medium [&:-webkit-autofill]:animate-autofillStart [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--background)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--default-500)] [&:-webkit-autofill:hover]:shadow-[inset_0_0_0_1000px_var(--background)] [&:-webkit-autofill:focus]:shadow-[inset_0_0_0_1000px_var(--background)] [&:-webkit-autofill]:transition-[background-color_9999s_ease-out_0s] 2xl:h-12 2xl:text-base 2xl:read-only:leading-[48px]"
      ),
      textarea: cn(
        fieldBaseClasses,
        "min-h-[80px] resize-y pb-[10px] pt-7 2xl:min-h-[96px] 2xl:text-base"
      ),
      label: labelBaseClasses,
      labelTextarea: labelTextareaClasses,
    },
  },
  defaultVariants: {
    element: "input",
  },
});

type InputType =
  | "text"
  | "email"
  | "number"
  | "tel"
  | "password"
  | "date"
  | "time"
  | "checkbox"
  | "switch"
  | "radio"
  | "select"
  | "textarea"
  | "file"
  | "files";

export type InputOption = {
  label: React.ReactNode;
  value: string;
};

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  name?: string;
  label?: React.ReactNode;
  type?: InputType;
  inputClassName?: string;
  checkboxSize?: "xs" | "sm" | "md" | "lg" | "xl";
  switchSize?: "sm" | "md" | "lg";
  radioSize?: "xs" | "sm" | "md" | "lg" | "xl";
  options?: InputOption[];
  uploadDescription?: string;
  uploadCompact?: boolean;
  existingImageUrl?: string | null;
  onClearExistingImage?: () => void;
  accept?: React.InputHTMLAttributes<HTMLInputElement>["accept"];
  rows?: number;
}

function FieldInput({
  field,
  type,
  disabled,
  className,
  placeholder,
  inputProps,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  type: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  className: string;
  placeholder?: string;
  inputProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder">;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const syncAutofillValue = React.useCallback(() => {
    const input = inputRef.current;
    if (!input?.value) return;

    const currentValue = field.value ?? "";
    if (input.value !== currentValue) {
      field.onChange(input.value);
    }
  }, [field]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    syncAutofillValue();

    const handleAnimationStart = (event: AnimationEvent) => {
      if (event.animationName === "autofillStart") {
        syncAutofillValue();
      }
    };

    input.addEventListener("animationstart", handleAnimationStart);
    const timeouts = [0, 50, 100, 300, 500, 1000].map((delay) =>
      window.setTimeout(syncAutofillValue, delay)
    );

    return () => {
      input.removeEventListener("animationstart", handleAnimationStart);
      timeouts.forEach(clearTimeout);
    };
  }, [syncAutofillValue]);

  return (
    <input
      {...inputProps}
      {...field}
      ref={(node) => {
        field.ref(node);
        inputRef.current = node;
      }}
      value={field.value ?? ""}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      onChange={(event) => {
        field.onChange(event);
        inputProps.onChange?.(event);
      }}
    />
  );
}

function FieldTextarea({
  field,
  disabled,
  className,
  placeholder,
  rows = 4,
  textareaProps,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
  className: string;
  placeholder?: string;
  rows?: number;
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      {...textareaProps}
      {...field}
      value={field.value ?? ""}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}

export const Input: React.FC<InputProps> = ({
  name,
  type = "text",
  label,
  placeholder,
  disabled = false,
  className,
  inputClassName,
  checkboxSize = "sm",
  switchSize = "sm",
  radioSize = "md",
  options = [],
  uploadDescription,
  uploadCompact = false,
  existingImageUrl,
  onClearExistingImage,
  accept,
  rows = 4,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [plainFiles, setPlainFiles] = React.useState<File | File[] | null>(null);
  const resolvedPlaceholder = placeholder ?? (label ? "\u00a0" : undefined);
  const isFileType = type === "file" || type === "files";
  const isInlineField = type === "checkbox" || type === "switch";
  const isStaticLabel = type === "radio" || isFileType;
  const { onChange: onChangeProp, ...inputProps } = props;

  if (!name) {
    if (type === "files") {
      return (
        <div className={cn("flex-1 w-full", className)}>
          <FileUpload
            multiple
            value={plainFiles}
            onChange={setPlainFiles}
            disabled={disabled}
            description={uploadDescription}
            className={inputClassName}
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div className={cn("flex-1 w-full", className)}>
          <textarea
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              inputVariants({ element: "textarea" }),
              inputClassName
            )}
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        </div>
      );
    }

    const input = (
      <input
        type={type === "file" ? "file" : type}
        disabled={disabled}
        placeholder={placeholder}
        accept={accept}
        className={cn(
          inputVariants({ element: "input" }),
          type === "file" && "h-auto py-2",
          inputClassName,
          className
        )}
        onChange={
          type === "file"
            ? (event) => {
                setPlainFiles(event.target.files?.[0] ?? null);
                onChangeProp?.(event);
              }
            : onChangeProp
        }
        {...inputProps}
      />
    );

    return <div className="flex-1 w-full">{input}</div>;
  }

  const { control } = useFormContext();

  const renderInput = (
    field: ControllerRenderProps<FieldValues, string>,
    hasError: boolean
  ) => {
    const fieldClassName = cn(
      inputVariants({ element: "input" }),
      hasError && "border-destructive focus:border-destructive",
      inputClassName
    );
    const pickerFieldClassName = cn(
      fieldClassName,
      "flex cursor-pointer items-center !bg-white [&_*]:cursor-pointer"
    );
    const selectFieldClassName = cn(
      fieldClassName,
      "cursor-pointer !bg-white shadow-none focus:ring-0 [&>svg]:stroke-default-600"
    );

    const textareaClassName = cn(
      inputVariants({ element: "textarea" }),
      "peer",
      hasError && "border-destructive focus:border-destructive",
      inputClassName
    );

    switch (type) {
      case "checkbox":
        return (
          <Checkbox
            size={checkboxSize}
            className={cn(
              "mt-[1px] border-default-300",
              hasError && "border-destructive focus:border-destructive",
              inputClassName
            )}
            disabled={disabled}
            checked={!!field.value}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            id={field.name}
          >
            {label}
          </Checkbox>
        );

      case "switch":
        return (
          <div className="flex items-center gap-2">
            <Switch
              size={switchSize}
              disabled={disabled}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              id={field.name}
            />
            {label && (
              <FormLabel
                htmlFor={field.name}
                className="cursor-pointer font-normal text-default-600"
              >
                {label}
              </FormLabel>
            )}
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
            className={inputClassName}
          >
            {options.map((option) => (
              <RadioGroupItem
                key={option.value}
                value={option.value}
                id={`${field.name}-${option.value}`}
                size={radioSize}
              >
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        );

      case "select":
        return (
          <Select
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger
              className={cn(
                selectFieldClassName,
                hasError && "border-destructive focus:border-destructive"
              )}
            >
              <SelectValue placeholder={placeholder ?? "Select an option"} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        );

      case "textarea":
        return (
          <FieldTextarea
            field={field}
            disabled={disabled}
            className={textareaClassName}
            placeholder={resolvedPlaceholder}
            rows={rows}
            textareaProps={
              inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>
            }
          />
        );

      case "file":
        return (
          <FileUpload
            value={field.value ?? null}
            onChange={field.onChange}
            disabled={disabled}
            hasError={hasError}
            accept={
              accept
                ? Object.fromEntries(
                    accept
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item) => [item, []])
                  )
                : undefined
            }
            description={uploadDescription}
            compact={uploadCompact}
            existingImageUrl={existingImageUrl}
            onClearExistingImage={onClearExistingImage}
            className={inputClassName}
          />
        );

      case "files":
        return (
          <FileUpload
            multiple
            value={field.value ?? []}
            onChange={field.onChange}
            disabled={disabled}
            hasError={hasError}
            description={uploadDescription}
            className={inputClassName}
          />
        );

      case "date":
        return (
          <DatePicker
            value={field.value ?? ""}
            onChange={field.onChange}
            disabled={disabled}
            error={hasError}
            className={pickerFieldClassName}
          />
        );

      case "time":
        return (
          <TimePicker
            value={field.value ?? ""}
            onChange={field.onChange}
            disabled={disabled}
            error={hasError}
            className={pickerFieldClassName}
          />
        );

      case "password":
        return (
          <FieldInput
            field={field}
            disabled={disabled}
            type={showPassword ? "text" : "password"}
            className={cn(fieldClassName, "peer")}
            placeholder={resolvedPlaceholder}
            inputProps={inputProps}
          />
        );

      default:
        return (
          <FieldInput
            field={field}
            disabled={disabled}
            type={type}
            className={cn(fieldClassName, "peer")}
            placeholder={resolvedPlaceholder}
            inputProps={inputProps}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const isEmptyValue = !field.value;

        if (isInlineField) {
          return (
            <FormItem className={cn("flex items-center space-y-0", className)}>
              <FormControl>{renderInput(field, hasError)}</FormControl>
            </FormItem>
          );
        }

        if (isStaticLabel) {
          return (
            <FormItem className={cn("space-y-2", className)}>
              {label && (
                <FormLabel className="text-sm font-medium text-default-600">
                  {label}
                </FormLabel>
              )}
              <FormControl>{renderInput(field, hasError)}</FormControl>
              <FormMessage />
            </FormItem>
          );
        }

        return (
          <FormItem
            className={cn(
              "group relative space-y-0",
              (type === "date" || type === "time" || type === "select") &&
                "cursor-pointer",
              className
            )}
          >
            <FormControl>{renderInput(field, hasError)}</FormControl>
            {label && (
              <FormLabel
                className={cn(
                  inputVariants({
                    element: type === "textarea" ? "labelTextarea" : "label",
                  }),
                  !isEmptyValue &&
                    "top-2 -translate-y-5 scale-75 bg-card px-2",
                  (type === "select" || type === "date" || type === "time") &&
                    "pointer-events-none bg-white group-focus-within:bg-white",
                  (type === "date" || type === "time") &&
                    isEmptyValue &&
                    "top-1/2 -translate-y-1/2 scale-100 bg-transparent group-focus-within:bg-white"
                )}
              >
                {label}
              </FormLabel>
            )}
            {type === "password" && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer ltr:right-4 rtl:left-4"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Icon
                  icon={showPassword ? "heroicons:eye" : "heroicons:eye-slash"}
                  className="h-4 w-4 text-default-400"
                />
              </button>
            )}
            <FormMessage className="mt-1.5" />
          </FormItem>
        );
      }}
    />
  );
};
