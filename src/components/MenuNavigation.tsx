import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";


import React from "react";

import { HelpCircle, LogOut, Menu, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

const MenuNavigation = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="h-6 w-6 animate-pulse rounded bg-gray-600"></div>;
  }

  if (isAuthenticated && user) {
    return (
      <>
        {/* Desktop - Menu */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuItem className="list-none">
            <NavigationMenuTrigger>
              <Menu size={24} className="text-foreground/80" />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex">
              <ul className="grid w-[200px] list-none gap-4">
                <li className="flex flex-col py-3">
                  <NavigationMenuLink
                    asChild
                    className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <Link href="/profile">Perfil</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <Link href="/profile/settings">Configurações</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <Link href="#">Suporte</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    onClick={() => signOut()}
                    className="cursor-pointer p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    Sair
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenu>

        {/* Mobile - Ícone de Usuário */}
        <NavigationMenu className="md:hidden ">
          <NavigationMenuItem className="list-none">
            <NavigationMenuTrigger className="flex items-center text-black justify-center rounded-full border transition-all duration-300 hover:from-[#D13F6A] hover:to-[#7A3DD8]">
              <User size={16} className="text-white"/>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex">
              <ul className="grid w-[200px] list-none gap-4">
                <li className="flex flex-col py-3">
                  <NavigationMenuLink
                    asChild
                    className="flex items-center gap-3 p-3 px-5 text-black transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <Link href="/profile">
                      <User size={16} />
                      Perfil
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className="flex items-center gap-3 p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <Link href="/profile/settings">
                      <Settings size={16} />
                      Configurações
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className="flex items-center gap-3 p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <Link href="#">
                      <HelpCircle size={16} />
                      Suporte
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    onClick={() => signOut()}
                    className="flex cursor-pointer items-center gap-3 p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                  >
                    <LogOut size={16} />
                    Sair
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenu>
      </>
    );
  }

  return (
    <>
      {/* Desktop - Menu */}
      <NavigationMenu className="hidden rounded-md md:block">
        <NavigationMenuItem className="list-none">
          <NavigationMenuTrigger className="flex items-center">
            <Menu size={24} className="text-foreground/80" />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="flex">
            <ul className="grid w-[200px] list-none gap-4">
              <li className="flex flex-col py-3">
                <NavigationMenuLink
                  asChild
                  className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                >
                  <Link href="/auth/signin">Entrar</Link>
                </NavigationMenuLink>
                <NavigationMenuLink
                  asChild
                  className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                >
                  <Link href="/auth/signup">Cadastrar</Link>
                </NavigationMenuLink>
                <NavigationMenuLink
                  asChild
                  className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                >
                  <Link href="#">Suporte</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenu>

      {/* Mobile - Ícone de Usuário */}
      <NavigationMenu className="md:hidden">
        <NavigationMenuItem className="list-none">
          <NavigationMenuTrigger className="flex items-center justify-center rounded-full transition-all duration-300 hover:from-[#D13F6A] hover:to-[#7A3DD8]">
            <User size={16} className="text-black" />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="flex">
            <ul className="grid w-[200px] list-none gap-4">
              <li className="flex flex-col py-3">
                <NavigationMenuLink
                  asChild
                  className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                >
                  <Link href="/auth/signin">Entrar</Link>
                </NavigationMenuLink>
                <NavigationMenuLink
                  asChild
                  className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                >
                  <Link href="/auth/signup">Cadastrar</Link>
                </NavigationMenuLink>
                <NavigationMenuLink
                  asChild
                  className="p-3 px-5 text-foreground/80 transition-colors hover:bg-[#E7517B] hover:text-white"
                >
                  <Link href="#">Suporte</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenu>
    </>
  );
};

export default MenuNavigation;