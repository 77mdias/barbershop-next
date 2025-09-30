"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Database,
  Globe,
  Github,
  ExternalLink,
  Sparkles,
  Target,
} from "lucide-react";
import styles from "@/app/scss/components/CourseCard.module.scss";

const ProjectInfoCompact = () => {
  const technologies = [
    { name: "Next.js 15", icon: Code, color: "text-blue-400" },
    { name: "Prisma ORM", icon: Database, color: "text-emerald-400" },
    { name: "Neon Database", icon: Globe, color: "text-cyan-400" },
    { name: "TypeScript", icon: Code, color: "text-blue-500" },
    { name: "Tailwind CSS", icon: Sparkles, color: "text-cyan-500" },
    { name: "Radix UI", icon: Target, color: "text-purple-400" },
  ];

  return (
    <section className="relative py-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Code className="mr-2 h-4 w-4" />
            Projeto de Desenvolvimento
          </Badge>
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Sobre o{" "}
            <span
              className={`${styles.bgGradientPrimary} bg-clip-text text-transparent`}
            >
              Projeto
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Plataforma de cursos de Valorant criada como portfólio profissional
            para demonstrar habilidades em desenvolvimento full-stack
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Project Description */}
          <div className="lg:col-span-2">
            <div className="space-y-4 text-muted-foreground">
              <p>
                Este projeto foi desenvolvido como um{" "}
                <strong className="text-foreground">
                  portfólio profissional
                </strong>{" "}
                para demonstrar habilidades em desenvolvimento web moderno,
                combinando design atrativo com funcionalidades robustas.
              </p>
              <p>
                A plataforma simula uma academia de Valorant completa,
                oferecendo{" "}
                <strong className="text-foreground">experiência prática</strong>
                em implementação de sistemas de cursos, autenticação de usuários
                e gestão de conteúdo.
              </p>
              <p>
                Ideal para{" "}
                <strong className="text-foreground">
                  venda de experiência e conteúdo
                </strong>
                , o projeto demonstra como criar uma aplicação escalável e
                profissional usando as melhores práticas de desenvolvimento.
              </p>
            </div>
          </div>

          {/* Technologies & Links */}
          <div className="space-y-6">
            {/* Technologies */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-foreground">
                Stack Tecnológico
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <tech.icon className={`h-4 w-4 ${tech.color}`} />
                    <span className="text-sm font-medium text-foreground">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Links */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">
                Links do Projeto
              </h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="group border-primary/30 transition-all duration-300 hover:border-primary hover:bg-primary/10"
                  onClick={() =>
                    window.open(
                      "https://github.com/77mdias/valorant-ascension-next",
                      "_blank"
                    )
                  }
                >
                  <Github className="mr-2 h-4 w-4" />
                  Ver no GitHub
                  <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="sm"
                  className={`${styles.bgGradientPrimary} ${styles.buttonPrimary} text-primary-foreground transition-all duration-300`}
                  onClick={() =>
                    window.open(
                      "https://valorant-ascension-next.vercel.app",
                      "_blank"
                    )
                  }
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Demo Online
                  <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfoCompact;
