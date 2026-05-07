'use client';

import Link from "next/link";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import {signInWithEmail} from "@/lib/actions/auth.actions";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

const SignIn = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if(result.success) {
                toast.success('Signed in successfully');
                router.push('/');
                router.refresh();
            } else {
                toast.error('Sign in failed', {
                    description: result.error || 'Invalid email or password.'
                })
            }
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: 'Something went wrong. Please try again.'
            })
        }
    }

    return (
        <>
            <Link href="/" className="mb-10 inline-block">
                <svg width="101" height="37" viewBox="0 0 101 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="16" width="10" height="18" rx="2" fill="#00E6A8"></rect>
                    <rect x="20" y="10" width="10" height="24" rx="2" fill="#F2C94C"></rect>
                    <rect x="32" y="14" width="10" height="20" rx="2" fill="#FF5A5F"></rect>
                    <text x="48" y="28" fill="white" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700" letterSpacing="-0.5">
                        Inertia
                    </text>
                </svg>
            </Link>
            <h1 className="form-title">Welcome Back</h1>
            <p className="text-gray-500 mb-8 -mt-8">Log in to your Inertia account to continue</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="contact@Inertia.com"
                    register={register}
                    error={errors.email}
                    validation={{ 
                        required: 'Email is required', 
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address'
                        }
                    }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required' }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Signing In...' : 'Log In'}
                </Button>

                <FooterLink text="Don't have an account?" linkText="Sign up" href="/sign-up" />
            </form>
        </>
    )
}
export default SignIn;
