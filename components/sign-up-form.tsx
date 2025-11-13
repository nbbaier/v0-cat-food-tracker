"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z
	.object({
		firstName: z.string().min(1, { message: "First name is required." }),
		lastName: z.string().min(1, { message: "Last name is required." }),
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		password: z
			.string()
			.min(6, {
				message: "Password must be at least 6 characters.",
			})
			.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
			.regex(/[0-9]/, { message: "Contain at least one number." })
			.regex(/[^a-zA-Z0-9]/, {
				message: "Contain at least one special character.",
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ["confirmPassword"],
	});

export type SignUpFormValues = z.infer<typeof formSchema>;

export type SignUpFormProps = {
	onSubmit: (values: SignUpFormValues) => void;
	onGitHubSignIn?: () => void;
	isPending?: boolean;
	errorMessage?: string | null;
	redirectUrl?: string | null;
};

export function SignUpForm({
	onSubmit,
	onGitHubSignIn,
	isPending,
	redirectUrl,
	errorMessage,
}: SignUpFormProps) {
	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const isEmailNotAllowedError =
		errorMessage?.toLowerCase().includes("not allowed") ||
		errorMessage?.toLowerCase().includes("email is not allowed");

	useEffect(() => {
		if (isEmailNotAllowedError) {
			form.setError("email", {
				type: "server",
				message: errorMessage ?? "This email is not allowed to sign up.",
			});
		} else if (errorMessage) {
			form.setError("root", {
				type: "server",
				message: errorMessage,
			});
		} else {
			form.clearErrors("email");
			form.clearErrors("root");
		}
	}, [errorMessage, isEmailNotAllowedError, form]);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Sign up</CardTitle>
				<CardDescription>Create a new account to get started</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<form id="sign-up-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<div className="flex gap-4">
							<Controller
								name="firstName"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid} className="flex-1">
										<FieldLabel htmlFor="sign-up-firstName">
											First name
										</FieldLabel>
										<Input
											{...field}
											id="sign-up-firstName"
											type="text"
											aria-invalid={fieldState.invalid}
											disabled={isPending}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="lastName"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid} className="flex-1">
										<FieldLabel htmlFor="sign-up-lastName">
											Last name
										</FieldLabel>
										<Input
											{...field}
											id="sign-up-lastName"
											type="text"
											aria-invalid={fieldState.invalid}
											disabled={isPending}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid || isEmailNotAllowedError}
								>
									<FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
									<Input
										{...field}
										id="sign-up-email"
										type="email"
										aria-invalid={fieldState.invalid || isEmailNotAllowedError}
										disabled={isPending}
									/>
									{(fieldState.invalid || isEmailNotAllowedError) && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Controller
							name="password"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
									<Input
										{...field}
										id="sign-up-password"
										type="password"
										aria-invalid={fieldState.invalid}
										disabled={isPending}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Controller
							name="confirmPassword"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="sign-up-confirmPassword">
										Confirm password
									</FieldLabel>
									<Input
										{...field}
										id="sign-up-confirmPassword"
										type="password"
										aria-invalid={fieldState.invalid}
										disabled={isPending}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
				{errorMessage && !isEmailNotAllowedError && (
					<div
						role="alert"
						className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
					>
						{errorMessage}
					</div>
				)}
				<Button
					type="submit"
					form="sign-up-form"
					className="w-full"
					disabled={isPending}
				>
					{isPending ? <Loader2 className="animate-spin" /> : "Continue"}
				</Button>
				{onGitHubSignIn && (
					<>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">or</span>
							</div>
						</div>
						<Button
							variant="outline"
							className="w-full"
							onClick={onGitHubSignIn}
							disabled={isPending}
						>
							<Github className="mr-2 h-4 w-4" />
							Continue with GitHub
						</Button>
					</>
				)}
			</CardContent>
			<CardFooter className="flex justify-center">
				<span className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<a
						href={
							redirectUrl
								? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
								: "/sign-in"
						}
						className="text-primary underline hover:opacity-80"
					>
						Sign in
					</a>
				</span>
			</CardFooter>
		</Card>
	);
}
