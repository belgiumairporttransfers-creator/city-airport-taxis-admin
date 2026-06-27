import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fragment } from "react";

type AboutProps = {
  about: string;
};

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

const linkifyText = (text: string) => {
  const parts = text.split(URL_PATTERN);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 break-all"
        >
          {part}
        </a>
      );
    }

    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
};

const About = ({ about }: AboutProps) => {
  const paragraphs = about
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Card className="min-w-0">
      <CardHeader className="mb-3 flex-row items-center justify-between border-none">
        <CardTitle className="text-lg font-medium text-default-800">About</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 overflow-x-hidden">
        {paragraphs.length > 0 ? (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm text-default-600 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
              >
                {linkifyText(paragraph)}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-500">No about information added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default About;
