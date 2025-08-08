import React from "react";
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

  // حالة لإدارة القوائم المنسدلة
  const [open, setOpen] = React.useState(0);

  // دالة لفتح وإغلاق القوائم
  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  // NEW: دالة لتسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('userToken'); // إزالة التوكن من التخزين المحلي
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
        <h1>اسم المستخدم</h1>
      </div>
      <hr className="w-full border-t-2 border-gray-200 my-3" />
      <List>
        <ListItem
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          <ListItemPrefix>
            <RectangleStackIcon className="h-5 w-5" />
          </ListItemPrefix>
          لوحة التحكم{" "}
        </ListItem>

        <Accordion
          open={open === 1}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                open === 1 ? "rotate-180" : ""
              }`}
            />
          }
        >
          <AccordionHeader
            onClick={() => handleOpen(1)}
            className="border-b-0 p-3 hover:bg-blue-100/40 cursor-pointer transition-colors"
          >
            <ListItemPrefix>
              <ShoppingBagIcon className="h-5 w-5" />
            </ListItemPrefix>
            <Typography
              color="blue-gray"
              className="amiriFont font-normal text-lg"
            >
              المنتجات{" "}
            </Typography>
          </AccordionHeader>
          {open === 1 && (
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
                  <ListItemPrefix>
                    <ChevronLeftIcon strokeWidth={3} className=" h-3 w-5" />
                  </ListItemPrefix>
                  الفئات{" "}
                </ListItem>
                <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
                  <ListItemPrefix>
                    <ChevronLeftIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  المنتجات{" "}
                </ListItem>
                <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
                  <ListItemPrefix>
                    <ChevronLeftIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  الأصناف{" "}
                </ListItem>
              </List>
            </AccordionBody>
          )}
        </Accordion>

        <ListItem className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
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

        <ListItem className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
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
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/invoices")}
        >
          <ListItemPrefix>
            <DocumentTextIcon className="h-5 w-5" />
          </ListItemPrefix>
          الفواتير{" "}
        </ListItem>

        <ListItem
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/customers")}
        >
          <ListItemPrefix>
            <UserGroupIcon className="h-5 w-5" />
          </ListItemPrefix>
          العملاء
        </ListItem>

        <ListItem
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/representatives")}
        >
          <ListItemPrefix>
            <TruckIcon className="h-5 w-5" />
          </ListItemPrefix>
          المخزون         </ListItem>
        <ListItem
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/representatives")}
        >
          <ListItemPrefix>
            <BriefcaseIcon className="h-5 w-5" />
          </ListItemPrefix>
          المندوبين
        </ListItem>

        <ListItem
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/visits")}
        >
          <ListItemPrefix>
            <MapPinIcon className="h-5 w-5" />
          </ListItemPrefix>
          الزيارات{" "}
        </ListItem>

        <ListItem
          className="text-lg amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={() => navigate("/userslist")}
        >
          <ListItemPrefix>
            <UserCircleIcon className="h-5 w-5" />
          </ListItemPrefix>
          المستخدمين
        </ListItem>

        <ListItem
          className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors"
          onClick={handleLogout} // NEW: Call handleLogout function on click
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
