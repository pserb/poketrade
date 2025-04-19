"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { UserIcon, KeyIcon, AtSign } from "lucide-react";

export default function LoginForm() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		try {
			await login(username, email, password);
		} catch (err) {
			setError(err as string);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-[400px] card-highlight bg-card">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl text-primary">Login</CardTitle>
				<CardDescription className="text-muted-foreground">Enter your credentials to access your account.</CardDescription>
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
								placeholder="Enter your username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="pl-10 bg-background border-border text-foreground"
								required
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
						<div className="relative">
							<AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
								placeholder="Enter your password"
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
						{isLoading ? "Logging in..." : "Login"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}