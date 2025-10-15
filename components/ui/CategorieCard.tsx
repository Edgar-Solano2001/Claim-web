import Image from "next/image";

export default function CategorieCard() {
    return (
        <>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center">
                <Image
                                src="/Claim_Logo.svg"
                                alt="Subasta 1"
                                width={64}
                                height={64}
                                className="w-16 h-16 m-4"
                                priority
                              />
                              <p className="text-lg text-blue-600 dark:text-blue-300">Arte</p>
            </div>
        </>
    );
};
