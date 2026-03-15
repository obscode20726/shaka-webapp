import Image from "next/image";
import React from "react";

type Card = {
  title: string;
  desc: string;
  imageSrc: string;
  imageAlt: string;
  iconSrc: string;
};

const cards: Card[] = [
  {
    title: "Removal Service",
    desc: "Professional movers for home and office relocations",
    imageSrc: "/images/Electrical.png",
    imageAlt: "Removal service van loading household items",
    iconSrc: "/icons/electricity icon.svg",
  },
  {
    title: "Plumbing",
    desc: "Expert plumbers for leaks, installations, and maintenance",
    imageSrc: "/images/Plumbing.png",
    imageAlt: "Plumber working on pipes under a sink",
    iconSrc: "/icons/plumbing icon.svg",
  },
  {
    title: "Gardening",
    desc: "Professional gardeners for landscaping and maintenance",
    imageSrc: "/images/Gardening.png",
    imageAlt: "Gardener trimming plants in a backyard",
    iconSrc: "/icons/gardening icon.svg",
  },
  {
    title: "Cleaning",
    desc: "Trusted cleaners for homes and commercial spaces",
    imageSrc: "/images/Cleaning.png",
    imageAlt: "Cleaner wiping a kitchen counter",
    iconSrc: "/icons/cleaning icon.svg",
  },
];

export default function Services() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-[22px] sm:text-[26px] font-semibold text-black">
          Services We Offer
        </h2>
        <p className="text-center text-sm text-black/60 mt-1">
          Whatever your home needs, we have skilled professionals ready to help
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <article
              key={c.title}
              className="overflow-hidden rounded-2xl border border-black/[.06] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              <div className="rounded-t-2xl bg-white p-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/[.04]  rounded-2xl">
                <Image
                  src={c.imageSrc}
                  alt={c.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              </div>

              <div className="p-4">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff3e6]">
                  <Image
                    src={c.iconSrc}
                    alt=""
                    width={18}
                    height={18}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-[15px] font-semibold text-black">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm text-black/60">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
