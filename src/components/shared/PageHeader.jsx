import React from 'react';
import { Typography } from "@material-tailwind/react"; // Assuming Typography is from Material Tailwind

/**
 * مكون يعرض عنوان الصفحة الرئيسي.
 * @param {object} props
 * @param {string} props.title - نص عنوان الصفحة.
 */
export default function PageHeader({ title }) {
  return (
    <Typography variant="h2" className="amiriFont text-2xl font-bold text-white">
      {title}
    </Typography>
  );
}
