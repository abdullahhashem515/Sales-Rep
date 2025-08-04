import React from "react";
import { Menubar } from "./menubar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen w-screen SeconsryColor" dir="rtl">
      <div className="flex-shrink-0 ">
        <Menubar />
      </div>
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
