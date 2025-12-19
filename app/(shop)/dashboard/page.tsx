
// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Settings, ArrowLeft, DollarSign, TrendingUp } from "lucide-react";
import type { AvatarProps } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Importهای Supabase
import { useProfile } from "@/lib/supabase/hooks/useProfile";
import { useUserOrders } from "@/lib/supabase/hooks/useUserOrders";

// --------------------------------------------------------------------------------
// --- کامپوننت‌های قبلی (Avatar و AnimatedCard) – بدون تغییر
// --------------------------------------------------------------------------------

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "??";
  const parts = name.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts.length > 0 ? parts[0][0].toUpperCase() : "??";
};

interface MonthlyOrderData {
  month: string;
  count: number;
  amount: number;
}

const AvatarWithFallback: React.FC<AvatarProps> = ({
  image,
  name,
  size,
  scale
}) => {
  const initials = getInitials(name);
  const sizevalue = 128;

  if (image) {
    return (
      <img
        src={image}
        alt={name || "User"}
        width={sizevalue}
        height={sizevalue}
        className={`${size} rounded-full border-4 border-white dark:border-eco-light shadow-lg flex-shrink-0 object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full border-4 border-white dark:border-eco-light shadow-lg flex-shrink-0 
                     flex items-center justify-center bg-white/30 dark:bg-eco-light/20 text-white font-bold text-2xl sm:text-3xl`}
      title={name || "User"}
    >
      {initials}
    </div>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

// --------------------------------------------------------------------------------
// --- Main Dashboard Component
// --------------------------------------------------------------------------------

export default function Dashboard() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { orders, loading: ordersLoading } = useUserOrders(profile?.id);

  // چک لاگین
  useEffect(() => {
    if (!profileLoading && !profile) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`);
    }
  }, [profile, profileLoading, router]);

  if (profileLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) return null;

  // محاسبات آماری دینامیک
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0);
  const totalSavings = orders.reduce((sum, o) => sum + (o.discount ?? 0), 0);

  // داده برای نمودارها (گروه‌بندی بر اساس ماه)
  const monthlyData = orders
    .reduce((acc: MonthlyOrderData[], order) => {
      const date = new Date(order.created_at ?? "");
      const monthKey = date.toLocaleString("en-US", { month: "short", year: "numeric" });
      const existing = acc.find((item) => item.month === monthKey);
      if (existing) {
        existing.count += 1;
        existing.amount += order.total_price ?? 0;
      } else {
        acc.push({ month: monthKey, count: 1, amount: order.total_price ?? 0 });
      }
      return acc;
    }, [])
    .reverse(); // قدیمی‌ترین اول

  const size = "w-24 h-24 sm:w-32 sm:h-32";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-eco-dark-lighter">
      {/* Hero Section – دقیقاً مثل قبل نگه داشته شده */}
      <div className="bg-gradient-to-r from-eco-green to-eco-dark text-white dark:text-eco-light">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <AvatarWithFallback
              image={profile.avatar_url || "/images/default-avatar.png"}
              name={profile.name}
              size={size}
              scale="small"
            />

            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {profile.name?.split(" ")[0]}!
              </h1>
              <p className="text-eco-light mt-1 text-sm sm:text-base">
                Manage your eco-friendly journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* بخش اصلی داشبورد */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* کارت‌های آماری دینامیک */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Orders */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-eco-green/10 rounded-lg">
                <ShoppingBag className="w-8 h-8 text-eco-green" />
              </div>
              <span className="text-3xl font-bold text-eco-dark dark:text-eco-light">
                {totalOrders}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Total Orders</h3>
          </AnimatedCard>

          {/* Total Spent */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">
                ${totalSpent.toFixed(2)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Total Spent</h3>
          </AnimatedCard>

          {/* Savings from Coupons */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                ${totalSavings.toFixed(2)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Savings from Coupons</h3>
          </AnimatedCard>

          {/* Account Settings – دقیقاً مثل قبل */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg">
              Account Settings
            </h3>
            <Link href="/profile">
              <button className="mt-3 text-sm text-purple-600 hover:underline font-medium">
                Edit Profile
              </button>
            </Link>
          </AnimatedCard>
        </div>

        {/* بخش نمودارها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Line Chart: روند سفارش‌ها و مبلغ */}
          <div className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Order Trend (Last Months)
            </h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Number of Orders"
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4ade80"
                    strokeWidth={2}
                    name="Total Amount ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </div>

          {/* Bar Chart: تعداد سفارش‌ها در هر ماه */}
          <div className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Orders per Month
            </h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* لینک بازگشت به فروشگاه */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-eco-green hover:text-eco-dark font-medium transition-colors dark:text-eco-accent dark:hover:text-eco-green"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}





// // app/dashboard/page.tsx
// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { ShoppingBag, Package, Settings, ArrowLeft } from "lucide-react";
// import type { AvatarProps } from "@/types";
// import Link from "next/link";
// import { motion } from "framer-motion";

// // Import Supabase client
// // import { supabase } from "@/lib/supabase/client";
// import { useProfile } from "@/lib/supabase/hooks/useProfile";

// // --------------------------------------------------------------------------------
// // --- Helper Functions for Avatar Logic ---
// // --------------------------------------------------------------------------------

// const getInitials = (name: string | null | undefined): string => {
//   if (!name) return "??";
//   const parts = name.split(/\s+/).filter((p) => p.length > 0);
//   if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
//   return parts.length > 0 ? parts[0][0].toUpperCase() : "??";
// };

// const AvatarWithFallback: React.FC<AvatarProps> = ({
//   image,
//   name,
//   size,
//   scale,
// }) => {
//   const initials = getInitials(name);
//   const sizevalue = 128;

//   if (image) {
//     return (
//       <img
//         src={image}
//         alt={name || "User"}
//         width={sizevalue}
//         height={sizevalue}
//         className={`${size} rounded-full border-4 border-white dark:border-eco-light shadow-lg flex-shrink-0 object-cover`}
//         referrerPolicy="no-referrer"
//       />
//     );
//   }

//   return (
//     <div
//       className={`${size} rounded-full border-4 border-white dark:border-eco-light shadow-lg flex-shrink-0 
//                      flex items-center justify-center bg-white/30 dark:bg-eco-light/20 text-white font-bold text-2xl sm:text-3xl`}
//       title={name || "User"}
//     >
//       {initials}
//     </div>
//   );
// };

// // --------------------------------------------------------------------------------
// // --- Animated Card Component ---
// // --------------------------------------------------------------------------------

// interface AnimatedCardProps {
//   children: React.ReactNode;
//   className: string;
// }

// const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className }) => {
//   return (
//     <motion.div
//       className={className}
//       whileHover={{
//         scale: 1.02,
//         boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
//       }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//     >
//       {children}
//     </motion.div>
//   );
// };

// // --------------------------------------------------------------------------------
// // --- Main Dashboard Component ---
// // --------------------------------------------------------------------------------

// export default function Dashboard() {
//   const router = useRouter();
//   const { profile, loading: profileLoading } = useProfile();

//   // فقط برای چک لاگین بودن (کافی است profile وجود داشته باشه یا نه)
//   useEffect(() => {
//     if (!profileLoading && !profile) {
//       router.push(
//         `/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`
//       );
//     }
//   }, [profile, profileLoading, router]);

//   if (profileLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
//       </div>
//     );
//   }

//   if (!profile) return null;

//   const size = "w-24 h-24 sm:w-32 sm:h-32";

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-eco-dark-lighter">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-eco-green to-eco-dark text-white dark:text-eco-light">
//         <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
//           <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
//             <AvatarWithFallback
//               image={profile.avatar_url || "/images/default-avatar.png"}
//               name={profile.name}
//               size={size}
//               scale="small"
//             />

//             <div className="text-center sm:text-left">
//               <h1 className="text-2xl sm:text-3xl font-bold">
//                 Welcome back, {profile.name.split(" ")[0]}!
//               </h1>
//               <p className="text-eco-light mt-1 text-sm sm:text-base">
//                 Manage your eco-friendly journey
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Dashboard Cards */}
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Orders Card */}
//           <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6 cursor-pointer">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-eco-green/10 rounded-lg">
//                 <ShoppingBag className="w-6 h-6 text-eco-green" />
//               </div>
//               <span className="text-2xl font-bold text-eco-dark dark:text-eco-light">
//                 0
//               </span>
//             </div>
//             <h3 className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg">
//               Total Orders
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//               Start shopping to see orders
//             </p>
//           </AnimatedCard>

//           {/* Products Card */}
//           <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6 cursor-pointer">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Package className="w-6 h-6 text-blue-600" />
//               </div>
//               <span className="text-2xl font-bold text-blue-600">10+</span>
//             </div>
//             <h3 className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg">
//               Eco Products
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//               Available in store
//             </p>
//           </AnimatedCard>

//           {/* Settings Card */}
//           <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6 cursor-pointer">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <Settings className="w-6 h-6 text-purple-600" />
//               </div>
//             </div>
//             <h3 className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg">
//               Account Settings
//             </h3>
//             <Link href="/profile">
//               <button className="mt-3 text-sm text-purple-600 hover:underline font-medium">
//                 Edit Profile
//               </button>
//             </Link>
//           </AnimatedCard>
//         </div>

//         <div className="mt-20 text-center">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 text-eco-green hover:text-eco-dark font-medium transition-colors dark:text-eco-accent dark:hover:text-eco-green"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Continue Shopping
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

