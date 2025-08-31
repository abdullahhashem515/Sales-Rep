import React, { useState, useRef, useEffect } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import {
    FunnelIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import ReportDetailsModal from './ReportDetailsPage';

const logo = "/logo.png";

const mockData = [
    { id: 1, repName: "علياء أحمد", orderNumber: "ORD-001", orderDate: "2023-08-01", status: "مقبول" },
    { id: 2, repName: "محمد سعيد", orderNumber: "ORD-002", orderDate: "2023-08-02", status: "معلق" },
    { id: 3, repName: "سارة حسين", orderNumber: "ORD-003", orderDate: "2023-08-03", status: "مرفوض" },
    { id: 4, repName: "علياء أحمد", orderNumber: "ORD-004", orderDate: "2023-08-04", status: "مقبول" },
    { id: 5, repName: "محمد سعيد", orderNumber: "ORD-005", orderDate: "2023-08-05", status: "مقبول" },
    { id: 6, repName: "سارة حسين", orderNumber: "ORD-006", orderDate: "2023-08-06", status: "معلق" },
];

const RepAndOrdersModal = ({ show, onClose }) => {
    // حالة للتحكم في نافذة تقرير التفاصيل
    const [showReportModal, setShowReportModal] = useState(false);
    // حالة لتخزين البيانات المصفاة المراد تمريرها
    const [reportDataToPass, setReportDataToPass] = useState([]);

    const [filters, setFilters] = useState({
        repName: '',
        status: '',
        fromDate: '',
        toDate: ''
    });
    const tableRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const filteredData = mockData.filter(item => {
        const repMatch = item.repName.toLowerCase().includes(filters.repName.toLowerCase());
        const statusMatch = filters.status === '' || item.status === filters.status;
        const fromDateMatch = filters.fromDate === '' || new Date(item.orderDate) >= new Date(filters.fromDate);
        const toDateMatch = filters.toDate === '' || new Date(item.orderDate) <= new Date(filters.toDate);
        return repMatch && statusMatch && fromDateMatch && toDateMatch;
    });

    const handleViewReport = () => {
        setReportDataToPass(filteredData);
        setShowReportModal(true);
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
    };

    const handleViewOrderDetails = (order) => {
        alert(`تفاصيل الطلب:\nرقم الطلب: ${order.orderNumber}\nالمندوب: ${order.repName}\nالحالة: ${order.status}`);
    };

    return (
        <>
            {/* المودال الرئيسي */}
            <ModalWrapper
                show={show}
                onClose={onClose}
                isVisible={isVisible}
                title="المندوبين وطلباتهم"
                maxWidth="max-w-6xl"
                maxHeight="max-h-[92vh]"
            >
                <div className="flex flex-col h-full">
                    {/* الفلاتر */}
                    <div className="flex flex-row flex-wrap items-center gap-4 mt-4 pb-4 border-b border-gray-700">
                        <div className="flex items-center gap-2 flex-1">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="repName"
                                placeholder="اسم المندوب"
                                value={filters.repName}
                                onChange={handleFilterChange}
                                className="px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-grow"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <FunnelIcon className="h-5 w-5 text-gray-400" />
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-grow"
                            >
                                <option value="">كل الحالات</option>
                                <option value="مقبول">مقبول</option>
                                <option value="معلق">معلق</option>
                                <option value="مرفوض">مرفوض</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-gray-400 text-sm">من:</span>
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-grow"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-gray-400 text-sm">إلى:</span>
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-grow"
                            />
                        </div>
                    </div>

                    {/* الجدول */}
                    <div className="flex-grow overflow-y-auto mt-4" style={{ maxHeight: '300px' }}>
                        <table id="report-table" ref={tableRef} className="w-full text-right text-gray-300">
                            <thead className="sticky top-0 bg-gray-800 text-sm uppercase">
                                <tr>
                                    <th className="p-3">م</th>
                                    <th className="p-3">اسم المندوب</th>
                                    <th className="p-3">رقم الطلب</th>
                                    <th className="p-3">تاريخ الطلب</th>
                                    <th className="p-3">حالة الطلب</th>
                                    <th className="p-3">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="p-3 font-medium">{index + 1}</td>
                                        <td className="p-3 font-medium">{item.repName}</td>
                                        <td className="p-3">{item.orderNumber}</td>
                                        <td className="p-3">{item.orderDate}</td>
                                        <td className="p-3">{item.status}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleViewOrderDetails(item)}
                                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1 px-3 rounded-lg shadow-md transition duration-200"
                                            >
                                                تفاصيل الطلب
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-gray-500">
                                            لا توجد بيانات مطابقة للفلاتر.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* زر عرض التقرير */}
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleViewReport}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
                        >
                            عرض التقرير
                        </button>
                    </div>
                </div>
            </ModalWrapper>

            {/* تضمين ReportDetailsModal هنا */}
            <ReportDetailsModal
                show={showReportModal}
                onClose={handleCloseReportModal}
                reportData={reportDataToPass}
            />
        </>
    );
};

export default RepAndOrdersModal;
