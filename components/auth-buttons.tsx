import { Button } from "@/components/ui/button";

export default function AuthButtons() {
	return (
		<div className="flex gap-2">
			<a href="/sign-in">
				<Button variant="default" className="h-10">
					Sign in
				</Button>
			</a>
			<a href="/sign-up">
				<Button variant="secondary" className="h-10">
					Sign up
				</Button>
			</a>
		</div>
	);
}
