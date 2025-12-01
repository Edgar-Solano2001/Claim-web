import Link from 'next/link';

interface Props {
  userId: string;
  name: string;
  desc: string;
  img?: string;
}

export default function UserCard({ userId, name, desc, img }: Props) {
  return (
    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">

      {/* FOTO SOLO SI EXISTE */}
      {img ? (
        <img
          src={img}
          alt={name}
          className="w-20 h-20 rounded-lg object-cover"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-white/20 flex items-center justify-center text-3xl text-white">
          {/* icono de usuario */}
          <span>👤</span>
        </div>
      )}

      <div>
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-gray-300">{desc}</p>

        <Link href={`/dashboard/users/${userId}`}>
          <button className="mt-2 border border-purple-400 px-3 py-1 rounded text-purple-300 hover:bg-purple-500 hover:text-white transition">
            Ver más
          </button>
        </Link>
      </div>
    </div>
  );
}
