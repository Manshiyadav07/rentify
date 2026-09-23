import { Printer, X, CheckCircle, BookOpen } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 animate-fade-in relative print:p-0 print:shadow-none print:border-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition print:hidden"
        >
          <X size={20} />
        </button>

        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-extrabold text-2xl tracking-tight mb-1">
              <BookOpen size={28} />
              <span>Rentify</span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Book Rental Platform</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              Paid & Confirmed
            </span>
            <p className="text-xs text-slate-500 font-medium">Invoice: <strong className="text-slate-800">{invoice.invoiceNumber}</strong></p>
            <p className="text-xs text-slate-400">Date: {new Date(invoice.issuedAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Customer & Order Meta */}
        <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block font-semibold mb-1">Billed To:</span>
            <p className="font-bold text-slate-800 text-sm">{invoice.customerDetails?.name || 'Reader'}</p>
            <p className="text-slate-600">{invoice.customerDetails?.email}</p>
            {invoice.customerDetails?.phone && <p className="text-slate-500">{invoice.customerDetails?.phone}</p>}
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-semibold mb-1">Payment Reference:</span>
            <p className="text-slate-600">Order ID: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">{invoice.orderId}</code></p>
            <p className="text-slate-600 mt-1">Payment ID: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">{invoice.paymentId || 'Verified'}</code></p>
            <p className="text-slate-600 mt-1">Method: {invoice.paymentMethod || 'Online Gateway'}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Book Title</th>
                <th className="py-2.5 text-center">Duration</th>
                <th className="py-2.5 text-right">Rental Fee</th>
                <th className="py-2.5 text-right">Deposit</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="text-slate-700">
                  <td className="py-3 font-semibold text-slate-900">
                    {item.title}
                    <span className="block text-[11px] text-slate-400 font-normal">by {item.author}</span>
                  </td>
                  <td className="py-3 text-center">{item.rentalDays} Days</td>
                  <td className="py-3 text-right font-medium">₹{item.rentalPrice}</td>
                  <td className="py-3 text-right text-slate-500">₹{item.securityDeposit}</td>
                  <td className="py-3 text-right font-bold text-slate-900">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="border-t border-slate-200 pt-4 mb-6 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Rental Subtotal:</span>
            <span className="font-semibold text-slate-800">₹{invoice.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Refundable Security Deposit:</span>
            <span className="font-semibold text-emerald-600">₹{invoice.securityDepositTotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST / Taxes:</span>
            <span className="font-semibold text-slate-800">₹0 (Included)</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
            <span>Grand Total Paid:</span>
            <span className="text-blue-600">₹{invoice.grandTotal}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mb-6 leading-relaxed">
          Security deposits are 100% refundable upon returning the books in original condition. Thank you for choosing Rentify!
        </p>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
