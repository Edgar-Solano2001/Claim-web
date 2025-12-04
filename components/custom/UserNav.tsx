"use client";

import { useEffect, useState } from "react"; // <--- Importamos Hooks
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase-config"; // <--- Importamos db
import { doc, getDoc } from "firebase/firestore"; // <--- Importamos funciones de Firestore
import toast from "react-hot-toast";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserNav() {
  const { user } = useAuth();
  
  // Estado local para guardar los datos frescos de la base de datos
  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    email: ""
  });

  // Efecto para descargar la info de Firestore cuando carga el componente
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            setProfileData({
              displayName: data.displayName || user.displayName || "Usuario",
              photoURL: data.photoURL || user.photoURL || "",
              email: data.email || user.email || ""
            });
          } else {
            setProfileData({
              displayName: user.displayName || "Usuario",
              photoURL: user.photoURL || "",
              email: user.email || ""
            });
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Función Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  if (!user) return null;

  // Calculamos iniciales usando el nombre obtenido de Firestore
  const currentName = profileData.displayName || "Usuario";
  const initials = currentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2">
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-purple-200 hover:ring-purple-400 transition-all p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={profileData.photoURL} 
              alt={currentName} 
              className="object-cover" 
            />
            <AvatarFallback className="bg-purple-700 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
        <span className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded">{currentName}</span>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-white dark:bg-purple-950 border-purple-100 dark:border-purple-800" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-purple-900 dark:text-purple-100">
              {currentName}
            </p>
            <p className="text-xs leading-none text-purple-500 dark:text-purple-300 truncate">
              {profileData.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-purple-100 dark:bg-purple-800" />
        
        <DropdownMenuGroup>
          <Link href="/perfil">
            <DropdownMenuItem className="cursor-pointer text-purple-700 dark:text-purple-200 focus:bg-purple-50 dark:focus:bg-purple-900 focus:text-purple-800">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-purple-100 dark:bg-purple-800" />
        
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}