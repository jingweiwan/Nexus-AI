import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function NexusLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <Image src="/nexus-logo.svg" alt="Nexus Logo" width={200} height={200} />
      <p className="text-[44px]">Nexus</p>
    </div>
  );
}
