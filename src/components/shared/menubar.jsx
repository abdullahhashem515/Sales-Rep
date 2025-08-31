// src/components/shared/Menubar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import { get } from "../../utils/apiService";

import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import {
  RectangleStackIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  BriefcaseIcon,
  InboxIcon,
  PowerIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  TruckIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

export function Menubar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("اسم المستخدم");
  const [loading, setLoading] = useState(false); // حالة اللودينق

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName || "مستخدم");
  }, []);

  const handleLogout = async () => {
    // حذف التوكن واسم المستخدم مباشرة
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    navigate("/login"); 

    try {
      setLoading(true); // إظهار اللودينق
      const token = localStorage.getItem("userToken"); // بعد الحذف سيكون null
      const response = await get("admin/logout", token);

      setLoading(false); // إخفاء اللودينق
      toast.success(response.message || "تم تسجيل الخروج بنجاح.");
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
      // لا مشكلة لو فشل، لأننا أصلاً حذفنا التوكن
      toast.error("تم تسجيل الخروج محلياً.");
    }
  };


  return (
    <>
      {/* شاشة اللودينق */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-[9999]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl font-bold">جاري تسجيل الخروج...</p>
        </div>
      )}

      <Card className="primaryColor h-screen w-55 max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 overflow-y-auto">
        <div className="p-2 pt-0">
          <img alt="Your Company" src={logo} className="mx-auto h-35" />
        </div>
        <hr className="w-full border-t-2 border-gray-200 my-3" />

        <div className="amiriFont flex flex-col items-center justify-center mt-2 mb-2">
          <UserCircleIcon className="h-10 w-10 mb-1" />
          <h1>{userName}</h1>
        </div>
        <hr className="w-full border-t-2 border-gray-200 my-3" />

        <List>
          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ListItemPrefix>
              <RectangleStackIcon className="h-5 w-5" />
            </ListItemPrefix>
            لوحة التحكم
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/productslist")}
          >
            <ListItemPrefix>
              <ShoppingBagIcon className="h-5 w-5" />
            </ListItemPrefix>
            المنتجات
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/orderslist")}
          >
            <ListItemPrefix>
              <InboxIcon className="h-5 w-5 text-xs" />
            </ListItemPrefix>
            الطلبات
            <ListItemSuffix>
              <Chip
                value="14"
                size="sm"
                variant="ghost"
                color="blue-gray"
                className="rounded accentColor mr-5"
              />
            </ListItemSuffix>
          </ListItem>

         
          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/returnslist")}
          >
            <ListItemPrefix>
                           <ArrowUturnLeftIcon className="h-5 w-5 text-xs" />
            </ListItemPrefix>
المرتجعات          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/invoiceslist")}
          >
            <ListItemPrefix>
              <DocumentTextIcon className="h-5 w-5" />
            </ListItemPrefix>
            الفواتير
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/voucherslist")}
          >
            <ListItemPrefix>
              <DocumentTextIcon className="h-5 w-5" />
            </ListItemPrefix>
            السندات
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/customerslist")}
          >
            <ListItemPrefix>
              <UserGroupIcon className="h-5 w-5" />
            </ListItemPrefix>
            العملاء
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/inventorieslist")}
          >
            <ListItemPrefix>
              <TruckIcon className="h-5 w-5" />
            </ListItemPrefix>
            المخزون
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/accountslist")}
          >
            <ListItemPrefix>
              <BriefcaseIcon className="h-5 w-5" />
            </ListItemPrefix>
            الحسابات{" "}
          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/visitslist")}
          >
            <ListItemPrefix>
              <MapPinIcon className="h-5 w-5" />
            </ListItemPrefix>
            الزيارات
          </ListItem>
           <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/reportslist")}
          >
            <ListItemPrefix>
              <MapPinIcon className="h-5 w-5" />
            </ListItemPrefix>
التقارير          </ListItem>

          <ListItem
            className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={() => navigate("/userslist")}
          >
            <ListItemPrefix>
              <UserCircleIcon className="h-5 w-5" />
            </ListItemPrefix>
            المستخدمين
          </ListItem>

          <ListItem
            className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <ListItemPrefix>
              <PowerIcon className="h-5 w-5" />
            </ListItemPrefix>
            تسجيل الخروج
          </ListItem>
        </List>
      </Card>
    </>
  );
}
