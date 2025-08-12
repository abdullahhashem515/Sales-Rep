import React, { useState, useEffect } from "react"; // NEW: Import useState and useEffect
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { toast } from 'react-toastify'; // NEW: Import toast for notifications

import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  RectangleStackIcon, // أيقونة جديدة
  ShoppingBagIcon,
  UserCircleIcon,
  BriefcaseIcon ,
  InboxIcon,
  PowerIcon,
  ArrowUturnLeftIcon, // أيقونة جديدة
  DocumentTextIcon, // أيقونة جديدة
  UserGroupIcon, // أيقونة جديدة
  TruckIcon, // أيقونة جديدة
  MapPinIcon, // أيقونة جديدة
} from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export function Menubar() {
  const navigate = useNavigate();

  // حالة لإدارة اسم المستخدم
  const [userName, setUserName] = useState('اسم المستخدم'); // Default or loading state

  // // حالة لإدارة القوائم المنسدلة - لم تعد ضرورية لقائمة المنتجات المباشرة
  // const [open, setOpen] = React.useState(0);

  // // دالة لفتح وإغلاق القوائم - لم تعد تستخدم لقائمة المنتجات المباشرة
  // const handleOpen = (value) => {
  //   setOpen(open === value ? 0 : value);
  // };

  // useEffect لجلب اسم المستخدم عند تحميل المكون
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // إذا لم يتم العثور على اسم المستخدم، يمكنك تعيين قيمة افتراضية
      setUserName('مستخدم');
    }
  }, []); // تشغيل مرة واحدة عند تحميل المكون

  // دالة لتسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('userToken'); // إزالة التوكن من التخزين المحلي
    localStorage.removeItem('userName'); // NEW: إزالة اسم المستخدم عند تسجيل الخروج
    toast.info('تم تسجيل الخروج بنجاح.'); // عرض رسالة تنبيه
    navigate("/login"); // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
  };

  return (
    <Card className="primaryColor h-screen w-55 max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 overflow-y-auto">
      
      <div className=" p-2 pt-0">
        <img alt="Your Company" src={logo} className="mx-auto h-35" />
      </div>
            <hr className="w-full border-t-2 border-gray-200 my-3" />

      <div className="amiriFont flex flex-col items-center justify-center mt-2 mb-2">
        <UserCircleIcon className="h-10 w-10 mb-1" />
        <h1>{userName}</h1> {/* Display dynamic user name */}
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
          لوحة التحكم{" "}
        </ListItem>

        {/* UPDATED: Removed Accordion for Products, now direct navigation */}
        <ListItem
          className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/productslist")} // Direct navigation to productslist
        >
          <ListItemPrefix>
            <ShoppingBagIcon className="h-5 w-5" />
          </ListItemPrefix>
          المنتجات{" "}
        </ListItem>

        <ListItem className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors" onClick={() => navigate("/orderslist")}>
          <ListItemPrefix>
            <InboxIcon className="h-5 w-5 text-xs" />
          </ListItemPrefix>
          الطلبات{" "}
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

        <ListItem className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors" onClick={() => navigate("/returnslist")}>
          <ListItemPrefix>
            <ArrowUturnLeftIcon className="h-5 w-5 text-xs" />
          </ListItemPrefix>
          المرتجعات{" "}
          <ListItemSuffix>
            <Chip
              value="14"
              size="sm"
              variant="ghost"
              color="blue-red"
              className="rounded accentColor mr-5"
            />
          </ListItemSuffix>
        </ListItem>

        <ListItem
          className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/invoiceslist")}
        >
          <ListItemPrefix>
            <DocumentTextIcon className="h-5 w-5" />
          </ListItemPrefix>
          الفواتير{" "}
        </ListItem>

        <ListItem
          className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors pt-3 pb-3"
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
          المخزون         </ListItem>
        <ListItem
          className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/salesrep")}
        >
          <ListItemPrefix>
            <BriefcaseIcon className="h-5 w-5" />
          </ListItemPrefix>
          المندوبين
        </ListItem>

        <ListItem
          className="pt-3 pb-3 text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/visitslist")}
        >
          <ListItemPrefix>
            <MapPinIcon className="h-5 w-5" />
          </ListItemPrefix>
          الزيارات{" "}
        </ListItem>

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
          onClick={handleLogout} // Call handleLogout function on click
        >
          <ListItemPrefix>
            <PowerIcon className="h-5 w-5" />
          </ListItemPrefix>
          تسجيل الخروج
        </ListItem>
      </List>
    </Card>
  );
}
