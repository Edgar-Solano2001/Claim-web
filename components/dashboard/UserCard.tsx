interface Props {
  name: string;
  desc: string;
  img: string;
}

export default function UserCard({ name, desc, img }: Props) {
  return (
    <div className="flex gap-4 bg-white/10 p-4 rounded-xl">
      <img src={img} className="w-24 h-24 rounded-lg object-cover" />

      <div>
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-gray-300">{desc}</p>
        <button className="mt-2 border border-purple-400 px-3 py-1 rounded text-purple-300 hover:bg-purple-500 hover:text-white transition">
          Ver más
        </button>
      </div>
    </div>
  );
}
