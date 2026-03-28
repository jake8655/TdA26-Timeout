"use client";

import { useMutation } from "@tanstack/react-query";
import { Info, Loader2, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { client } from "@/api-client/client.gen";

import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const ACCEPTED_ATTACHMENT_TYPES = [
	".pdf",
	".docx",
	".txt",
	".png",
	".jpg",
	".jpeg",
	".gif",
	".mp4",
	".mp3",
].join(",");

export default function SupportMessageWidget() {
	const [open, setOpen] = useState(false);
	const [subject, setSubject] = useState("");
	const [pageUrl, setPageUrl] = useState("");
	const [stepsToReproduce, setStepsToReproduce] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setPageUrl(window.location.href);
	}, []);

	const submitMutation = useMutation({
		mutationFn: async () => {
			const formData = new FormData();
			formData.append("subject", subject);
			formData.append("pageUrl", pageUrl);
			formData.append("stepsToReproduce", stepsToReproduce);
			for (const attachment of attachments) {
				formData.append("attachments", attachment);
			}

			await client.post({
				url: "/support-messages",
				body: formData,
				throwOnError: true,
			});
		},
		onSuccess: () => {
			toast.success("Support message sent");
			setSubject("");
			setStepsToReproduce("");
			setAttachments([]);
			if (typeof window !== "undefined") {
				setPageUrl(window.location.href);
			}
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to send support message");
		},
	});

	return (
		<div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (nextOpen && typeof window !== "undefined") {
						setPageUrl(window.location.href);
					}
					setOpen(nextOpen);
				}}
			>
				<DialogTrigger
					render={
						<Button
							size="icon-lg"
							className="h-11 w-11 rounded-full border border-white/20 bg-black/70 shadow-lg backdrop-blur hover:bg-black"
						>
							<Info className="size-5" />
						</Button>
					}
				/>
				<DialogContent className="sm:max-w-xl">
					<DialogHeader>
						<DialogTitle>Send support message</DialogTitle>
						<DialogDescription>
							This is one-way. Share enough detail so global admin can investigate quickly.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (!subject.trim() || !pageUrl.trim() || !stepsToReproduce.trim()) {
								toast.error("Please fill subject, page URL, and steps to reproduce");
								return;
							}
							submitMutation.mutate();
						}}
						className="space-y-4"
					>
						<Field>
							<FieldLabel htmlFor="support-subject">Subject</FieldLabel>
							<Input
								id="support-subject"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								placeholder="What went wrong?"
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="support-page-url">Page URL</FieldLabel>
							<Input
								id="support-page-url"
								value={pageUrl}
								onChange={(e) => setPageUrl(e.target.value)}
								placeholder="https://..."
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="support-steps">Steps to reproduce</FieldLabel>
							<Textarea
								id="support-steps"
								value={stepsToReproduce}
								onChange={(e) => setStepsToReproduce(e.target.value)}
								placeholder="1) ... 2) ... 3) ..."
								rows={5}
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="support-attachments">
								Optional screenshot(s) / attachment(s)
							</FieldLabel>
							<Input
								id="support-attachments"
								type="file"
								multiple
								accept={ACCEPTED_ATTACHMENT_TYPES}
								onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
							/>
							<FieldDescription>
								{attachments.length > 0
									? `${attachments.length} file${attachments.length === 1 ? "" : "s"} selected`
									: "Attach screenshots, recordings, or docs (optional)."}
							</FieldDescription>
						</Field>

						<div className="flex justify-end">
							<Button type="submit" disabled={submitMutation.isPending}>
								{submitMutation.isPending ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Sending...
									</>
								) : (
									<>
										<Paperclip className="size-4" />
										Send message
									</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
