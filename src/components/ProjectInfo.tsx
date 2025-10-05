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
  Users,
} from "lucide-react";
import styles from "@/app/scss/components/CourseCard.module.scss";

const ProjectInfo = () => {
  const technologies = [
    { name: "Next.js 15", icon: Code, color: "text-blue-400" },
    { name: "Prisma ORM", icon: Database, color: "text-emerald-400" },
    { name: "Neon Database", icon: Globe, color: "text-cyan-400" },
    { name: "TypeScript", icon: Code, color: "text-blue-500" },
    { name: "Tailwind CSS", icon: Sparkles, color: "text-cyan-500" },
    { name: "Radix UI", icon: Target, color: "text-purple-400" },
  ];

  const features = [
    {
      title: "Portfólio Profissional",
      description:
        "Demonstração de habilidades em desenvolvimento full-stack com tecnologias modernas",
      icon: Users,
    },
    {
      title: "Experiência Prática",
      description:
        "Implementação de funcionalidades reais como autenticação, banco de dados e UI/UX",
      icon: Target,
    },
    {
      title: "Conteúdo Educativo",
      description:
        "Plataforma funcional para venda de cursos e conteúdo sobre Valorant",
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-[var(--card-product)] text-[var(--text)] hover:bg-primary/20">
            <Code className="mr-2 h-4 w-4" />
            Projeto de Desenvolvimento
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Sobre o{" "}
            <span
              className={` bg-clip-text`}
            >
              Projeto
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Uma plataforma moderna de cursos de Valorant criada para demonstrar
            habilidades de desenvolvimento full-stack
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column - Project Description */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                NeXT Academy - Valorant Ascension
              </h3>
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
                  <strong className="text-foreground">
                    experiência prática
                  </strong>
                  em implementação de sistemas de cursos, autenticação de
                  usuários e gestão de conteúdo.
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

            {/* Features */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">
                Principais Objetivos
              </h4>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <div>
                      <h5 className="font-medium text-foreground">
                        {feature.title}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Technologies */}
          <div className="space-y-8">
            <div>
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Stack Tecnológico
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <tech.icon className={`h-5 w-5 ${tech.color}`} />
                    <span className="font-medium text-foreground">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">
                Links do Projeto
              </h4>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
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

            {/* Project Stats */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="mb-4 text-lg font-semibold text-foreground">
                Estatísticas do Projeto
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">37+</div>
                  <div className="text-sm text-muted-foreground">
                    Componentes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Páginas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">
                    TypeScript
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">125+</div>
                  <div className="text-sm text-muted-foreground">
                    Arquivos TS/TSX
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfo;
