import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { StudentRecord } from "@/types/students";
import type { StudentToEdit } from "@/features/students/UpdateStudentForm";
import { FiEdit } from "react-icons/fi";

interface StudentsTableProps {
  students: StudentRecord[];
  isLoading: boolean;
  onEdit: (student: StudentToEdit) => void;
}

const statusVariantMap = {
  ENROLLED: "success",
  DEFERRED: "warning",
  WITHDRAWN: "danger",
  COMPLETED: "info",
} as const;

export function StudentsTable({ students, isLoading, onEdit }: StudentsTableProps) {
  const columns: Column<StudentRecord>[] = [
    {
      key: "studentId",
      header: "Student ID",
      render: (item) => (
        <span className="font-mono font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md text-xs border border-indigo-100">
          {item.studentId}
        </span>
      ),
    },
    {
      key: "fullName",
      header: "Student Details",
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.fullName}</div>
          <div className="text-xs text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: "programme",
      header: "Programme",
      render: (item) => (
        <div>
          <div className="font-medium text-slate-800">{item.programme?.name}</div>
          <div className="text-xs text-gray-500">
            Year: {item.academicYear?.name} &middot; Standard Fee:{" "}
            {item.programme ? formatCurrency(Number(item.programme.standardFee)) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "dateOfBirth",
      header: "Date of Birth",
      render: (item) => (
        <span className="text-gray-600 text-xs">
          {formatDate(item.dateOfBirth)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Enrolment Status",
      render: (item) => (
        <Badge variant={statusVariantMap[item.status]} size="md">
          {item.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => (
        <TableActionButton
          tooltip="Edit student"
          color="blue"
          onClick={(e) => {
            e.stopPropagation();
            onEdit({
              id: item.id,
              studentId: item.studentId,
              fullName: item.fullName,
              email: item.email,
              dateOfBirth: item.dateOfBirth,
              status: item.status,
            });
          }}
        >
          <FiEdit className="w-4 h-4" />
        </TableActionButton>
      ),
    },
  ];

  return (
    <DataTable
      data={students}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No students found matching your filters."
    />
  );
}
