'use client'
import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({images, name}: ProductGalleryProps) {
    const [selected, setSelected] = useState(0);

    return (
        <div className="space-y-4">
            <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
                <Image 
                 src={images[selected]}
                 alt= {`${name} - image ${selected +1}`}
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>

            <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected === i ? "border-eco-green" : "border-gray-200"
                    }`}
                >
                    <Image
                    src={img}
                    alt={`${name} - thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    />
                </button>
                ))}
            </div>
        </div>
    )
}