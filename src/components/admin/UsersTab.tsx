"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { MoreVertical, ShieldCheck, ShieldAlert, User } from "lucide-react";

interface UsersTabProps {
    users: UserProfile[];
    searchQuery: string;
}

export default function UsersTab({ users: initialUsers, searchQuery }: UsersTabProps) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);

    const filteredUsers = users.filter(user =>
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.phoneNumber && user.phoneNumber.includes(searchQuery))
    );

    const handleRoleUpdate = async (userId: string, newRole: "customer" | "admin") => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { role: newRole });

            // Update local state
            setUsers(users.map(user =>
                user.uid === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin": return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-flyer-red rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">
                    <ShieldAlert className="w-3 h-3" /> Admin
                </span>
            );

            default: return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    <User className="w-3 h-3" /> Customer
                </span>
            );
        }
    };

    return (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-6">Citizen Profile</th>
                            <th className="px-8 py-6">Contact Protocol</th>
                            <th className="px-8 py-6">Access Level</th>
                            <th className="px-8 py-6">Joined Date</th>
                            <th className="px-8 py-6 text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map((user) => (
                            <tr key={user.uid} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black">
                                            {user.displayName?.[0] || "U"}
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm">{user.displayName || "Unknown Citizen"}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-mono text-xs text-slate-500">
                                    {user.email}
                                </td>
                                <td className="px-8 py-6">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-8 py-6 text-xs font-bold text-slate-400">
                                    {/* Handle various date formats safely */}
                                    {new Date().toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="relative group/menu inline-block">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Hover Menu */}
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all z-10">
                                            <p className="px-3 py-2 text-[10px] uppercase font-black text-slate-300 tracking-widest">Set Access Level</p>
                                            <button onClick={() => handleRoleUpdate(user.uid, "customer")} className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl hover:text-slate-900">
                                                Customer
                                            </button>

                                            <button onClick={() => handleRoleUpdate(user.uid, "admin")} className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-red-50 rounded-xl hover:text-flyer-red">
                                                Admin
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
