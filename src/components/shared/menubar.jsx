import React from "react";
import { useNavigate } from 'react-router-dom';import logo from '../../assets/logo.png';


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
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
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

  return (
    // إضافة خاصية "dir='rtl'" لجعل الاتجاه من اليمين إلى اليسار
    <Card className="primaryColor h-screen w-50 max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className=" p-4 pt-0">
       <img
                     alt="Your Company"
                     src={logo}
                     className="mx-auto h-35"
                   />
      </div>
      <List>
        <Accordion
          open={open === 1}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
            />
          }
        >
          <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3 hover:bg-blue-100/40 cursor-pointer transition-colors">
            <ListItemPrefix>
              <PresentationChartBarIcon className="h-5 w-5" />
            </ListItemPrefix>
            <Typography color="blue-gray" className="amiriFont mr-auto font-normal">
              لوحة التحكم
            </Typography>
          </AccordionHeader>
          {open === 1 && (
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
                  <ListItemPrefix>
                    <ChevronLeftIcon strokeWidth={3} className=" h-3 w-5" />
                  </ListItemPrefix>
                  التحليلات
                </ListItem>
                <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
                  <ListItemPrefix>
                    <ChevronLeftIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  التقارير
                </ListItem>
                <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
                  <ListItemPrefix>
                    <ChevronLeftIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  المشاريع
                </ListItem>
              </List>
            </AccordionBody>
          )}
        </Accordion>
        <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
          <ListItemPrefix>
            <InboxIcon className="h-5 w-5" />
          </ListItemPrefix>
          البريد الوارد
          <ListItemSuffix>
            <Chip value="14" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
          </ListItemSuffix>
        </ListItem>
        <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors" onClick={() => navigate('/userslist')} >
          <ListItemPrefix>
            <UserCircleIcon className="h-5 w-5" />
          </ListItemPrefix>
          المستخدمين
        </ListItem>
        <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
          <ListItemPrefix>
            <Cog6ToothIcon className="h-5 w-5" />
          </ListItemPrefix>
          الإعدادات
        </ListItem>
        <ListItem className="amiriFont hover:bg-blue-100/40 cursor-pointer transition-colors">
          <ListItemPrefix>
            <PowerIcon className="h-5 w-5" />
          </ListItemPrefix>
          تسجيل الخروج
        </ListItem>
      </List>
    </Card>
  );
}