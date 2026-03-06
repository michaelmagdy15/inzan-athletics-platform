import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useData } from "../context/DataContext";

export default function PaymentResult() {
    const { status } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshData } = useData();

    useEffect(() => {
        if (status === "success") {
            // In a real scenario we might verify the session_id with the backend, 
            // but the webhook handles the actual fulfillment.
            // We just refresh the data to get the new membership/package.
            refreshData();
        }
    }, [status, refreshData]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
            {status === "success" ? (
                <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-heading uppercase tracking-widest text-[#FFB800] mb-2">
                            Payment Successful
                        </h1>
                        <p className="text-white/60 text-sm">
                            Your transaction was completed. Your account has been instantly updated to reflect your new purchase.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-transform"
                    >
                        Enter Facility
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <XCircle size={48} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-heading uppercase tracking-widest text-red-500 mb-2">
                            Payment Canceled
                        </h1>
                        <p className="text-white/60 text-sm">
                            Your transaction was not completed. No charges were made to your account.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:bg-white/10 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            )}
        </div>
    );
}
