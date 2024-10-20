import Image from 'next/image';
import Link from 'next/link';
import { IconBrandGithub } from '@tabler/icons-react';
import RetroGrid from '@/components/ui/retro-grid';
import ShinyButton from '@/components/ui/shiny-button';
import { RainbowButton } from '@/components/ui/rainbow-button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
        <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent">
          Trade on Twitter
        </span>

        <div className="z-10 mt-8 flex gap-4">
          <Link href="/airdao" passHref legacyBehavior>
          <RainbowButton className="block w-full h-full px-8">Create Links</RainbowButton>
          </Link>
          
        </div>
        <RetroGrid />
      </div>
    </main>
  );
}
