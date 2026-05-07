/// <reference types="vite/client" />

declare module '*.yaml?raw' {
  const content: string;
  export default content;
}

declare module '*.ghml?raw' {
  const content: string;
  export default content;
}
