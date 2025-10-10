// lib/utils/swagger/index.ts
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerDefinition } from "./definition";
import { paths } from "./paths";
import { schemas } from "./schemas";

// Complete swagger definition
const completeSwaggerDefinition = {
  ...swaggerDefinition,
  paths,
  components: {
    ...swaggerDefinition.components,
    schemas,
  },
};

const options = {
  definition: completeSwaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;