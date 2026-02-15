"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, setDoc, serverTimestamp, orderBy, where, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle2, XCircle, Calendar, Star, Send, Search, Filter, Mail, Phone, Instagram, Clock, Database } from "lucide-react";
import { AmbassadorApplication, AmbassadorProfile, Coupon } from "@/types";
import { seedTestData } from "@/lib/seed";

interface AmbassadorManagementTabProps {
    searchQuery: string;
}

export default function AmbassadorManagementTab({ searchQuery }: AmbassadorManagementTabProps) {
    const [applications, setApplications] = useState<AmbassadorApplication[]>([]);
    const [ambassadors, setAmbassadors] = useState<AmbassadorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"applications" | "active">("applications");
    // const [searchTerm, setSearchTerm] = useState(""); // Removed for global search

    // Scheduling State
    const [schedulingApp, setSchedulingApp] = useState<AmbassadorApplication | null>(null);
    const [interviewData, setInterviewData] = useState({
        date: "",
        link: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch applications
            const appSnap = await getDocs(query(collection(db, "ambassador_applications"), orderBy("appliedAt", "desc")));
            setApplications(appSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AmbassadorApplication)));

            // Fetch active ambassadors
            const ambSnap = await getDocs(collection(db, "ambassadors"));
            setAmbassadors(ambSnap.docs.map(doc => ({ ...doc.data() } as AmbassadorProfile)));
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (app: AmbassadorApplication) => {
        const confirmApproval = window.confirm(`Approve ${app.displayName} as a Hub Ambassador? This will automatically generate a coupon code.`);
        if (!confirmApproval) return;

        try {
            // 1. Generate unique coupon code (e.g., NAME5)
            const cleanName = app.displayName.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
            const couponCode = `${cleanName}5`;

            // 2. Create Ambassador Profile
            const ambData: AmbassadorProfile = {
                uid: app.userId,
                displayName: app.displayName,
                email: app.email,
                joinedAt: new Date(),
                totalEarnings: 0,
                referralCount: 0,
                status: "active",
                couponCode: couponCode
            };
            await setDoc(doc(db, "ambassadors", app.userId), ambData);

            // 3. Create Coupon Record
            const couponData: Coupon = {
                id: couponCode,
                code: couponCode,
                discountType: "percentage",
                discountValue: 5,
                active: true,
                ambassadorId: app.userId,
                usageCount: 0,
                createdAt: new Date()
            };
            await setDoc(doc(db, "coupons", couponCode), couponData);

            // 4. Update Application Status
            await updateDoc(doc(db, "ambassador_applications", app.id), {
                status: "approved",
                approvedAt: serverTimestamp()
            });

            // 5. Update User Role
            await updateDoc(doc(db, "users", app.userId), {
                role: "ambassador"
            });

            alert(`Handshake Successful! ${app.displayName} is now an Ambassador. Code: ${couponCode}`);
            fetchData();
        } catch (err) {
            console.error("Approval failed:", err);
            alert("Security Protocol Failed: Could not approve ambassador.");
        }
    };

    const handleReject = async (app: AmbassadorApplication) => {
        if (!window.confirm("Reject this application?")) return;
        try {
            await updateDoc(doc(db, "ambassador_applications", app.id), {
                status: "rejected"
            });
            fetchData();
        } catch (err) {
            console.error("Rejection failed:", err);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schedulingApp) return;

        try {
            await updateDoc(doc(db, "ambassador_applications", schedulingApp.id), {
                status: "scheduled",
                interviewDetails: {
                    date: interviewData.date,
                    link: interviewData.link
                }
            });
            alert(`Interview scheduled for ${schedulingApp.displayName}`);
            setSchedulingApp(null);
            setInterviewData({ date: "", link: "" });
            fetchData();
        } catch (err) {
            console.error("Scheduling failed:", err);
            alert("Protocol Failure: Could not finalize interview schedule.");
        }
    };

    const filteredApps = applications.filter(a =>
        a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAmbs = ambassadors.filter(a =>
        a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Sub Navigation */}
            <div className="flex gap-4 p-2 bg-white rounded-3xl border border-slate-50 w-fit">
                <button
                    onClick={() => setActiveSubTab("applications")}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === "applications" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"}`}
                >
                    Pending Pulse ({applications.filter(a => a.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveSubTab("active")}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === "active" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"}`}
                >
                    Elite Unit ({ambassadors.length})
                </button>
                <button
                    onClick={async () => {
                        if (window.confirm("Initialize Testing Ecosystem? This will add dummy data for validation.")) {
                            await seedTestData();
                            fetchData();
                        }
                    }}
                    className="ml-4 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-flyer-red bg-flyer-red/5 hover:bg-flyer-red/10 transition-all flex items-center gap-2"
                >
                    <Database className="w-4 h-4" />
                    Seed Ghost Protocol
                </button>
            </div>

            {/* Search Hub - Hidden (Global Search Active) */}
            <div className="hidden">
                {/* Internal search removed */}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="wait">
                    {activeSubTab === "applications" ? (
                        <motion.div
                            key="apps"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {filteredApps.length > 0 ? filteredApps.map((app) => (
                                <div key={app.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-flyer-red group-hover:text-white transition-all">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status: {app.status}</p>
                                            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">{app.displayName}</h4>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>{app.email}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-flyer-red" />
                                                    {new Date(app.appliedAt instanceof Date ? app.appliedAt : (app.appliedAt as any).toDate()).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 italic">
                                            IG: {app.socialHandles?.instagram || "N/A"}
                                        </div>
                                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 italic">
                                            TT: {app.socialHandles?.tiktok || "N/A"}
                                        </div>
                                    </div>

                                    {app.status === 'pending' || app.status === 'scheduled' ? (
                                        <div className="flex gap-2">
                                            {app.status === 'pending' && (
                                                <button
                                                    onClick={() => setSchedulingApp(app)}
                                                    className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                >
                                                    Schedule
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleApprove(app)}
                                                className="px-6 py-3 bg-flyer-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-flyer-green/20"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(app)}
                                                className="px-6 py-3 bg-red-50 text-flyer-red rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-flyer-red hover:text-white transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            )) : (
                                <div className="p-20 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-50">
                                    <Clock className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending signals found.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {filteredAmbs.length > 0 ? filteredAmbs.map((amb) => (
                                <div key={amb.uid} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-flyer-red/10 flex items-center justify-center text-flyer-red shadow-sm border border-flyer-red/10">
                                            <Star className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{amb.displayName}</h4>
                                                <span className="px-2 py-0.5 bg-flyer-red text-white text-[8px] font-black rounded uppercase tracking-tighter italic">CODE: {amb.couponCode}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>{amb.email}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-flyer-green italic">₵ {amb.totalEarnings.toFixed(2)} Earned</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">{amb.referralCount || 0}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Impacts</p>
                                        </div>
                                        <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                                            <Search className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-50">
                                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Unit is empty. Recuit some champions.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Scheduling Modal */}
            <AnimatePresence>
                {schedulingApp && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-12 rounded-[50px] shadow-2xl max-w-lg w-full space-y-8"
                        >
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Schedule Interview</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Candidate: {schedulingApp.displayName}</p>
                            </div>

                            <form onSubmit={handleSchedule} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={interviewData.date}
                                        onChange={e => setInterviewData({ ...interviewData, date: e.target.value })}
                                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 outline-none font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Meeting Link (Opt.)</label>
                                    <input
                                        type="url"
                                        placeholder="https://zoom.us/..."
                                        value={interviewData.link}
                                        onChange={e => setInterviewData({ ...interviewData, link: e.target.value })}
                                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 outline-none font-bold"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        Emit Invitation
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSchedulingApp(null)}
                                        className="px-8 py-5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
