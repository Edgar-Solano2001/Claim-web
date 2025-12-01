interface Props {
  img: string;
  title: string;
  price: string;
  status?: "Activa" | "Pendiente" | "Finalizada";
  onClick?: () => void; // nueva prop
}

export default function AuctionCard({ img, title, price, status, onClick }: Props) {
  return (
    <div
      className="bg-white/10 p-4 rounded-xl text-white cursor-pointer hover:bg-white/20 transition"
      onClick={onClick} // clic aquí
    >
      <img src={img} className="w-full h-40 object-cover rounded mb-2" />
      <p>{title}</p>
      <h4 className="font-bold mt-2">{price}</h4>
      {status && <span className="text-sm mt-1 inline-block">{status}</span>}
    </div>
  );
}
