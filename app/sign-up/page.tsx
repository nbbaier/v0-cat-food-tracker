"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignUpForm, type SignUpFormValues } from "@/components/auth/sign-up-form";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
	const router = useRouter();
	const [isPending, setPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = (values: SignUpFormValues) => {
		setErrorMessage(null);
		authClient.signUp.email(
			{
				email: values.email,
				password: values.password,
				name: `${values.firstName} ${values.lastName}`,
			},
			{
				onRequest: () => setPending(true),
				onResponse: () => setPending(false),
				onSuccess: () => {
					router.push("/");
				},
				onError: (error) => {
					setErrorMessage(error.error.message);
				},
			},
		);
	};

	return (
		<div className="flex items-center justify-center p-4 pt-20">
			<SignUpForm
				onSubmit={handleSubmit}
				isPending={isPending}
				errorMessage={errorMessage}
			/>
		</div>
	);
}
