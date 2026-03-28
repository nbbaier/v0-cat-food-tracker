"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
		</svg>
	);
}
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

const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(1, {
		message: "Password is required.",
	}),
});

export type SignInFormValues = z.infer<typeof formSchema>;

export type SignInFormProps = {
	onSubmit: (values: SignInFormValues) => void;
	onGitHubSignIn?: () => void;
	isPending?: boolean;
	errorMessage?: string | null;
	redirectUrl?: string | null;
};

export function SignInForm({
	onSubmit,
	onGitHubSignIn,
	isPending,
	errorMessage,
	redirectUrl,
}: SignInFormProps) {
	const form = useForm<SignInFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Sign in</CardTitle>
				<CardDescription>Sign in to your account to continue</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
									<Input
										{...field}
										id="sign-in-email"
										type="email"
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
							name="password"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
									<Input
										{...field}
										id="sign-in-password"
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
				{errorMessage && (
					<div
						role="alert"
						className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
					>
						{errorMessage}
					</div>
				)}
				<Button
					type="submit"
					form="sign-in-form"
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
							<GithubIcon className="mr-2 h-4 w-4" />
							Continue with GitHub
						</Button>
					</>
				)}
			</CardContent>
			<CardFooter className="flex justify-center">
				<span className="text-sm text-muted-foreground">
					Don't have an account?{" "}
					<a
						href={
							redirectUrl
								? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
								: "/sign-up"
						}
						className="text-primary underline hover:opacity-80"
					>
						Sign up
					</a>
				</span>
			</CardFooter>
		</Card>
	);
}
