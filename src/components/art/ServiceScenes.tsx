import Image from 'next/image';
import { Kundli } from './Kundli';

/**
 * The scenery behind each service on the services stage: the kundli
 * for Vedic astrology, a photograph for numerology and for Vastu.
 *
 * Decorative throughout (aria-hidden, empty alt); the service card carries the words.
 */

/**
 * Photographs, from Unsplash (free licence, no credit required):
 *   vastu.jpg       Tracy Tauro, unsplash.com/photos/eksjDtKDzDI — looking up
 *                   into an open courtyard, the Brahmasthan of a house.
 *   numerology.jpg  Yuteng Jiang, unsplash.com/photos/ejaiQyGs7Eo
 */
const PHOTOS: Record<string, string> = {
  grid: '/services/numerology.jpg',
  compass: '/services/vastu.jpg',
};

/**
 * One service's scene, filling the stage. `icon` is the service's icon key
 * (content/en/services.ts). A photograph covers the whole stage, darkened
 * enough for the card; a drawing sits above the card on phones and in the left half on desktop, tilted like a page
 * laid on a desk. Motion.tsx scales this element as the scene arrives.
 */
export function ServiceScene({ icon }: { icon: string }) {
  const photo = PHOTOS[icon];
  if (photo) {
    return (
      <div className="absolute inset-0">
        <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-night/30" />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[84px] lg:items-center lg:justify-start lg:pl-[clamp(40px,8vw,140px)] lg:pt-16">
      <div className="w-[min(70vw,34svh)] -rotate-3 opacity-90 lg:w-[min(46vw,72svh,560px)]">
        <Kundli size={560} />
      </div>
    </div>
  );
}
