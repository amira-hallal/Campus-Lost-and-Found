const errorResponse = {
  description: "Request failed",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
};

const itemResponse = {
  description: "Item report",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data"],
        properties: { data: { $ref: "#/components/schemas/Item" } },
      },
    },
  },
};

const itemId = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "M.A.R.S Campus Lost & Found API",
    version: "1.0.0",
    description: "API for reporting and finding lost items around campus. Local item data resets when the server restarts.",
  },
  servers: [{ url: "http://localhost:4000", description: "Local development" }],
  tags: [{ name: "Items", description: "Lost and found item reports" }],
  paths: {
    "/api/health": {
      get: {
        summary: "Check that the API is running",
        responses: { 200: { description: "API is available" } },
      },
    },
    "/api/items": {
      get: {
        tags: ["Items"],
        summary: "List and filter item reports",
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["lost", "found"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "locationId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["open", "claimed", "closed"] } },
          { name: "q", in: "query", description: "Search title and description", schema: { type: "string" } },
          { name: "from", in: "query", description: "Earliest report date, YYYY-MM-DD", schema: { type: "string", format: "date" } },
          { name: "to", in: "query", description: "Latest report date, YYYY-MM-DD", schema: { type: "string", format: "date" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "oldest"], default: "newest" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          200: {
            description: "Paginated item reports",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ItemListResponse" } } },
          },
          400: errorResponse,
        },
      },
      post: {
        tags: ["Items"],
        summary: "Create an item report",
        description: "For now, postedBy is supplied in the request body. Once sign-in is connected, the server should take this value from the signed-in user instead.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/NewItem" } } },
        },
        responses: { 201: itemResponse, 400: errorResponse },
      },
    },
    "/api/items/{id}": {
      parameters: [itemId],
      get: {
        tags: ["Items"],
        summary: "Get an item report",
        responses: { 200: itemResponse, 400: errorResponse, 404: errorResponse },
      },
      patch: {
        tags: ["Items"],
        summary: "Update an item report",
        description: "Only the person who reported an item should be able to update or close it. Ownership checks will be added with sign-in.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateItem" } } },
        },
        responses: { 200: itemResponse, 400: errorResponse, 404: errorResponse },
      },
      delete: {
        tags: ["Items"],
        summary: "Delete an item report",
        description: "Only the person who reported an item should be able to delete it. Ownership checks will be added with sign-in.",
        responses: { 204: { description: "Report deleted" }, 404: errorResponse },
      },
    },
  },
  components: {
    schemas: {
      Item: {
        type: "object",
        required: ["id", "type", "title", "category", "locationId", "date", "description", "status", "postedBy"],
        properties: {
          id: { type: "integer", example: 12 },
          type: { type: "string", enum: ["lost", "found"] },
          title: { type: "string", example: "Blue backpack" },
          category: { type: "string", example: "Bags" },
          locationId: { type: "integer", example: 2 },
          date: { type: "string", format: "date" },
          description: { type: "string" },
          image: { type: "string" },
          status: { type: "string", enum: ["open", "claimed", "closed"] },
          postedBy: { type: "integer", example: 1 },
          color: { type: "string" },
          brand: { type: "string" },
          marks: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      NewItem: {
        type: "object",
        required: ["type", "title", "category", "locationId", "date", "description", "postedBy"],
        properties: {
          type: { type: "string", enum: ["lost", "found"] },
          title: { type: "string", minLength: 2, maxLength: 120 },
          category: { type: "string" },
          locationId: { type: "integer", minimum: 1 },
          date: { type: "string", format: "date" },
          description: { type: "string", minLength: 10, maxLength: 1000 },
          image: { type: "string" },
          postedBy: { type: "integer", minimum: 1 },
          color: { type: "string" },
          brand: { type: "string" },
          marks: { type: "string" },
        },
      },
      UpdateItem: {
        type: "object",
        minProperties: 1,
        properties: {
          type: { type: "string", enum: ["lost", "found"] },
          title: { type: "string", minLength: 2, maxLength: 120 },
          category: { type: "string" },
          locationId: { type: "integer", minimum: 1 },
          date: { type: "string", format: "date" },
          description: { type: "string", minLength: 10, maxLength: 1000 },
          image: { type: "string" },
          status: { type: "string", enum: ["open", "claimed", "closed"] },
          color: { type: "string" },
          brand: { type: "string" },
          marks: { type: "string" },
        },
      },
      ItemListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Item" } },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object" },
              requestId: { type: "string", format: "uuid" },
            },
          },
        },
      },
    },
  },
};
