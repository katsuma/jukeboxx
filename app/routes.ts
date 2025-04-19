import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/:queueId", "routes/queue.tsx")
] satisfies RouteConfig;
