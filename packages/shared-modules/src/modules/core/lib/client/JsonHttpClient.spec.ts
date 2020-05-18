import { expectToBeRejected } from "@neufund/shared-utils/tests";
import { expect } from "chai";
import fetchMock from "fetch-mock";
import * as Yup from "yup";

import { getSampleMalformedProducts, getSampleProducts, IProduct, productSchema } from "./fixtures";
import { NetworkingError, ResponseParsingError, ResponseStatusError } from "./HttpClient";
import { JsonHttpClient } from "./JsonHttpClient";

describe("JsonHttpClient", () => {
  const ROOT_URL = "https://platform.neufund.io";
  const API_URL = "v2/api";

  const httpClient = new JsonHttpClient(ROOT_URL);

  afterEach(() => {
    expect(fetchMock.done()).to.be.true;
    fetchMock.restore();
  });

  describe("get requests", () => {
    it("should make GET request and parse the response", async () => {
      const mockedResponse = getSampleProducts();
      fetchMock.once(`${ROOT_URL}/${API_URL}/products`, {
        status: 200,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.get<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should work with query parameters", async () => {
      const mockedResponse = getSampleProducts();
      fetchMock.once(`${ROOT_URL}/${API_URL}/products?some=param&some2=param2`, {
        status: 200,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.get<Array<IProduct>>({
        baseUrl: API_URL,
        url: "products",
        queryParams: {
          some: "param",
          some2: "param2",
        },
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should work without baseUrl param", async () => {
      const mockedResponse = getSampleProducts();
      fetchMock.once(`${ROOT_URL}/${API_URL}/products`, {
        status: 200,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.get<IProduct[]>({
        url: `${API_URL}/products`,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should work with custom headers", async () => {
      const customHeaders = {
        apiToken: "some dummy token",
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${ROOT_URL}/${API_URL}/products`) {
          return false;
        }
        if (opts.method !== "GET") {
          return false;
        }
        if ((opts as any).headers.apiToken !== customHeaders.apiToken) {
          return false;
        }
        return true;
      };
      fetchMock.once(requestMatcher, {
        status: 200,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.get<IProduct[]>({
        url: `${API_URL}/products`,
        headers: customHeaders,
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should throw an error on malformed response (missing fields)", async () => {
      const expectedResponse = getSampleMalformedProducts();
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        status: 200,
        body: expectedResponse,
      });

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new ResponseParsingError(`/${API_URL}/products`, "[0].quantity is a required field"),
      );
    });

    it("should throw an error on malformed response (non json)", async () => {
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        status: 200,
        body: "not a json",
        sendAsJson: false,
      });

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new ResponseParsingError(`/${API_URL}/products`, "Response is not a json"),
      );
    });

    it("should not validate schema on non 2xx response", async () => {
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        status: 404,
        body: { error: "missing" },
      });

      const actual = await httpClient.get<Array<IProduct>>({
        baseUrl: API_URL,
        url: "products",
        allowedStatusCodes: [404],
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actual).to.be.deep.eq({
        statusCode: 404,
        body: {
          error: "missing",
        },
      });
    });

    it("should throw an error on malformed response totally different objects", async () => {
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        status: 200,
        body: {
          new_user: {
            backup_codes_verified: true,
            salt: "e5GiSRkNa3SA8oFBJtuJfxyqs7YXEtMl4eFn3PNkwAI=",
            unverified_email: "chris@kaczor.io",
          },
        },
      });

      const res = await httpClient.get<Array<IProduct>>({
        baseUrl: API_URL,
        url: "products",
        responseSchema: Yup.object()
          .shape({
            backupCodesVerified: Yup.boolean(),
            language: Yup.string(),
            unverifiedEmail: Yup.string(),
            verifiedEmail: Yup.string(),
          })
          .required(),
      });

      expect(res).to.be.deep.eq({
        statusCode: 200,
        body: {},
      });
    });

    it("should throw an error on non 20x response", async () => {
      const expectedErrorMessage = "error message";
      const expectedStatusCode = 500;
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        status: expectedStatusCode,
        body: { errorMessage: expectedErrorMessage },
      });

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new ResponseStatusError(`/${API_URL}/products`, 500),
      );
    });

    it("should not throw when status code is on allowed list", async () => {
      const expectedErrorMessage = { msg: "not-found!" };
      const expectedStatusCode = 404;
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        status: expectedStatusCode,
        body: JSON.stringify(expectedErrorMessage),
      });

      const response = await httpClient.get<Array<IProduct>>({
        baseUrl: API_URL,
        url: "products",
        allowedStatusCodes: [404],
      });

      expect(response).to.be.deep.eq({
        statusCode: expectedStatusCode,
        body: expectedErrorMessage,
      });
    });

    it("should throw an error on networking problems", async () => {
      fetchMock.mock(`${ROOT_URL}/${API_URL}/products`, {
        throws: true,
      });

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new NetworkingError(`/${API_URL}/products`),
      );
    });
  });

  describe("post requests", () => {
    it("should make POST request", async () => {
      const body = {
        name: "productC",
        quantity: 1,
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${ROOT_URL}/${API_URL}/products`) {
          return false;
        }
        if (opts.method !== "POST") {
          return false;
        }
        if ((opts as any).body !== JSON.stringify(body)) {
          return false;
        }
        return true;
      };
      fetchMock.postOnce(requestMatcher, {
        status: 201,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.post<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        body: body,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(201);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });
  });

  describe("put requests", () => {
    it("should make PUT request", async () => {
      const body = {
        name: "productC",
        quantity: 1,
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${ROOT_URL}/${API_URL}/products`) {
          return false;
        }
        if (opts.method !== "PUT") {
          return false;
        }
        if ((opts as any).body !== JSON.stringify(body)) {
          return false;
        }
        return true;
      };
      fetchMock.putOnce(requestMatcher, {
        status: 200,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.put<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        body: body,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });
  });

  describe("patch requests", () => {
    it("should make PATCH request", async () => {
      const body = {
        name: "productC",
        quantity: 1,
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${ROOT_URL}/${API_URL}/products`) {
          return false;
        }
        if (opts.method !== "PATCH") {
          return false;
        }
        if ((opts as any).body !== JSON.stringify(body)) {
          return false;
        }
        return true;
      };
      fetchMock.patchOnce(requestMatcher, {
        status: 200,
        body: mockedResponse,
      });

      const actualResponse = await httpClient.patch<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        body: body,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });
  });

  describe("delete requests", () => {
    it("should make DELETE request", async () => {
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${ROOT_URL}/${API_URL}/products`) {
          return false;
        }
        if (opts.method !== "DELETE") {
          return false;
        }
        return true;
      };
      fetchMock.deleteOnce(requestMatcher, {
        status: 204,
      });

      const actualResponse = await httpClient.delete({
        baseUrl: API_URL,
        url: "products",
      });

      expect(actualResponse.statusCode).to.be.eq(204);
      expect(actualResponse.body).to.be.deep.equal({});
    });
  });

  describe("property name transformation", () => {
    it("should transform request body object props to snake case and vice versa", async () => {
      const requestBody = {
        someProperty: "hello",
        otherProperty: 1,
      };

      const expectedTransformedBody = {
        some_property: "hello",
        other_property: 1,
      };

      let receivedRequestBody: string = "";

      const requestMatcher: fetchMock.MockMatcherFunction = (_url, opts) => {
        receivedRequestBody = (opts as any).body;
        return true;
      };
      fetchMock.postOnce(requestMatcher, {
        status: 201,
        body: expectedTransformedBody,
      });
      const actualResponse = await httpClient.post<IProduct[]>({
        baseUrl: "/",
        url: "products",
        body: requestBody,
      });

      expect(JSON.parse(receivedRequestBody)).to.deep.equal(expectedTransformedBody);
      expect(actualResponse.body).to.deep.equal(requestBody);
    });
  });

  describe("Submitting of files as formdata", () => {
    it("should transform request body object props to snake case and vice versa", async () => {
      const file = new File(["first line", "second line"], "stuff.txt");
      const formData = new FormData();
      formData.append("file", file);

      let receivedHeaders: any;
      let receivedBody: any;
      const requestMatcher: fetchMock.MockMatcherFunction = (_url, opts) => {
        receivedHeaders = opts.headers;
        receivedBody = (opts as any).body;
        return true;
      };
      fetchMock.postOnce(requestMatcher, {
        status: 201,
        body: {},
      });
      await httpClient.post<IProduct[]>({
        baseUrl: "/",
        url: "file",
        formData: formData,
        body: { someProp: "hello" },
      });

      expect(receivedHeaders["Content-Type"]).to.equal(undefined);
      expect(receivedBody).to.equal(formData);
    });
  });
});
