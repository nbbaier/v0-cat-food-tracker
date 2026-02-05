"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	SignInForm,
	type SignInFormValues,
} from "@/components/auth/sign-in-form";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
	const router = useRouter();
	const [isPending, setPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = (values: SignInFormValues) => {
		setErrorMessage(null);
		authClient.signIn.email(
			{
				email: values.email,
				password: values.password,
			},
			{
				onRequest: () => setPending(true),
				onResponse: () => setPending(false),
				onSuccess: () => {
					router.push("/");
				},
				onError: (error) => {
					setErrorMessage(
						error.error?.message || "Sign in failed. Please try again.",
					);
				},
			},
		);
	};

	return (
		<div className="flex items-center justify-center p-4 pt-20">
			<SignInForm
				onSubmit={handleSubmit}
				isPending={isPending}
				errorMessage={errorMessage}
			/>
		</div>
	);
}
