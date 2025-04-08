"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2, Trash2 } from "lucide-react";

export interface TestModel {
	id: number;
	title: string;
	description: string;
}

interface TestModelItemProps {
	item: TestModel;
	onDelete: (id: number) => Promise<void>;
}

export default function TestModelItem({ item, onDelete }: TestModelItemProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		await onDelete(item.id);
		setIsDeleting(false);
	};

	return (
		<div className="flex flex-col sm:flex-row justify-between items-start w-full py-4 group">
			<div className="flex flex-col space-y-1">
				<h3 className="font-medium text-xl text-accent">{item.title}</h3>
				<p className="text-foreground">{item.description}</p>
			</div>
			<Button 
				onClick={handleDelete} 
				disabled={isDeleting} 
				variant="ghost" 
				size="sm" 
				className="mt-2 sm:mt-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
			>
				{isDeleting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Deleting...
					</>
				) : (
					<>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</>
				)}
			</Button>
		</div>
	);
}