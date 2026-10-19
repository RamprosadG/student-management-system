"use client";

import { usePathname, useRouter } from "next/navigation";
import { staffRoutes, studentRoutes, useRole } from "./RoleContext";
import { FiMenu } from "react-icons/fi";
import Dropdown from "../ui/dropdowns/Dropdown";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    role,
    setRole,
    selectedStudentId,
    setSelectedStudentId,
    studentList,
    setSidebarOpen,
  } = useRole();

  const isStaff = role === "staff";

  const handleRoleSwitch = (newRole: "staff" | "student") => {
    if (newRole === role) return;
    setRole(newRole);

    if (newRole === "staff") {
      if (studentRoutes.some((route) => pathname.startsWith(route))) {
        router.push("/dashboard");
      }
    } else {
      if (staffRoutes.some((route) => pathname.startsWith(route))) {
        router.push("/student-dashboard");
      }
    }
  };

  return (
    <header className="fixed top-0 z-30 bg-white shadow-md hover:shadow-lg left-0 right-0 transition-all duration-300">
      <div className="flex items-center h-16 lg:pl-64">
        <div className="flex items-center justify-between w-full px-4 lg:px-6">
          {/* Left Section: Mobile Hamburger (No route title displayed) */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>

          {/* Right Section: Student Selector & Role Switcher */}
          <div className="flex items-center gap-3 ml-auto">
            {!isStaff && (
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden sm:inline text-gray-500 font-medium shrink-0">
                  Student:
                </span>

                <div className="w-[180px] sm:w-[220px]">
                  <Dropdown
                    aria-label="Select student"
                    value={selectedStudentId || ""}
                    onChange={(value) => setSelectedStudentId(value || null)}
                    options={[
                      {
                        value: "",
                        label: "Default Student",
                      },
                      ...studentList.map((s) => ({
                        value: s.id,
                        label: `${s.fullName} (${s.studentId})`,
                      })),
                    ]}
                    placeholder="Select student"
                    hideOptionalText
                    className="!rounded-lg !border-gray-200 !px-2.5 !py-1.5 !text-xs !shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleRoleSwitch("staff")}
                className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${isStaff
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Staff View
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch("student")}
                className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${!isStaff
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Student View
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
