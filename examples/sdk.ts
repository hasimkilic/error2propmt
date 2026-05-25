import { createErrorContext } from "error2prompt";

const context = createErrorContext(new Error("Text content does not match server-rendered HTML."));

console.log(context.markdown);