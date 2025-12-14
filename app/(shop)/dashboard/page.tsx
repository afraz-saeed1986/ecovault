// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Package, Settings, ArrowLeft } from "lucide-react";
import type { AvatarProps } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";

// Import Supabase client
// import { supabase } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/hooks/useProfile";

// --------------------------------------------------------------------------------
// --- Helper Functions for Avatar Logic ---
// --------------------------------------------------------------------------------

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "??";
  const parts = name.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts.length > 0 ? parts[0][0].toUpperCase() : "??";
};

const AvatarWithFallback: React.FC<AvatarProps> = ({
  image,
  name,
  size,
  scale,
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

// --------------------------------------------------------------------------------
// --- Animated Card Component ---
// --------------------------------------------------------------------------------

interface AnimatedCardProps {
  children: React.ReactNode;
  className: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className }) => {
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
// --- Main Dashboard Component ---
// --------------------------------------------------------------------------------

export default function Dashboard() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();

  // فقط برای چک لاگین بودن (کافی است profile وجود داشته باشه یا نه)
  useEffect(() => {
    if (!profileLoading && !profile) {
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`
      );
    }
  }, [profile, profileLoading, router]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) return null;

  const size = "w-24 h-24 sm:w-32 sm:h-32";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-eco-dark-lighter">
      {/* Hero Section */}
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
                Welcome back, {profile.name.split(" ")[0]}!
              </h1>
              <p className="text-eco-light mt-1 text-sm sm:text-base">
                Manage your eco-friendly journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Card */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-eco-green/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-eco-green" />
              </div>
              <span className="text-2xl font-bold text-eco-dark dark:text-eco-light">
                0
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg">
              Total Orders
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Start shopping to see orders
            </p>
          </AnimatedCard>

          {/* Products Card */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">10+</span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg">
              Eco Products
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Available in store
            </p>
          </AnimatedCard>

          {/* Settings Card */}
          <AnimatedCard className="bg-white dark:bg-eco-dark-medium rounded-xl shadow-lg p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
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

        <div className="mt-20 text-center">
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

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ShoppingBag, Package, Settings, ArrowLeft } from "lucide-react";
// import type { AvatarProps } from "@/types";
// import Link from "next/link";
// import { motion } from "framer-motion";

// // Import Supabase client
// import { supabase } from "@/lib/supabase/client";
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
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const { profile } = useProfile();

//   useEffect(() => {
//     const checkUser = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) {
//         router.push(
//           `/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`
//         );
//         return;
//       }

//       setUser(session.user);
//       setLoading(false);
//     };

//     checkUser();

//     // Listen to auth changes (مثلاً وقتی از OAuth برگشتی)
//     const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
//       if (!session) {
//         router.push(
//           `/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`
//         );
//       } else {
//         setUser(session.user);
//         setLoading(false);
//       }
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   const size = "w-24 h-24 sm:w-32 sm:h-32";

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-eco-dark-lighter">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-eco-green to-eco-dark text-white dark:text-eco-light">
//         <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
//           <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
//             <AvatarWithFallback
//               image={profile?.avatar_url || "/images/default-avatar.png"}
//               name={user.user_metadata?.full_name || user.email}
//               size={size}
//               scale="small"
//             />

//             <div className="text-center sm:text-left">
//               <h1 className="text-2xl sm:text-3xl font-bold">
//                 Welcome back,{" "}
//                 {user.user_metadata?.full_name?.split(" ")[0] ||
//                   user.email?.split("@")[0]}
//                 !
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
