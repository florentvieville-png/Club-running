import { InstagramIcon, FacebookIcon } from "@/components/icons";
import { ShareButton } from "@/components/ShareButton";

export function SocialLinks() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL;

  if (!instagram && !facebook) return <ShareButton />;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {instagram && (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          <InstagramIcon className="h-4 w-4" />
        </a>
      )}
      {facebook && (
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          <FacebookIcon className="h-4 w-4" />
        </a>
      )}
      <ShareButton />
    </div>
  );
}
