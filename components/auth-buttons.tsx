import { Button } from "@/components/ui/button";

export default function AuthButtons() {
	return (
		<div className="flex gap-2">
			<a href="/sign-in">
				<Button variant="default" size="lg">
					Sign in
				</Button>
			</a>
			<a href="/sign-up">
				<Button variant="secondary" size="lg">
					Sign up
				</Button>
			</a>
		</div>
	);
}
