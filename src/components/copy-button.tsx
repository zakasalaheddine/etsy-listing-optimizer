import { useState } from "react";
import { CheckIcon, ClipboardIcon } from "./icons";

interface CopyButtonProps {
  textToCopy: string;
}

export default function CopyButton({ textToCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <CheckIcon className="w-4 h-4 text-green-500" />
      ) : (
        <ClipboardIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      )}
    </button>
  );
}
