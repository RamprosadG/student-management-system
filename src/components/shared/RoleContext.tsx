"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "staff" | "student";

export interface StudentOption {
  id: string;
  studentId: string;
  fullName: string;
  programmeName: string;
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  studentList: StudentOption[];
  setStudentList: (list: StudentOption[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("staff");
  const [selectedStudentId, setSelectedStudentIdState] = useState<string | null>(null);
  const [studentList, setStudentList] = useState<StudentOption[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("sms_role") as Role;
      if (savedRole === "staff" || savedRole === "student") {
        setRoleState(savedRole);
      }
      const savedStudentId = localStorage.getItem("sms_selected_student_id");
      if (savedStudentId) {
        setSelectedStudentIdState(savedStudentId);
      }
      const savedCollapsed = localStorage.getItem("sms_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }
    } catch {
      // LocalStorage unavailable in SSR
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("sms_role", newRole);
    } catch {
      // ignore
    }
  };

  const setSelectedStudentId = (id: string | null) => {
    setSelectedStudentIdState(id);
    try {
      if (id) {
        localStorage.setItem("sms_selected_student_id", id);
      } else {
        localStorage.removeItem("sms_selected_student_id");
      }
    } catch {
      // ignore
    }
  };

  const handleSetCollapsed = (val: boolean) => {
    setCollapsed(val);
    try {
      localStorage.setItem("sms_sidebar_collapsed", String(val));
    } catch {
      // ignore
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        selectedStudentId,
        setSelectedStudentId,
        studentList,
        setStudentList,
        sidebarOpen,
        setSidebarOpen,
        collapsed,
        setCollapsed: handleSetCollapsed,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
