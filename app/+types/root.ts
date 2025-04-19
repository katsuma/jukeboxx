export namespace Route {
  export type LinksFunction = () => Array<{
    rel: string;
    href: string;
    media?: string;
    crossOrigin?: string;
  }>;

  export type ErrorBoundaryProps = {
    error: any;
  };

  export type MetaArgs = {
    params: Record<string, string>;
    data?: any; // loaderから返されるデータ
  };
}
