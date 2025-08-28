import React, { useState } from 'react';
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";

// استيراد مكون المودال الخاص بتقرير المندوبين وطلباتهم
import RepAndOrdersModal from './RepAndOrdersModal';

// الأيقونات التي ستحتاجها للأزرار
import { 
    ChartBarIcon,
    ShoppingBagIcon,
    UsersIcon,
    DocumentTextIcon,
    CubeIcon,
    SparklesIcon
} from "@heroicons/react/24/solid";

// مكون مخصص لزر التقرير
const ReportButton = ({ title, icon, colorClass, onClick }) => {
    return (
        <button
            className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 ${colorClass} text-white`}
            onClick={onClick}
        >
            {icon && <div className="mb-2">{icon}</div>}
            <span className="text-lg font-semibold">{title}</span>
        </button>
    );
};

export default function ReportsList() {
    // حالة لإدارة فتح وإغلاق المودال
    const [isRepOrdersModalOpen, setIsRepOrdersModalOpen] = useState(false);

    return (
        <MainLayout>
            <div className="amiriFont text-white p-6">
                <PageHeader title="التقارير" />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportButton 
                        title="المندوبين وطلباتهم" 
                        icon={<ShoppingBagIcon className="h-10 w-10" />} 
                        colorClass="bg-blue-600 hover:bg-blue-700" 
                        onClick={() => setIsRepOrdersModalOpen(true)}
                    />
                    <ReportButton 
                        title="المندوبين وزياراتهم" 
                        icon={<UsersIcon className="h-10 w-10" />} 
                        colorClass="bg-emerald-600 hover:bg-emerald-700" 
                    />
                    <ReportButton 
                        title="المندوبين ومبيعاتهم" 
                        icon={<ChartBarIcon className="h-10 w-10" />} 
                        colorClass="bg-cyan-600 hover:bg-cyan-700" 
                    />
                    <ReportButton 
                        title="العملاء ومشترياتهم" 
                        icon={<ShoppingBagIcon className="h-10 w-10" />} 
                        colorClass="bg-fuchsia-600 hover:bg-fuchsia-700" 
                    />
                    <ReportButton 
                        title="المندوبين والسندات" 
                        icon={<DocumentTextIcon className="h-10 w-10" />} 
                        colorClass="bg-orange-600 hover:bg-orange-700" 
                    />
                    <ReportButton 
                        title="العملاء والسندات" 
                        icon={<DocumentTextIcon className="h-10 w-10" />} 
                        colorClass="bg-red-600 hover:bg-red-700" 
                    />
                    <ReportButton 
                        title="المندوبين والعملاء ومرتجعاتهم" 
                        icon={<ShoppingBagIcon className="h-10 w-10" />} 
                        colorClass="bg-purple-600 hover:bg-purple-700" 
                    />
                    <ReportButton 
                        title="المخزون" 
                        icon={<CubeIcon className="h-10 w-10" />} 
                        colorClass="bg-teal-600 hover:bg-teal-700" 
                    />
                    <ReportButton 
                        title="إجمالي الأداء" 
                        icon={<SparklesIcon className="h-10 w-10" />} 
                        colorClass="bg-indigo-600 hover:bg-indigo-700" 
                    />
                    <ReportButton 
                        title="الأصناف وأسعارها" 
                        icon={<CubeIcon className="h-10 w-10" />} 
                        colorClass="bg-yellow-600 hover:bg-yellow-700" 
                    />
                </div>
            </div>

            {/* عرض المودال بشكل شرطي */}
            <RepAndOrdersModal 
                show={isRepOrdersModalOpen}
                onClose={() => setIsRepOrdersModalOpen(false)}
            />
        </MainLayout>
    );
}