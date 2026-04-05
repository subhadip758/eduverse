import React, { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Clock, ShieldCheck, Lock } from "lucide-react";

export function Fees() {
  const { fees, updateFeeStatus } = useDatabase();
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === "admin";
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [checkoutFeeId, setCheckoutFeeId] = useState<string | null>(null);
  const [mockFeePaid, setMockFeePaid] = useState(false);

  // CC Form State
  const [ccName, setCcName] = useState("");
  const [ccNumber, setCcNumber] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvc, setCcCvc] = useState("");

  const displayFees = isAdmin 
    ? fees 
    : fees.filter(f => f.studentName === profile?.displayName || f.studentId === profile?.uid);

  // Auto-mock a fee if student has none so they can test it!
  if (!isAdmin && displayFees.length === 0 && profile) {
    displayFees.push({
      id: "MOCK-FEE",
      studentId: profile.uid,
      studentName: profile.displayName,
      type: "Semester Tuition Mock",
      amount: 2500,
      dueDate: new Date().toISOString().split('T')[0],
      status: mockFeePaid ? "Completed" : "Pending",
      date: new Date().toISOString().split('T')[0]
    });
  }

  const totalPending = displayFees.filter(f => f.status !== 'Completed').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = displayFees.filter(f => f.status === 'Completed').reduce((sum, f) => sum + f.amount, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutFeeId) return;

    setProcessingId(checkoutFeeId);
    // Simulate real authorization delay
    setTimeout(async () => {
      try {
        if (checkoutFeeId === "MOCK-FEE") {
           setMockFeePaid(true);
        } else {
           await updateFeeStatus(checkoutFeeId, "Completed");
        }
        setProcessingId(null);
        setCheckoutFeeId(null);
        alert("Transaction Authorized! Official Receipt recorded in Firestore.");
      } catch(err) {
          console.error(err);
          setProcessingId(null);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Fee Management</h2>
          <p className="text-zinc-500 text-sm">
            {isAdmin ? "Monitor total revenue and pending student balances" : "Review and pay your outstanding academic fees securely"}
          </p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
          <Wallet className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <ArrowDownRight className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg">Due</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">{isAdmin ? "Total Outstanding Balance" : "My Outstanding Balance"}</p>
          <h3 className="text-3xl font-bold text-zinc-100">${totalPending.toFixed(2)}</h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <ArrowUpRight className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">Collected</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">{isAdmin ? "Total Revenue Collected" : "My Total Paid"}</p>
          <h3 className="text-3xl font-bold text-zinc-100">${totalPaid.toFixed(2)}</h3>
        </div>

        <div className="bg-emerald-500 rounded-3xl p-6 relative overflow-hidden hidden lg:block">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-950 mb-1">{isAdmin ? "Admin Overview" : "Fast & Secure"}</h3>
              <p className="text-zinc-900 font-medium text-sm max-w-[200px]">
                {isAdmin ? "View the master list of all transactions below." : "Pay your fees instantly using our mock payment gateway."}
              </p>
            </div>
            <CreditCard className="w-10 h-10 text-zinc-950 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-zinc-200 mb-6">{isAdmin ? "All Student Transactions" : "My Recent Invoices"}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-4 font-semibold text-zinc-400">Invoice Details</th>
                <th className="pb-4 font-semibold text-zinc-400">Date Issued</th>
                <th className="pb-4 font-semibold text-zinc-400">Amount</th>
                <th className="pb-4 font-semibold text-zinc-400">Status</th>
                {!isAdmin && <th className="pb-4 font-semibold text-zinc-400 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayFees.length === 0 ? (
                <tr><td colSpan={isAdmin ? 4 : 5} className="py-8 text-center text-zinc-500">No fee records found.</td></tr>
              ) : displayFees.map((fee) => (
                <tr key={fee.id} className="group hover:bg-zinc-800/50 transition-all">
                  <td className="py-4">
                    <div className="font-medium text-zinc-100">{fee.type}</div>
                    <div className="text-xs text-zinc-500">{isAdmin ? `${fee.studentName} (${fee.studentId})` : `#${fee.id}`}</div>
                  </td>
                  <td className="py-4 text-zinc-400 text-sm">{fee.date}</td>
                  <td className="py-4 font-medium text-zinc-100">${fee.amount.toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl ${
                      fee.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                      fee.status === 'Overdue' ? 'bg-red-500/10 text-red-500' : 
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {fee.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                       fee.status === 'Overdue' ? <AlertCircle className="w-3.5 h-3.5" /> : 
                       <Clock className="w-3.5 h-3.5" />}
                      {fee.status}
                    </span>
                  </td>
                  {!isAdmin && (
                    <td className="py-4 text-right">
                      {fee.status !== 'Completed' && (
                        <button
                          onClick={() => setCheckoutFeeId(fee.id)}
                          className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {checkoutFeeId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl shadow-emerald-500/10">
            <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Secure Checkout</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1"><Lock className="w-3 h-3" /> End-to-end encrypted</p>
                </div>
              </div>
              <button 
                onClick={() => setCheckoutFeeId(null)} 
                className="text-zinc-500 hover:text-white transition-colors"
                disabled={processingId !== null}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Cardholder Name</label>
                <input 
                  type="text" 
                  required 
                  value={ccName}
                  onChange={(e) => setCcName(e.target.value)}
                  placeholder="JOHN DOE"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono uppercase transition-colors" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Card Number</label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    value={ccNumber}
                    onChange={(e) => {
                      // autoformat CC number with spaces
                      const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setCcNumber(formatted);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500 font-mono transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Expiry (MM/YY)</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={5}
                    placeholder="MM/YY"
                    value={ccExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2);
                      setCcExpiry(val);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">CVC</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={4}
                    placeholder="123"
                    value={ccCvc}
                    onChange={(e) => setCcCvc(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono transition-colors" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 mt-6">
                <button 
                  type="submit" 
                  disabled={processingId !== null}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {processingId ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                      Authorizing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Pay ${displayFees.find(f => f.id === checkoutFeeId)?.amount.toFixed(2)}
                    </span>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-500 mt-4">By proceeding, you agree to EduVerse's terms of service. This is a secure mock terminal.</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
