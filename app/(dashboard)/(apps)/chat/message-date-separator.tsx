const MessageDateSeparator = ({ label }: { label: string }) => {
  if (!label) return null;

  return (
    <div className="my-4 flex justify-center px-4">
      <span className="rounded-md bg-default-100 px-3 py-1 text-xs font-medium text-default-600">
        {label}
      </span>
    </div>
  );
};

export default MessageDateSeparator;
