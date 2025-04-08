"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { UserIcon, KeyIcon } from "lucide-react";

export default function RegisterForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const { register } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		try {
			await register(username, password);
		} catch (err) {
			setError(err as string);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-[400px] card-highlight bg-card">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl text-primary">Register</CardTitle>
				<CardDescription className="text-muted-foreground">Create a new account to get started.</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
						<div className="relative">
							<UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								id="username"
								type="text"
								placeholder="Choose a username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="pl-10 bg-background border-border text-foreground"
								required
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
						<div className="relative">
							<KeyIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								id="password"
								type="password"
								placeholder="Choose a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="pl-10 bg-background border-border text-foreground"
								required
							/>
						</div>
					</div>
					{error && <p className="text-sm font-medium text-destructive">{error}</p>}
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Registering..." : "Register"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}