export namespace Route {
  export type MetaArgs = {
    params: Record<string, string>;
    data?: any;
  };

  export type ActionArgs = {
    request: Request;
    params: Record<string, string>;
  };

  export type ActionData = {
    success?: boolean;
    error?: string;
    queueId?: string;
  };
}
