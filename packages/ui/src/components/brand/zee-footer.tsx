export default function ZeeFooter() {
  return (
    <footer className="w-full py-5 text-center text-xs text-muted">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4">
        <span>
          Part of the{" "}
          <a
            href="https://wzee.dev"
            className="font-medium text-foreground hover:underline transition-colors"
          >
            wzee.dev
          </a>{" "}
          suite
        </span>
        <span className="hidden sm:inline text-border-strong">·</span>
        <a
          href="https://wzee.dev/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground hover:underline transition-colors"
        >
          Privacy & GDPR Notice
        </a>
      </div>
    </footer>
  );
}
