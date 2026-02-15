"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Timestamp } from "firebase/firestore";

function formatDate(date: Timestamp | Date | unknown) {
    if (!date) return "";
    if ((date as { seconds: number }).seconds) return new Date((date as { seconds: number }).seconds * 1000).toLocaleDateString();
    return new Date(date as Date | string | number).toLocaleDateString();
}

function truncateRef(ref: string) {
    if (!ref) return "";
    return ref.length > 8 ? ref.slice(0, 8) + "..." : ref;
}

interface OrdersTabProps {
    orders: Order[];
    searchQuery: string;
}

export default function OrdersTab({ orders: initialOrders, searchQuery }: OrdersTabProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.userName && order.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.total.toString().includes(searchQuery)
    );

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "processing": return "bg-blue-50 text-blue-600 border-blue-100";
            case "ready_for_pickup": return "bg-purple-50 text-purple-600 border-purple-100";
            case "cancelled": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-amber-50 text-amber-600 border-amber-100";
        }
    };

    return (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-6">Order ID</th>
                            <th className="px-8 py-6">Citizen</th>
                            <th className="px-8 py-6">Items</th>
                            <th className="px-8 py-6">Value</th>
                            <th className="px-8 py-6">Payment</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6 text-right">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6 font-mono text-xs font-bold text-slate-500">
                                    #{order.id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-slate-900 text-sm">{order.userName || "Guest"}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </td>
                                <td className="px-8 py-6 font-bold text-slate-600 text-sm">
                                    {order.items?.length || 0} items
                                </td>
                                <td className="px-8 py-6 font-black text-slate-900">
                                    ₵ {order.total.toFixed(2)}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-emerald-600' :
                                            order.paymentStatus === 'failed' ? 'text-red-500' : 'text-amber-500'
                                            }`}>
                                            {order.paymentStatus}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-400">{truncateRef(order.paymentReference || "")}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="relative group/menu inline-block">
                                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors flex items-center gap-2">
                                            Update Status
                                        </button>

                                        {/* Dropdown */}
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all z-10">
                                            <button onClick={() => handleStatusUpdate(order.id, "pending")} className="w-full text-left px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-xl flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Pending
                                            </button>
                                            <button onClick={() => handleStatusUpdate(order.id, "processing")} className="w-full text-left px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2">
                                                <Package className="w-4 h-4" /> Processing
                                            </button>
                                            <button onClick={() => handleStatusUpdate(order.id, "ready_for_pickup")} className="w-full text-left px-3 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-xl flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Ready for Pickup
                                            </button>
                                            <button onClick={() => handleStatusUpdate(order.id, "delivered")} className="w-full text-left px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Delivered/Completed
                                            </button>
                                            <button onClick={() => handleStatusUpdate(order.id, "cancelled")} className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2">
                                                <Truck className="w-4 h-4" /> Cancelled
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
