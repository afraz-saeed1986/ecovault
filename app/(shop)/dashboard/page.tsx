"use client";

import {useSession, signOut} from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShoppingBag, Package, Settings, LogOut } from "lucide-react";

export default function Dashboard() {
    const {data: session, status} = useSession();
    const router = useRouter();

    useEffect(() => {
        if(status === "unauthenticated"){
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`);
        }
    }, [status, router]);

    if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
      </div>
    );
  }

    if(!session) return null;

    return (
        <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-eco-green to-eco-dark text-white  dark:text-eco-light dark:bg-gradient-to-l">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <img
              src={session.user?.image || "/default-avatar.png"}
              alt={session.user?.name || "User"}
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {session.user?.name?.split(" ")[0]}!</h1>
              <p className="text-eco-light mt-1 text-sm sm:text-base">Manage your eco-friendly journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-eco-green/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-eco-green" />
              </div>
              <span className="text-2xl font-bold text-eco-dark">0</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Total Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Start shopping to see orders</p>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">10+</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Eco Products</h3>
            <p className="text-sm text-gray-500 mt-1">Available in store</p>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Account Settings</h3>
            <button className="mt-3 text-sm text-purple-600 hover:underline font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg text-sm sm:text-base"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
    )
}