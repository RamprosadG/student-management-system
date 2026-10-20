import { HiOutlineDownload } from "react-icons/hi";

interface SubmissionFileActionsProps {
  fileUrl: string | null;
  fileName: string;
  className?: string;
}

export function SubmissionFileActions({
  fileUrl,
  fileName,
  className = "",
}: SubmissionFileActionsProps) {
  if (!fileUrl) {
    return <span className="text-xs text-slate-400 italic">No file</span>;
  }

  return (
    <a
      href={fileUrl}
      download={fileName}
      title={`Download ${fileName}`}
      aria-label={`Download ${fileName}`}
      className={`inline-flex text-slate-500 transition-colors hover:text-emerald-600 ${className}`}
    >
      <HiOutlineDownload className="w-4 h-4" />
    </a>
  );
}
