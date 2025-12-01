"use client";

import Image from "next/image";
import { useState } from "react";

interface UserAvatarProps {
  photoURL?: string;
  displayName?: string;
  username?: string;
  size?: number;
}

export default function UserAvatar({
  photoURL,
  displayName,
  username,
  size = 40,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  if (!photoURL || photoURL.trim() === '' || imageError) {
    const initial = (displayName || username || 'U').charAt(0).toUpperCase();
    return (
      <div
        className="rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="text-purple-600 font-bold text-sm">{initial}</span>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <Image
        src={photoURL}
        alt={displayName || username || 'Usuario'}
        width={size}
        height={size}
        className="rounded-full border-2 border-purple-200 object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

