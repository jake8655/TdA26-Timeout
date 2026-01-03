"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Search courses...",
	className,
}: SearchInputProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.2 }}
			className={cn("relative", className)}
		>
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-11 pl-10 text-sm focus-visible:border-primary focus-visible:ring-primary/20"
			/>
		</motion.div>
	);
}
