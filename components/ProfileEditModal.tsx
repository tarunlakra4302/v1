'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import { CountrySelectField } from '@/components/forms/CountrySelectField';
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constants';
import { updateUserProfile } from '@/lib/actions/user.actions';
import { toast } from 'sonner';
import { User as UserIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileEditModalProps {
    user: User;
    trigger?: React.ReactNode;
}

const ProfileEditModal = ({ user, trigger }: ProfileEditModalProps) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<Partial<User>>({
        defaultValues: {
            name: user.name || '',
            image: user.image || '',
            country: user.country || 'US',
            investmentGoals: user.investmentGoals || 'Growth',
            riskTolerance: user.riskTolerance || 'Medium',
            preferredIndustry: user.preferredIndustry || 'Technology',
        },
    });

    const onSubmit = async (data: Partial<User>) => {
        try {
            const result = await updateUserProfile(user.id, data);
            
            if (result.success) {
                toast.success('Profile updated successfully');
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" className="w-full justify-start text-gray-100 hover:text-yellow-500">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0F0F0F] border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Edit Profile</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Update your personal information and investment preferences.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <InputField
                        name="name"
                        label="Full Name"
                        placeholder="John Doe"
                        register={register}
                        error={errors.name}
                        validation={{ required: 'Full name is required', minLength: 2 }}
                    />

                    <InputField
                        name="image"
                        label="Profile Picture URL"
                        placeholder="https://example.com/avatar.png"
                        register={register}
                        error={errors.image}
                    />

                    <CountrySelectField
                        name="country"
                        label="Country"
                        control={control}
                        error={errors.country as any}
                    />

                    <SelectField
                        name="investmentGoals"
                        label="Investment Goals"
                        placeholder="Select your goal"
                        options={INVESTMENT_GOALS}
                        control={control}
                        error={errors.investmentGoals as any}
                    />

                    <SelectField
                        name="riskTolerance"
                        label="Risk Tolerance"
                        placeholder="Select your risk level"
                        options={RISK_TOLERANCE_OPTIONS}
                        control={control}
                        error={errors.riskTolerance as any}
                    />

                    <SelectField
                        name="preferredIndustry"
                        label="Preferred Industry"
                        placeholder="Select your industry"
                        options={PREFERRED_INDUSTRIES}
                        control={control}
                        error={errors.preferredIndustry as any}
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditModal;
