export namespace Route {
  export type MetaArgs = {
    params: Record<string, string>;
    data?: any;
  };

  export type LoaderArgs = {
    params: Record<string, string>;
  };
}
