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

// Locations and Claims documentation
const idQuery = (name) => ({ name, in: "query", schema: { type: "integer", minimum: 1 } });
const pageParameters = [
  idQuery("page"),
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
];

const jsonContent = (schema) => ({ content: { "application/json": { schema } } });
const schemaRef = (name) => ({ $ref: `#/components/schemas/${name}` });

const dataResponse = (description, name) => ({
  description,
  ...jsonContent({ type: "object", properties: { data: schemaRef(name) } }),
});

const listResponse = (description, name) => ({
  description,
  ...jsonContent({
    type: "object",
    properties: {
      data: { type: "array", items: schemaRef(name) },
      meta: { $ref: "#/components/schemas/ItemListResponse/properties/meta" },
    },
  }),
});

const messageProperty = { type: "string", minLength: 10, maxLength: 500 };

// A protected claim operation, with the errors it can return.
const claimWrite = (summary, description, responses, requestBody) => ({
  tags: ["Claims"],
  summary,
  description,
  security: [{ bearerAuth: [] }],
  ...(requestBody ? { requestBody } : {}),
  responses: {
    ...responses,
    400: errorResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse, 409: errorResponse,
  },
});

const decision = (summary, description) => claimWrite(
  summary,
  description,
  { 200: dataResponse("Decided claim", "Claim") },
  { required: false, ...jsonContent({ type: "object", properties: { ownerNote: { type: "string", maxLength: 200 } } }) },
);

const withdrawal = claimWrite(
  "Withdraw a pending claim",
  "Claimant only. The claim is removed.",
  { 204: { description: "Claim removed" } },
);

const locationAndClaimPaths = {
  "/api/locations": {
    get: {
      tags: ["Locations"],
      summary: "List campus buildings",
      parameters: pageParameters,
      responses: { 200: listResponse("Paginated locations", "Location"), 400: errorResponse },
    },
  },
  "/api/locations/{id}": {
    parameters: [itemId],
    get: {
      tags: ["Locations"],
      summary: "Get a building",
      responses: { 200: dataResponse("Location", "Location"), 400: errorResponse, 404: errorResponse },
    },
  },
  "/api/claims": {
    get: {
      tags: ["Claims"],
      summary: "List and filter claims",
      parameters: [
        idQuery("itemId"),
        idQuery("claimantId"),
        { name: "status", in: "query", schema: { type: "string", enum: ["pending", "approved", "rejected"] } },
        ...pageParameters,
      ],
      responses: { 200: listResponse("Paginated claims", "Claim"), 400: errorResponse },
    },
    post: claimWrite(
      "Claim an item",
      "The claimant is the signed-in user. The item must be open, reported by someone else, and not already claimed by this user.",
      { 201: dataResponse("Created claim", "Claim") },
      {
        required: true,
        ...jsonContent({
          type: "object",
          required: ["itemId", "message"],
          properties: { itemId: { type: "integer", minimum: 1 }, message: messageProperty },
        }),
      },
    ),
  },
  "/api/claims/{id}": {
    parameters: [itemId],
    get: {
      tags: ["Claims"],
      summary: "Get a claim",
      responses: { 200: dataResponse("Claim", "Claim"), 400: errorResponse, 404: errorResponse },
    },
    patch: claimWrite(
      "Edit a pending claim",
      "Claimant only. Only the message can change.",
      { 200: dataResponse("Updated claim", "Claim") },
      {
        required: true,
        ...jsonContent({ type: "object", required: ["message"], properties: { message: messageProperty } }),
      },
    ),
    delete: withdrawal,
  },
  "/api/claims/{id}/approve": {
    parameters: [itemId],
    post: decision("Approve a claim", "Item reporter only. Marks the item as claimed and rejects its other pending claims."),
  },
  "/api/claims/{id}/reject": {
    parameters: [itemId],
    post: decision("Reject a claim", "Item reporter only."),
  },
  "/api/claims/{id}/withdraw": { parameters: [itemId], post: withdrawal },
};

const textFields = (...names) => Object.fromEntries(names.map((name) => [name, { type: "string" }]));

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "M.A.R.S Campus Lost & Found API",
    version: "1.0.0",
    description: "API for reporting and finding lost items around campus. Local item data resets when the server restarts.",
  },
  servers: [{ url: "http://localhost:4000", description: "Local development" }],
  tags: [
    { name: "Items", description: "Lost and found item reports" },
    { name: "Locations", description: "Campus buildings" },
    { name: "Claims", description: "Claims on item reports" },
  ],
  paths: {
    ...locationAndClaimPaths,
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
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Location: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          ...textFields("name", "code", "description", "hours", "dropOffPoint", "image"),
        },
      },
      Claim: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          itemId: { type: "integer", example: 5 },
          claimantId: { type: "integer", example: 3 },
          message: messageProperty,
          date: { type: "string", format: "date" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          ...textFields("ownerNote", "decidedAt"),
        },
      },
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
