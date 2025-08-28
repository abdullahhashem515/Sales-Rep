import React, { useState, useEffect, useContext } from 'react';
import MainLayout from "../../components/shared/MainLayout";
import { get } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ListBulletIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import FormSelectField from '../../components/shared/FormSelectField';

// تعريف مكون StatCard داخل نفس الملف
const StatCard = ({ title, value, unit, icon, description, color }) => {
  return (
    <div className={`amiriFont p-6 rounded-lg shadow-lg text-white transform transition-transform hover:scale-105 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {icon && React.cloneElement(icon, { className: "h-8 w-8 text-white" })}
      </div>
      <p className="text-3xl font-bold mb-1">{value} {unit}</p>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
};

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [currencies, setCurrencies] = useState([]);

  // دالة مساعدة للحصول على إجمالي المبيعات لعملة محددة
  const getSalesTotalForCurrency = (salesData, currencyId) => {
    if (!salesData || !Array.isArray(salesData)) {
      return { total: 0, code: '' };
    }

    // البحث عن البيانات للعملة المحددة
    const selectedCurrencyData = salesData.find(item => item.currency_id.toString() === currencyId.toString());
    
    if (selectedCurrencyData) {
      return {
        total: parseFloat(selectedCurrencyData.total),
        code: selectedCurrencyData.currency.code
      };
    }
    return { total: 0, code: '' };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('Fetching dashboard data...');
      if (!token) {
        console.log('Token is missing. Data fetch will not proceed.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (paymentTypeFilter) {
          queryParams.append('payment_type', paymentTypeFilter);
        }
        if (currencyFilter) {
          queryParams.append('currency_id', currencyFilter);
        }
        const queryString = queryParams.toString();
        const url = `admin/dashboard${queryString ? '?' + queryString : ''}`;
        
        console.log('API URL:', url);
        const response = await get(url, token);
        console.log('API Response:', response);
        
        if (response && Object.keys(response).length > 0) {
          setDashboardData(response);
          // استخراج العملات الفريدة من بيانات المبيعات
          const allSales = response.sales?.all || [];
          const uniqueCurrencies = allSales.map(item => item.currency);
          setCurrencies(uniqueCurrencies);
          // تعيين أول عملة كقيمة افتراضية إذا لم يتم تحديد أي عملة بعد
          if (uniqueCurrencies.length > 0 && !currencyFilter) {
            setCurrencyFilter(uniqueCurrencies[0].id);
          }
          console.log('Dashboard data successfully set:', response);
        } else {
          toast.error('فشل جلب بيانات لوحة التحكم.');
          console.error('API returned an empty or malformed response.');
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        toast.error('حدث خطأ أثناء جلب البيانات.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, paymentTypeFilter, currencyFilter]);

  // تعريف كروت المبيعات لإنشاءها بشكل ديناميكي
  const salesCardData = [
    {
      title: 'المبيعات اليومية',
      dataKey: 'daily',
      icon: <CurrencyDollarIcon />,
      description: 'إجمالي المبيعات لليوم',
      color: 'bg-emerald-500'
    },
    {
      title: 'المبيعات الأسبوعية',
      dataKey: 'weekly',
      icon: <CurrencyDollarIcon />,
      description: 'إجمالي المبيعات لهذا الأسبوع',
      color: 'bg-cyan-500'
    },
    {
      title: 'المبيعات الشهرية',
      dataKey: 'monthly',
      icon: <CurrencyDollarIcon />,
      description: 'إجمالي المبيعات لهذا الشهر',
      color: 'bg-indigo-500'
    },
    {
      title: 'إجمالي المبيعات',
      dataKey: 'all',
      icon: <ShoppingBagIcon />,
      description: 'إجمالي المبيعات منذ البداية',
      color: 'bg-purple-500'
    },
  ];

  // كروت حالة الطلبات
  const orderCards = [
    {
      title: 'الطلبات المقبولة',
      value: dashboardData?.orders?.accepted,
      icon: <CheckCircleIcon />,
      description: 'الطلبات التي تم قبولها',
      color: 'bg-green-500'
    },
    {
      title: 'الطلبات المعلقة',
      value: dashboardData?.orders?.pending,
      icon: <ClockIcon />,
      description: 'الطلبات قيد المراجعة',
      color: 'bg-yellow-500'
    },
    {
      title: 'الطلبات المرفوضة',
      value: dashboardData?.orders?.rejected,
      icon: <XCircleIcon />,
      description: 'الطلبات التي تم رفضها',
      color: 'bg-red-500'
    },
  ];

  // كروت أدوار المستخدمين
  const userCards = [
    {
      title: 'مندوبي الجملة',
      value: dashboardData?.reps?.wholesale,
      icon: <UserGroupIcon />,
      description: 'عدد مندوبي البيع بالجملة',
      color: 'bg-slate-500'
    },
    {
      title: 'مندوبي التجزئة',
      value: dashboardData?.reps?.retail,
      icon: <UserGroupIcon />,
      description: 'عدد مندوبي البيع بالتجزئة',
      color: 'bg-orange-500'
    },
  ];

  // كروت الإحصائيات الأخرى
  const otherCards = [
    {
      title: 'المدراء',
      value: dashboardData?.users,
      icon: <UserCircleIcon />,
      description: 'عدد المدراء في النظام',
      color: 'bg-sky-500'
    },
    {
      title: 'الزيارات',
      value: dashboardData?.visits,
      icon: <ListBulletIcon />,
      description: 'إجمالي عدد الزيارات',
      color: 'bg-fuchsia-500'
    },
    {
      title: 'العملاء',
      value: dashboardData?.customers,
      icon: <UsersIcon />,
      description: 'إجمالي عدد العملاء',
      color: 'bg-pink-500'
    },
  ];

  const paymentTypeOptions = [
    { value: '', label: 'جميع المبيعات' },
    { value: 'cash', label: 'المبيعات النقدية' },
    { value: 'credit', label: 'المبيعات الآجلة' },
  ];

  return (
    <MainLayout>
      <div className="amiriFont flex flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold text-white mb-4">لوحة التحكم</h1>
        
        {/* Sales Filter Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg shadow bg-gray-800">
          <h2 className="text-lg font-semibold text-white">إحصائيات المبيعات</h2>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-medium text-white">نوع الدفع:</span>
              <div className="w-full md:w-48 text-white">
                <FormSelectField
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  options={paymentTypeOptions}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-medium text-white">العملة:</span>
              <div className="w-full md:w-48 text-white">
                <FormSelectField
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  options={currencies.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Cards */}
        {loading ? (
          <div className="text-center text-gray-400">جاري تحميل بيانات المبيعات...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salesCardData.map((card, index) => {
              const sales = getSalesTotalForCurrency(dashboardData?.sales?.[card.dataKey], currencyFilter);
              return (
                <StatCard
                  key={index}
                  title={card.title}
                  value={sales.total.toFixed(2)}
                  icon={card.icon}
                  unit={sales.code || ''}
                  description={card.description}
                  color={card.color}
                />
              );
            })}
          </div>
        )}
        
        <hr className="my-6 border-gray-700" />

        {/* Order Status Cards */}
        <h2 className="text-lg font-semibold text-white">حالة الطلبات</h2>
        {loading ? (
          <div className="text-center text-gray-400">جاري تحميل بيانات الطلبات...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orderCards.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                value={card.value || 0}
                icon={card.icon}
                description={card.description}
                color={card.color}
              />
            ))}
          </div>
        )}

        <hr className="my-6 border-gray-700" />

        {/* User Role Cards */}
        <h2 className="text-lg font-semibold text-white">إحصائيات المستخدمين</h2>
        {loading ? (
          <div className="text-center text-gray-400">جاري تحميل بيانات المستخدمين...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCards.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                value={card.value || 0}
                icon={card.icon}
                description={card.description}
                color={card.color}
              />
            ))}
          </div>
        )}

        <hr className="my-6 border-gray-700" />

        {/* Other Metrics Cards */}
        <h2 className="text-lg font-semibold text-white">إحصائيات أخرى</h2>
        {loading ? (
          <div className="text-center text-gray-400">جاري تحميل الإحصائيات...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherCards.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                value={card.value || 0}
                icon={card.icon}
                description={card.description}
                color={card.color}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
