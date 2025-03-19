// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { useTheme } from "next-themes";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useToast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { FiArrowLeft } from "react-icons/fi";
// import { AuthBackground } from "@/components/auth/AuthBackground";
// import { gsap } from "gsap";
// import { useAuth } from "@/lib/contexts/auth-context";

// // Define the form schema with validation
// const formSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(1, "Password is required"),
//   rememberMe: z.boolean().optional(),
// });

// type FormValues = z.infer<typeof formSchema>;

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { toast } = useToast();
//   const { theme } = useTheme();
//   const [isPageLoaded, setIsPageLoaded] = useState(false);
//   const formRef = useRef<HTMLFormElement>(null);
//   const cardRef = useRef<HTMLDivElement>(null);

//   // Get auth actions from context
//   const { signIn, isLoading } = useAuth();

//   // Initialize the form
//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//       rememberMe: false,
//     },
//   });

//   // Set page loaded state and check for redirects
//   useEffect(() => {
//     setIsPageLoaded(true);

//     // Check if there's an error or success message in the URL
//     const error = searchParams.get("error");
//     const success = searchParams.get("success");

//     if (error) {
//       toast({
//         title: "Error",
//         description: decodeURIComponent(error),
//         variant: "destructive",
//       });
//     }

//     if (success) {
//       toast({
//         title: "Success",
//         description: decodeURIComponent(success),
//       });
//     }
//   }, [searchParams, toast]);

//   // Initial entrance animation - only run after page is loaded
//   useEffect(() => {
//     if (!isPageLoaded) return;

//     const tl = gsap.timeline();

//     // Ensure elements are hidden initially
//     gsap.set([cardRef.current, formRef.current], {
//       opacity: 0,
//       y: 20,
//     });

//     tl.to(cardRef.current, {
//       y: 0,
//       opacity: 1,
//       duration: 0.8,
//       ease: "power3.out",
//     });

//     tl.to(
//       formRef.current,
//       {
//         y: 0,
//         opacity: 1,
//         duration: 0.5,
//         ease: "power2.out",
//       },
//       "-=0.4"
//     );
//   }, [isPageLoaded]);

//   // Handle form submission
//   const onSubmit = async (values: FormValues) => {
//     try {
//       // Fade out the form
//       await gsap.to(formRef.current, {
//         opacity: 0.5,
//         scale: 0.98,
//         duration: 0.3,
//         ease: "power2.inOut",
//       });

//       await signIn(values.email, values.password);

//       // Get redirect URL from session storage or default to dashboard
//       const redirectUrl =
//         sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
//       sessionStorage.removeItem("redirectAfterLogin");

//       router.push(redirectUrl);
//     } catch (error) {
//       console.error("Login error:", error);

//       // Reset the form animation if there's an error
//       gsap.to(formRef.current, {
//         opacity: 1,
//         scale: 1,
//         duration: 0.3,
//         ease: "power2.out",
//       });

//       toast({
//         title: "Login Failed",
//         description:
//           error instanceof Error ? error.message : "Invalid credentials",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex">
//       {/* Left side - pattern */}
//       <div className="hidden lg:block w-1/2 relative">
//         <AuthBackground />
//       </div>

//       {/* Right side - login form */}
//       <div
//         className="w-full lg:w-1/2 bg-white dark:bg-slate-900 flex flex-col"
//         ref={cardRef}
//       >
//         {/* Back to website link */}
//         <Link
//           href="/"
//           className="absolute top-8 left-8 text-sm text-slate-500 hover:text-slate-600 flex items-center gap-2 transition-colors dark:text-slate-400 dark:hover:text-slate-300"
//         >
//           <FiArrowLeft className="h-4 w-4" />
//           Back to website
//         </Link>

//         {/* Logo - positioned in top right */}
//         <div className="absolute top-8 right-8">
//           <div className="relative h-8 w-8">
//             <Image
//               src={
//                 theme === "dark"
//                   ? "/assets/brand/logo-light.png"
//                   : "/assets/brand/logo-dark.png"
//               }
//               alt="ShelfWise Logo"
//               fill
//               className="object-contain"
//               priority
//             />
//           </div>
//         </div>

//         {/* Form content - centered vertically and horizontally */}
//         <div className="flex-1 flex items-center justify-center">
//           <div className="w-full max-w-[440px] px-8">
//             <div className="space-y-2 mb-8">
//               <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
//                 Welcome back
//               </h1>
//               <div className="flex gap-1 text-base text-slate-600 dark:text-slate-400">
//                 <span>Sign in to your account</span>
//               </div>
//             </div>

//             <form
//               ref={formRef}
//               onSubmit={form.handleSubmit(onSubmit)}
//               className="space-y-5"
//             >
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="email"
//                   className="text-sm font-medium text-slate-700 dark:text-slate-300"
//                 >
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="your.email@example.com"
//                   {...form.register("email")}
//                   className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
//                 />
//                 {form.formState.errors.email && (
//                   <p className="text-red-500 text-sm">
//                     {form.formState.errors.email.message}
//                   </p>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label
//                     htmlFor="password"
//                     className="text-sm font-medium text-slate-700 dark:text-slate-300"
//                   >
//                     Password
//                   </Label>
//                   <Link
//                     href="/forgot-password"
//                     className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   {...form.register("password")}
//                   className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
//                 />
//                 {form.formState.errors.password && (
//                   <p className="text-red-500 text-sm">
//                     {form.formState.errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   id="rememberMe"
//                   type="checkbox"
//                   className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                   {...form.register("rememberMe")}
//                 />
//                 <Label
//                   htmlFor="rememberMe"
//                   className="text-sm text-slate-600 dark:text-slate-400"
//                 >
//                   Remember me
//                 </Label>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-11 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg font-medium shadow-xs"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
//                     Signing in...
//                   </div>
//                 ) : (
//                   "Sign in"
//                 )}
//               </Button>
//             </form>

//             <div className="text-center mt-8">
//               <p className="text-sm text-slate-600 dark:text-slate-400">
//                 Don&apos;t have an account?{" "}
//                 <Link
//                   href="/signup"
//                   className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
//                 >
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FiArrowLeft } from "react-icons/fi";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { gsap } from "gsap";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Define the form schema with validation
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// This internal component handles the actual login form
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get auth actions from context
  const { signIn, isLoading } = useAuth();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Set page loaded state and check for redirects
  useEffect(() => {
    setIsPageLoaded(true);

    // Check if there's an error or success message in the URL
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      toast({
        title: "Error",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
    }

    if (success) {
      toast({
        title: "Success",
        description: decodeURIComponent(success),
      });
    }
  }, [searchParams, toast]);

  // Initial entrance animation - only run after page is loaded
  useEffect(() => {
    if (!isPageLoaded) return;

    const tl = gsap.timeline();

    // Ensure elements are hidden initially
    gsap.set([cardRef.current, formRef.current], {
      opacity: 0,
      y: 20,
    });

    tl.to(cardRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
    });

    tl.to(
      formRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.4"
    );
  }, [isPageLoaded]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Fade out the form
      await gsap.to(formRef.current, {
        opacity: 0.5,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.inOut",
      });

      await signIn(values.email, values.password);

      // Get redirect URL from session storage or default to dashboard
      const redirectUrl =
        sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      sessionStorage.removeItem("redirectAfterLogin");

      router.push(redirectUrl);
    } catch (error) {
      console.error("Login error:", error);

      // Reset the form animation if there's an error
      gsap.to(formRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      toast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Left side - pattern */}
      <div className="hidden lg:block w-1/2 relative">
        <AuthBackground />
      </div>

      {/* Right side - login form */}
      <div
        className="w-full lg:w-1/2 bg-white dark:bg-slate-900 flex flex-col"
        ref={cardRef}
      >
        {/* Back to website link */}
        <Link
          href="/"
          className="absolute top-8 left-8 text-sm text-slate-500 hover:text-slate-600 flex items-center gap-2 transition-colors dark:text-slate-400 dark:hover:text-slate-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to website
        </Link>

        {/* Logo - positioned in top right */}
        <div className="absolute top-8 right-8">
          <div className="relative h-8 w-8">
            <Image
              src={
                theme === "dark"
                  ? "/assets/brand/logo-light.png"
                  : "/assets/brand/logo-dark.png"
              }
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Form content - centered vertically and horizontally */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[440px] px-8">
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Welcome back
              </h1>
              <div className="flex gap-1 text-base text-slate-600 dark:text-slate-400">
                <span>Sign in to your account</span>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.register("email")}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  {...form.register("rememberMe")}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg font-medium shadow-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with AuthGuard
export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <LoginForm />
    </AuthGuard>
  );
}