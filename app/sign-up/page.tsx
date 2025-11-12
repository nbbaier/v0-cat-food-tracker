"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignUpForm, type SignUpFormValues } from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
	const router = useRouter();
	const [isPending, setPending] = useState(false);

	const handleSubmit = (values: SignUpFormValues) => {
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
					alert(error.error.message);
				},
			},
		);
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignUpForm onSubmit={handleSubmit} isPending={isPending} />
		</div>
	);
}
