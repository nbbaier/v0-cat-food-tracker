import { LogOut as SignOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function initials(input: string) {
	return input
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);
}
export type UserDropdownProps = {
	onSignOut: () => void;
	user: {
		name: string;
		image?: string | null;
		email: string;
	};
};

export default function UserDropdown({ onSignOut, user }: UserDropdownProps) {
	return (
		<div className="flex items-center gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon" className="rounded-md">
						<Avatar className="size-full rounded-md">
							<AvatarImage src={user.image ?? undefined} alt="User" />
							<AvatarFallback className="rounded-md">
								{initials(user.name)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">{user.name}</p>
							<p className="text-xs leading-none text-muted-foreground">
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
						<SignOutIcon className="mr-2 h-4 w-4" />
						<span>Sign out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
