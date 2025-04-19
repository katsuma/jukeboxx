import type { ReactNode } from "react";

export const Header = ({ children }: { children?: ReactNode }) => {
  return (
    <a href="/">
      <header className="mb-12 text-center">
        <picture>
          <source srcSet="/logo-darkmode.png" media="(prefers-color-scheme:dark)" />
          <source srcSet="/logo.png" />
          <img src="/logo.png" alt="Jukeboxx" className="h-24 w-24 inline-block mr-2" />
        </picture>
        <h1 className="text-4xl font-bold">Jukeboxx</h1>
        {children && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
            {children}
          </p>
        )}
      </header>
    </a>
  );
}
