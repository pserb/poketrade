"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteAccountDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { destroyAccount } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await destroyAccount();
			setIsOpen(false);
		} catch (error) {
			console.error("Failed to delete account:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
					<Trash2 size={16} />
					Delete Account
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] bg-card border-border">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						Delete Account
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<DialogFooter className="gap-2 sm:gap-0 mt-4">
						<Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-muted text-muted-foreground">
							Cancel
						</Button>
						<Button type="submit" variant="destructive" disabled={isSubmitting} className="bg-destructive text-destructive-foreground">
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Account
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}