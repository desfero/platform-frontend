import * as yup from "yup";

import { StorageSchema } from "../../storage";

const JWTSchema = yup.string().required();

// yup InferType do not support primitive schemas.
// Will do a pr maybe to add a support as it's quite useful
export type TJWT = string;

const JWTStorageSchema = new StorageSchema<TJWT>(1, "JWTSchema", JWTSchema);

export { JWTStorageSchema };
