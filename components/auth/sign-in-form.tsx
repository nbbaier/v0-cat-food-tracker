"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Loader2 } from "lucide-react";
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
							<Github className="mr-2 h-4 w-4" />
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
