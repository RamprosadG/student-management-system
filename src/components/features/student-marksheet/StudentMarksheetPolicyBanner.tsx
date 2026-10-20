import { HiOutlineInformationCircle } from "react-icons/hi";

export function StudentMarksheetPolicyBanner() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-start gap-3">
      <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      <div className="text-xs text-blue-800 space-y-1">
        <span className="font-semibold block">Academic Publication Policy</span>
        <p>
          Grades are visible on your official marksheet only after formal verification and release by the Registry Office. Draft grades under review or results withheld for administrative checks will remain masked until formally published.
        </p>
      </div>
    </div>
  );
}
