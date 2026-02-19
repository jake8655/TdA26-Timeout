export default function BackgroundGrid() {
	return (
		<div className="absolute inset-0 z-0">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
			<div className="absolute top-0 right-0 left-0 h-[500px] bg-linear-to-b from-background via-background/95 to-transparent" />
			<div className="absolute right-0 bottom-0 left-0 h-[500px] bg-linear-to-t from-background via-background/95 to-transparent" />
			<div className="absolute -top-[40%] -left-[20%] size-[800px] rounded-full bg-primary/10 opacity-40 blur-[100px]" />
			<div className="absolute -right-[20%] -bottom-[40%] size-[800px] rounded-full bg-accent/10 opacity-40 blur-[100px]" />
		</div>
	);
}
